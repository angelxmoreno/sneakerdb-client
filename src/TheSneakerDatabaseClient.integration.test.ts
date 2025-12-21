import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import Keyv from '@keyvhq/core';
import MockAdapter from 'axios-mock-adapter';
import type {
    FilterOperator,
    FilterOption,
    FilterValue,
    GetSneakersOptions,
    GetSneakersResponse,
    SearchOptions,
    SearchResponse,
    Sneaker,
} from './interfaces';
import { FILTERABLE_FIELDS } from './interfaces';
import { TheSneakerDatabaseClient } from './TheSneakerDatabaseClient';

describe('TheSneakerDatabaseClient', () => {
    let theSneakerDBClient: TheSneakerDatabaseClient;
    let cache: Keyv;
    let mockAxios: MockAdapter;
    const sneakerData: Sneaker = {
        id: '5338a798-ac8b-442f-a8b2-71d3a79311a5',
        brand: 'Jordan',
        colorway: 'White/Black/Dark Mocha',
        estimatedMarketValue: 120,
        gender: 'youth',
        image: {
            original: '',
            small: '',
            thumbnail: '',
        },
        links: {
            stockX: '',
            goat: 'https://goat.com/sneakers/air-jordan-1-retro-low-og-gs-mocha-cz0858-102',
            flightClub: 'https://flightclub.com/air-jordan-1-retro-low-og-gs-mocha-cz0858-102',
            stadiumGoods: '',
        },
        name: "Air Jordan 1 Retro Low OG GS 'Mocha'",
        releaseDate: new Date('2024-08-21'),
        releaseYear: 2024,
        retailPrice: 120,
        silhouette: 'Air Jordan 1',
        sku: 'CZ0858-102',
        story: 'The Air Jordan 1 Retro Low OG GS ‘Mocha’ showcases...',
    };
    const getHistoryRequests = () => mockAxios.history.get ?? [];
    const expectSingleHistoryRequest = () => {
        const history = getHistoryRequests();
        expect(history).toHaveLength(1);
        const [request] = history;
        if (!request) {
            throw new Error('Expected request to be recorded');
        }

        return request;
    };

    const filterFixtures: Record<FilterOption['field'], { operator: FilterOperator; value: FilterValue }> = {
        releaseDate: { operator: 'gte', value: new Date('2020-01-01') },
        releaseYear: { operator: 'gte', value: 2020 },
        retailPrice: { operator: 'gte', value: 100 },
    };

    beforeEach(() => {
        cache = new Keyv();
        theSneakerDBClient = new TheSneakerDatabaseClient({ rapidApiKey: 'your-api-key', cache });
        mockAxios = new MockAdapter(theSneakerDBClient.client);
    });

    afterEach(() => {
        mockAxios.reset();
    });
    it('should handle getSneakers request', async () => {
        const options: GetSneakersOptions = {
            limit: 100,
            name: 'Air Jordan 1 Retro Low OG GS',
            brand: 'Jordan',
            colorway: 'White/Black/Dark Mocha',
            gender: 'youth',
            page: 1,
            releaseDate: '2024-08-21',
            sku: 'CZ0858-102',
            releaseYear: '2024',
            sort: { field: 'releaseDate', order: 'desc' },
            silhouette: 'Air Jordan 1',
        };
        const responseObj: GetSneakersResponse = {
            count: 1,
            results: [sneakerData],
        };
        const expectedParams = { ...options, sort: 'releaseDate:desc' };
        mockAxios.onGet('/sneakers', { params: expectedParams }).reply(200, responseObj);
        const response = await theSneakerDBClient.getSneakers(options);

        expect(response.success).toBe(true);
        if (!response.success) {
            throw new Error('Expected request to succeed');
        }
        expect(response.response).toEqual(responseObj);
        const request = expectSingleHistoryRequest();
        expect(request.url).toBe('/sneakers');
        expect(request.params).toEqual(expectedParams);
    });

    it('should handle getSneakers request with an error', async () => {
        mockAxios.onGet('/sneakers', { params: { limit: 100 } }).reply(500, 'Internal Server Error');
        const response = await theSneakerDBClient.getSneakers({ limit: 100 });
        expect(response.success).toBe(false);
        if (response.success) {
            throw new Error('Expected request to fail');
        }
        expect(response.error).toBeTruthy();
    });

    it('should handle getSneakerById request', async () => {
        const sneakerId = '5338a798-ac8b-442f-a8b2-71d3a79311a5';
        const responseObj: Sneaker[] = [sneakerData];
        mockAxios.onGet(`/sneakers/${sneakerId}`).reply(200, responseObj);
        const response = await theSneakerDBClient.getSneakerById(sneakerId);

        expect(response.success).toBe(true);
        if (!response.success) {
            throw new Error('Expected request to succeed');
        }
        expect(response.response).toEqual(responseObj);
        const request = expectSingleHistoryRequest();
        expect(request.url).toBe(`/sneakers/${sneakerId}`);
    });

    it('should handle getSneakerById request with an error', async () => {
        const sneakerId = 'nonexistent-id';
        mockAxios.onGet(`/sneakers/${sneakerId}`).reply(404, 'Not Found');
        const response = await theSneakerDBClient.getSneakerById(sneakerId);

        expect(response.success).toBe(false);
        if (response.success) {
            throw new Error('Expected request to fail');
        }
        expect(response.error).toBeTruthy();
        const request = expectSingleHistoryRequest();
        expect(request.url).toBe(`/sneakers/${sneakerId}`);
    });

    it('should handle search request', async () => {
        const searchOptions: SearchOptions = {
            query: 'Air Jordan 1',
            page: 1,
            limit: 100,
        };
        const responseObj: SearchResponse = {
            count: 1,
            totalPages: 1,
            results: [sneakerData],
        };
        mockAxios.onGet('/search', { params: searchOptions }).reply(200, responseObj);
        const response = await theSneakerDBClient.search(searchOptions);

        expect(response.success).toBe(true);
        if (!response.success) {
            throw new Error('Expected request to succeed');
        }
        expect(response.response).toEqual(responseObj);
        const request = expectSingleHistoryRequest();
        expect(request.url).toBe('/search');
        expect(request.params).toEqual(searchOptions);
    });

    it('should handle search request with an error', async () => {
        const searchOptions: SearchOptions = {
            limit: 100,
            query: 'Nonexistent Sneaker',
        };
        mockAxios.onGet('/search', { params: searchOptions }).reply(404, 'Not Found');
        const response = await theSneakerDBClient.search(searchOptions);

        expect(response.success).toBe(false);
        if (response.success) {
            throw new Error('Expected request to fail');
        }
        expect(response.error).toBeTruthy();
        const request = expectSingleHistoryRequest();
        expect(request.url).toBe('/search');
        expect(request.params).toEqual(searchOptions);
    });

    it('should handle getBrands request', async () => {
        const brands = ['Nike', 'Jordan'];
        mockAxios.onGet('/brands').reply(200, brands);

        const response = await theSneakerDBClient.getBrands();

        expect(response.success).toBe(true);
        if (!response.success) {
            throw new Error('Expected request to succeed');
        }
        expect(response.response).toEqual(brands);
        const request = expectSingleHistoryRequest();
        expect(request.url).toBe('/brands');
    });

    it('should handle getBrands request with an error', async () => {
        mockAxios.onGet('/brands').reply(500, 'Internal Server Error');

        const response = await theSneakerDBClient.getBrands();

        expect(response.success).toBe(false);
        if (response.success) {
            throw new Error('Expected request to fail');
        }
        expect(response.error).toBeTruthy();
        const request = expectSingleHistoryRequest();
        expect(request.url).toBe('/brands');
    });

    it('caches GET requests by default', async () => {
        const options: GetSneakersOptions = { limit: 10 };
        const payload: GetSneakersResponse = { count: 1, results: [sneakerData] };
        mockAxios.onGet('/sneakers', { params: options }).reply(200, payload);

        const first = await theSneakerDBClient.getSneakers(options);
        expect(first.success).toBe(true);
        if (!first.success) {
            throw new Error('Expected cache warm-up to succeed');
        }
        expect(first.response).toEqual(payload);
        expect(getHistoryRequests()).toHaveLength(1);

        const cached = await theSneakerDBClient.getSneakers(options);
        expect(cached.success).toBe(true);
        if (!cached.success) {
            throw new Error('Expected cached response to succeed');
        }
        expect(cached.response.count).toBe(payload.count);
        expect(cached.response.results[0]?.id).toBe(sneakerData.id);
        expect(getHistoryRequests()).toHaveLength(1);
    });

    it('serializes sort options into API format', async () => {
        const options: GetSneakersOptions = {
            limit: 100,
            sort: { field: 'retailPrice', order: 'asc' },
        };
        const payload: GetSneakersResponse = { count: 0, results: [] };
        mockAxios.onGet('/sneakers', { params: { limit: 100, sort: 'retailPrice:asc' } }).reply(200, payload);

        const response = await theSneakerDBClient.getSneakers(options);
        expect(response.success).toBe(true);
        const request = expectSingleHistoryRequest();
        expect(request.params?.sort).toBe('retailPrice:asc');
    });

    it('serializes filters into API format', async () => {
        const options: GetSneakersOptions = {
            limit: 100,
            filters: { field: 'releaseYear', operator: 'gte', value: 2020 },
        };
        const payload: GetSneakersResponse = { count: 0, results: [] };
        mockAxios.onGet('/sneakers', { params: { limit: 100, releaseYear: 'gte:2020' } }).reply(200, payload);

        const response = await theSneakerDBClient.getSneakers(options);
        expect(response.success).toBe(true);
        const request = expectSingleHistoryRequest();
        expect(request.params?.releaseYear).toBe('gte:2020');
        expect(request.params?.filters).toBeUndefined();
    });

    describe('filterable fields', () => {
        for (const field of FILTERABLE_FIELDS) {
            it(`serializes ${field} filters into API format`, async () => {
                const fixture = filterFixtures[field];
                const options: GetSneakersOptions = {
                    limit: 100,
                    filters: { field, operator: fixture.operator, value: fixture.value },
                };
                const normalizedValue =
                    fixture.value instanceof Date ? fixture.value.toISOString().split('T')[0] : String(fixture.value);
                const filtersParam =
                    fixture.operator === 'eq' ? normalizedValue : `${fixture.operator}:${normalizedValue}`;
                const payload: GetSneakersResponse = { count: 0, results: [] };
                mockAxios.onGet('/sneakers', { params: { limit: 100, [field]: filtersParam } }).reply(200, payload);

                const response = await theSneakerDBClient.getSneakers(options);
                expect(response.success).toBe(true);
                const request = expectSingleHistoryRequest();
                expect(request.params?.[field]).toBe(filtersParam);
            });
        }
    });

    it('defaults filter operator to eq when omitted', async () => {
        const options: GetSneakersOptions = {
            limit: 100,
            filters: { field: 'retailPrice', value: 200 },
        };
        const payload: GetSneakersResponse = { count: 0, results: [] };
        mockAxios.onGet('/sneakers', { params: { limit: 100, retailPrice: '200' } }).reply(200, payload);

        const response = await theSneakerDBClient.getSneakers(options);
        expect(response.success).toBe(true);
        const request = expectSingleHistoryRequest();
        expect(request.params?.retailPrice).toBe('200');
    });

    it('applies multiple filters to distinct fields', async () => {
        const filters: FilterOption[] = [
            { field: 'releaseYear', operator: 'gte', value: 2000 },
            { field: 'retailPrice', operator: 'lte', value: 400 },
        ];
        const options: GetSneakersOptions = {
            limit: 100,
            filters,
        };
        const payload: GetSneakersResponse = { count: 0, results: [] };
        mockAxios
            .onGet('/sneakers', {
                params: { limit: 100, releaseYear: 'gte:2000', retailPrice: 'lte:400' },
            })
            .reply(200, payload);

        const response = await theSneakerDBClient.getSneakers(options);
        expect(response.success).toBe(true);
        const request = expectSingleHistoryRequest();
        expect(request.params?.releaseYear).toBe('gte:2000');
        expect(request.params?.retailPrice).toBe('lte:400');
    });

    it('rejects duplicate filters for the same field', async () => {
        const options = {
            limit: 100,
            filters: [
                { field: 'releaseYear', operator: 'gte', value: 2000 },
                { field: 'releaseYear', operator: 'lte', value: 2024 },
            ],
        } as unknown as GetSneakersOptions;

        const response = await theSneakerDBClient.getSneakers(options);
        expect(response.success).toBe(false);
        if (response.success) {
            throw new Error('Expected validation failure');
        }
        expect(response.error).toBeInstanceOf(Error);
        expect(response.error?.message).toMatch(/single filter per field/i);
        expect(getHistoryRequests()).toHaveLength(0);
    });

    it('rejects filters that conflict with explicit query params', async () => {
        const options = {
            limit: 100,
            releaseYear: '2025',
            filters: { field: 'releaseYear', operator: 'gte', value: 2020 },
        } as unknown as GetSneakersOptions;

        const response = await theSneakerDBClient.getSneakers(options);
        expect(response.success).toBe(false);
        if (response.success) {
            throw new Error('Expected validation failure');
        }
        expect(response.error).toBeInstanceOf(Error);
        expect(response.error?.message).toMatch(/conflicts with an existing query parameter/i);
        expect(getHistoryRequests()).toHaveLength(0);
    });

    it('rejects unsupported filter fields', async () => {
        const options = {
            limit: 100,
            filters: { field: 'unknown-field', value: 10 },
        } as unknown as GetSneakersOptions;

        const response = await theSneakerDBClient.getSneakers(options);
        expect(response.success).toBe(false);
        if (response.success) {
            throw new Error('Expected validation failure');
        }
        expect(response.error).toBeInstanceOf(Error);
        expect(response.error?.message).toMatch(/not filterable/i);
        expect(getHistoryRequests()).toHaveLength(0);
    });

    it('respects skipCache flag', async () => {
        const options: GetSneakersOptions = { limit: 10 };
        const primed: GetSneakersResponse = { count: 1, results: [sneakerData] };
        const fresh: GetSneakersResponse = {
            count: 1,
            results: [{ ...sneakerData, id: 'fresh-id' }],
        };
        mockAxios.onGet('/sneakers', { params: options }).replyOnce(200, primed);
        mockAxios.onGet('/sneakers', { params: options }).replyOnce(200, fresh);

        await theSneakerDBClient.getSneakers(options);
        expect(getHistoryRequests()).toHaveLength(1);

        const bypass = await theSneakerDBClient.getSneakers({ ...options, skipCache: true });
        expect(bypass.success).toBe(true);
        if (!bypass.success) {
            throw new Error('Expected bypass response to succeed');
        }
        expect(bypass.response).toEqual(fresh);
        expect(getHistoryRequests()).toHaveLength(2);
    });
});
