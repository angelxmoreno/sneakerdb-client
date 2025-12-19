import { beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import Keyv from '@keyvhq/core';

import type { GetSneakersResponse, MethodResponse, SearchResponse, Sneaker, SortOption } from './interfaces';
import { TheSneakerDatabaseClient } from './TheSneakerDatabaseClient';

type NonNullableResponse<T> = Exclude<T, undefined>;

const rapidApiKey = Bun.env.RAPID_API_KEY;
const shouldRunE2E = Boolean(rapidApiKey && Bun.env.RUN_E2E === 'true');
let client: TheSneakerDatabaseClient;
let cache: Keyv;

const expectSuccessful = <T>(result: MethodResponse<T>, exceptionMessage?: () => string): NonNullableResponse<T> => {
    if (!result.success) {
        const errorMessage = exceptionMessage ? exceptionMessage() : 'Expected request to succeed';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    expect(result.success).toBe(true);
    return result.response as NonNullableResponse<T>;
};

if (!shouldRunE2E) {
    describe.skip('TheSneakerDatabaseClient:e2e', () => {});
} else {
    describe('TheSneakerDatabaseClient:e2e', () => {
        beforeAll(() => {
            cache = new Keyv();
            client = new TheSneakerDatabaseClient({ rapidApiKey: rapidApiKey ?? '', cache });
        });
        beforeEach(async () => {
            await Bun.sleep(1500);
        });
        describe('->getSneakers()', () => {
            it('returns paginated sneaker data', async () => {
                const options = { limit: 10 };
                const result = await client.getSneakers(options);
                const payload = expectSuccessful<GetSneakersResponse>(result);

                expect(payload.count).toBeGreaterThan(0);
                expect(payload.results.length).toBeGreaterThan(0);
                expect(payload.results[0]).toHaveProperty('id');
            });

            const sortableFields: SortOption['field'][] = [
                'name',
                'silhouette',
                'retailPrice',
                'releaseDate',
                'releaseYear',
            ];

            for (const field of sortableFields) {
                it(`supports sorting by ${field}`, async () => {
                    const result = await client.getSneakers({
                        limit: 10,
                        brand: 'Jordan',
                        sort: { field, order: 'desc' },
                    });
                    expectSuccessful<GetSneakersResponse>(result, () => `${field} is not valid for sorting`);
                });
            }
        });

        describe('->getSneakerById()', () => {
            it('returns a specific sneaker', async () => {
                const knownSneakerId = '5338a798-ac8b-442f-a8b2-71d3a79311a5';
                const result = await client.getSneakerById(knownSneakerId);
                const sneakers = expectSuccessful<Sneaker[]>(result);

                expect(sneakers.length).toBeGreaterThan(0);
                expect(sneakers[0]?.id).toBe(knownSneakerId);
                expect(sneakers[0]).toHaveProperty('name');
            });
        });

        describe('->getBrands()', () => {
            it('returns list of brands', async () => {
                const result = await client.getBrands();
                const brands = expectSuccessful<string[]>(result);

                expect(brands.length).toBeGreaterThan(0);
                expect(typeof brands[0]).toBe('string');
            });
        });

        describe('->getGenders()', () => {
            it('returns list of genders', async () => {
                const result = await client.getGenders();
                const genders = expectSuccessful<string[]>(result);

                expect(genders.length).toBeGreaterThan(0);
                expect(typeof genders[0]).toBe('string');
            });
        });

        describe('->search()', () => {
            it('returns matched sneakers', async () => {
                const result = await client.search({ query: 'Jordan', limit: 10 });
                const payload = expectSuccessful<SearchResponse>(result);

                expect(payload.count).toBeGreaterThan(0);
                expect(payload.results.length).toBeGreaterThan(0);
                expect(payload.results[0]).toHaveProperty('name');
            });
        });

        describe('cache integration', () => {
            it('serves cached responses when the network is unavailable', async () => {
                const options = { limit: 10 };
                const first = await client.getSneakers(options);
                expectSuccessful(first);

                const originalGet = client.client.get.bind(client.client);
                client.client.get = () => {
                    throw new Error('network disabled');
                };

                try {
                    const cached = await client.getSneakers(options);
                    expectSuccessful(cached);
                } finally {
                    client.client.get = originalGet;
                }
            });

            it('skips the cache when skipCache is true', async () => {
                const options = { limit: 10 };
                await client.getSneakers(options);
                const originalGet = client.client.get.bind(client.client);
                client.client.get = () => {
                    throw new Error('forced network');
                };

                try {
                    const bypass = await client.getSneakers({ ...options, skipCache: true });
                    expect(bypass.success).toBe(false);
                    if (bypass.success) {
                        throw new Error('Expected cache bypass to fail without network');
                    }
                    expect(bypass.error).toBeInstanceOf(Error);
                } finally {
                    client.client.get = originalGet;
                }
            });
        });
    });
}
