import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { TheSneakerDatabaseClient } from './TheSneakerDatabaseClient';
import { GetSneakersOptions, GetSneakersResponse, SearchOptions, SearchResponse, Sneaker } from './interfaces';

describe('TheSneakerDatabaseClient', () => {
    let client: TheSneakerDatabaseClient;
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
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
        client = new TheSneakerDatabaseClient('your-api-key', {});
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
        const response = await client.getSneakers(options);

        expect(response.error).toBeUndefined();
        expect(response.response).toBeDefined();
        expect(mockAxios.history.get.length).toBe(1);
        expect(mockAxios.history.get[0].url).toBe('/sneakers');
        expect(mockAxios.history.get[0].params).toEqual(options);
    });

    it('should handle getSneakers request with an error', async () => {
        mockAxios.onGet('/sneakers', { params: { limit: 5 } }).reply(500, 'Internal Server Error');
        const response = await client.getSneakers({ limit: 5 });
        expect(response.response).toBeUndefined();
        expect(response.error).toBeDefined();
    });

    it('should handle getSneakerById request', async () => {
        const sneakerId = '5338a798-ac8b-442f-a8b2-71d3a79311a5';
        const responseObj: Sneaker = sneakerData;
        mockAxios.onGet(`/sneakers/${sneakerId}`).reply(200, responseObj);
        const response = await client.getSneakerById(sneakerId);

        expect(response.error).toBeUndefined();
        expect(response.response).toBeDefined();
        expect(response.response).toEqual(responseObj);
        expect(mockAxios.history.get.length).toBe(1);
        expect(mockAxios.history.get[0].url).toBe(`/sneakers/${sneakerId}`);
    });

    it('should handle getSneakerById request with an error', async () => {
        const sneakerId = 'nonexistent-id';
        mockAxios.onGet(`/sneakers/${sneakerId}`).reply(404, 'Not Found');
        const response = await client.getSneakerById(sneakerId);

        expect(response.response).toBeUndefined();
        expect(response.error).toBeDefined();
        expect(mockAxios.history.get.length).toBe(1);
        expect(mockAxios.history.get[0].url).toBe(`/sneakers/${sneakerId}`);
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
        const response = await client.search(searchOptions);

        expect(response.error).toBeUndefined();
        expect(response.response).toBeDefined();
        expect(response.response).toEqual(responseObj);
        expect(mockAxios.history.get.length).toBe(1);
        expect(mockAxios.history.get[0].url).toBe('/search');
        expect(mockAxios.history.get[0].params).toEqual(searchOptions);
    });

    it('should handle search request with an error', async () => {
        const searchOptions: SearchOptions = {
            limit: 5,
            query: 'Nonexistent Sneaker',
        };
        mockAxios.onGet('/search', { params: searchOptions }).reply(404, 'Not Found');
        const response = await client.search(searchOptions);

        expect(response.response).toBeUndefined();
        expect(response.error).toBeDefined();
        expect(mockAxios.history.get.length).toBe(1);
        expect(mockAxios.history.get[0].url).toBe('/search');
        expect(mockAxios.history.get[0].params).toEqual(searchOptions);
    });
});
