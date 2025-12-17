import { beforeAll, describe, expect, it } from 'bun:test';

import type { GetSneakersResponse, MethodResponse, SearchResponse, Sneaker } from './interfaces';
import { TheSneakerDatabaseClient } from './TheSneakerDatabaseClient';

type NonNullableResponse<T> = Exclude<T, undefined>;

const rapidApiKey = Bun.env.RAPID_API_KEY;
const shouldRunE2E = Boolean(rapidApiKey && Bun.env.RUN_E2E === 'true');
let client: TheSneakerDatabaseClient;

const expectSuccessful = <T>(result: MethodResponse<T>): NonNullableResponse<T> => {
    expect(result.error).toBeUndefined();
    expect(result.response).toBeDefined();
    return result.response as NonNullableResponse<T>;
};

describe.skipIf(!shouldRunE2E)('TheSneakerDatabaseClient:e2e', () => {
    beforeAll(() => {
        client = new TheSneakerDatabaseClient(rapidApiKey ?? '');
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
});
