import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import Keyv from '@keyvhq/core';
import MockAdapter from 'axios-mock-adapter';
import type { GetSneakersOptions, GetSneakersResponse, SearchOptions, SearchResponse, Sneaker } from './interfaces';
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
            limit: 5,
            name: 'Air Jordan 1 Retro Low OG GS',
            brand: 'Jordan',
            colorway: 'White/Black/Dark Mocha',
            gender: 'youth',
            page: 1,
            releaseDate: '2024-08-21',
            sku: 'CZ0858-102',
            releaseYear: '2024',
            sort: 'release_date',
            silhouette: 'Air Jordan 1',
        };
        const responseObj: GetSneakersResponse = {
            count: 1,
            results: [sneakerData],
        };
        mockAxios.onGet('/sneakers', { params: options }).reply(200, responseObj);
        const response = await theSneakerDBClient.getSneakers(options);

        expect(response.error).toBeUndefined();
        expect(response.response).toBeDefined();
        const request = expectSingleHistoryRequest();
        expect(request.url).toBe('/sneakers');
        expect(request.params).toEqual(options);
    });

    it('should handle getSneakers request with an error', async () => {
        mockAxios.onGet('/sneakers', { params: { limit: 5 } }).reply(500, 'Internal Server Error');
        const response = await theSneakerDBClient.getSneakers({ limit: 5 });
        expect(response.response).toBeUndefined();
        expect(response.error).toBeDefined();
    });

    it('should handle getSneakerById request', async () => {
        const sneakerId = '5338a798-ac8b-442f-a8b2-71d3a79311a5';
        const responseObj: Sneaker[] = [sneakerData];
        mockAxios.onGet(`/sneakers/${sneakerId}`).reply(200, responseObj);
        const response = await theSneakerDBClient.getSneakerById(sneakerId);

        expect(response.error).toBeUndefined();
        expect(response.response).toBeDefined();
        expect(response.response).toEqual(responseObj);
        const request = expectSingleHistoryRequest();
        expect(request.url).toBe(`/sneakers/${sneakerId}`);
    });

    it('should handle getSneakerById request with an error', async () => {
        const sneakerId = 'nonexistent-id';
        mockAxios.onGet(`/sneakers/${sneakerId}`).reply(404, 'Not Found');
        const response = await theSneakerDBClient.getSneakerById(sneakerId);

        expect(response.response).toBeUndefined();
        expect(response.error).toBeDefined();
        const request = expectSingleHistoryRequest();
        expect(request.url).toBe(`/sneakers/${sneakerId}`);
    });

    it('should handle search request', async () => {
        const searchOptions: SearchOptions = {
            query: 'Air Jordan 1',
            page: 1,
            limit: 5,
        };
        const responseObj: SearchResponse = {
            count: 1,
            totalPages: 1,
            results: [sneakerData],
        };
        mockAxios.onGet('/search', { params: searchOptions }).reply(200, responseObj);
        const response = await theSneakerDBClient.search(searchOptions);

        expect(response.error).toBeUndefined();
        expect(response.response).toBeDefined();
        expect(response.response).toEqual(responseObj);
        const request = expectSingleHistoryRequest();
        expect(request.url).toBe('/search');
        expect(request.params).toEqual(searchOptions);
    });

    it('should handle search request with an error', async () => {
        const searchOptions: SearchOptions = {
            limit: 5,
            query: 'Nonexistent Sneaker',
        };
        mockAxios.onGet('/search', { params: searchOptions }).reply(404, 'Not Found');
        const response = await theSneakerDBClient.search(searchOptions);

        expect(response.response).toBeUndefined();
        expect(response.error).toBeDefined();
        const request = expectSingleHistoryRequest();
        expect(request.url).toBe('/search');
        expect(request.params).toEqual(searchOptions);
    });

    it('should handle getBrands request', async () => {
        const brands = ['Nike', 'Jordan'];
        mockAxios.onGet('/brands').reply(200, brands);

        const response = await theSneakerDBClient.getBrands();

        expect(response.error).toBeUndefined();
        expect(response.response).toEqual(brands);
        const request = expectSingleHistoryRequest();
        expect(request.url).toBe('/brands');
    });

    it('should handle getBrands request with an error', async () => {
        mockAxios.onGet('/brands').reply(500, 'Internal Server Error');

        const response = await theSneakerDBClient.getBrands();

        expect(response.response).toBeUndefined();
        expect(response.error).toBeDefined();
        const request = expectSingleHistoryRequest();
        expect(request.url).toBe('/brands');
    });

    it('caches GET requests by default', async () => {
        const options: GetSneakersOptions = { limit: 1 };
        const payload: GetSneakersResponse = { count: 1, results: [sneakerData] };
        mockAxios.onGet('/sneakers', { params: options }).reply(200, payload);

        const first = await theSneakerDBClient.getSneakers(options);
        expect(first.response).toEqual(payload);
        expect(getHistoryRequests()).toHaveLength(1);

        const cached = await theSneakerDBClient.getSneakers(options);
        expect(cached.response?.count).toBe(payload.count);
        expect(cached.response?.results[0]?.id).toBe(sneakerData.id);
        expect(getHistoryRequests()).toHaveLength(1);
    });

    it('respects skipCache flag', async () => {
        const options: GetSneakersOptions = { limit: 1 };
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
        expect(bypass.response).toEqual(fresh);
        expect(getHistoryRequests()).toHaveLength(2);
    });
});
