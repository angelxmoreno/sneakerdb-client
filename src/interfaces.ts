import type Keyv from '@keyvhq/core';
import type { AxiosInstance, CreateAxiosDefaults } from 'axios';

export interface Image {
    original: string;
    small: string;
    thumbnail: string;
}

export interface Links {
    stockX: string;
    goat: string;
    flightClub: string;
    stadiumGoods: string;
}

export interface Sneaker {
    id: string;
    sku: string;
    brand: string;
    name: string;
    colorway: string;
    gender: string;
    silhouette: string;
    retailPrice: number;
    releaseDate: Date | string;
    releaseYear: number;
    estimatedMarketValue: number;
    links: Links;
    image: Image;
    story: string;
}

export type MethodResponse<T> = { success: true; response: T } | { success: false; error?: Error };

export interface CacheOptions {
    ttl?: number;
    skipCache?: boolean;
}

export type FilterOperator = 'lt' | 'lte' | 'gt' | 'gte' | 'eq';

export const FILTERABLE_FIELDS = ['releaseDate', 'releaseYear', 'retailPrice', 'estimatedMarketValue'] as const;

export type ComparableField = (typeof FILTERABLE_FIELDS)[number];

export type FilterValue = string | number | Date;

export interface FilterOption {
    field: ComparableField;
    value: FilterValue;
    operator?: FilterOperator;
}

export type SortOrder = 'asc' | 'desc';

export type SortField = 'name' | 'silhouette' | 'retailPrice' | 'releaseDate' | 'releaseYear';

export interface SortOption {
    field: SortField;
    order?: SortOrder;
}

export interface PaginatedOptions extends CacheOptions {
    limit?: number;
    page?: number;
    sort?: SortOption;
    filters?: FilterOption;
}

export interface GetSneakersOptions extends PaginatedOptions {
    limit: number;
    gender?: string;
    silhouette?: string;
    colorway?: string;
    releaseYear?: string;
    releaseDate?: Date | string;
    sku?: string;
    name?: string;
    brand?: string;
}

export interface GetSneakersResponse {
    count: number;
    results: Sneaker[];
}

export interface SearchOptions extends PaginatedOptions {
    limit: number;
    query?: string;
}

export interface SearchResponse {
    count: number;
    totalPages: number;
    results: Sneaker[];
}

export type ApiListResponse<T> = { results?: T[]; data?: T[] } | T[];

export type TheSneakerDatabaseClientOptions = {
    rapidApiKey: string;
    axiosParam?: AxiosInstance | CreateAxiosDefaults;
    cache?: Keyv;
};
