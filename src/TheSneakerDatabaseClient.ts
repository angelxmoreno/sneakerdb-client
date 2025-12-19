import type Keyv from '@keyvhq/core';
import axios, { type AxiosInstance, type CreateAxiosDefaults } from 'axios';
import { addAxiosDateTransformer, createAxiosDateTransformer } from 'axios-date-transformer';
import objectHash from 'object-hash';
import type {
    ApiListResponse,
    CacheOptions,
    GetSneakersOptions,
    GetSneakersResponse,
    MethodResponse,
    SearchOptions,
    SearchResponse,
    Sneaker,
    SortOption,
    SortOrder,
    TheSneakerDatabaseClientOptions,
} from './interfaces';
import { handleAxiosError } from './utils';

export class TheSneakerDatabaseClient {
    readonly client: AxiosInstance;
    protected cache?: Keyv;

    constructor({ rapidApiKey, axiosParam, cache }: TheSneakerDatabaseClientOptions) {
        this.client = this.configureAxiosInstance(rapidApiKey, axiosParam);
        this.cache = cache;
    }

    protected configureAxiosInstance(
        rapidApiKey: string,
        axiosParam?: AxiosInstance | CreateAxiosDefaults
    ): AxiosInstance {
        const instance =
            axiosParam instanceof axios
                ? addAxiosDateTransformer(axiosParam as AxiosInstance)
                : createAxiosDateTransformer(axiosParam as CreateAxiosDefaults);

        instance.defaults.baseURL = 'https://the-sneaker-database.p.rapidapi.com/';
        instance.defaults.headers.common['X-RapidAPI-Host'] = 'the-sneaker-database.p.rapidapi.com';
        instance.defaults.headers.common['X-RapidAPI-Key'] = rapidApiKey;
        instance.defaults.headers.common['Content-Type'] = 'application/json';

        return instance;
    }

    protected partitionOptions<K>(params?: K) {
        if (!params) {
            return { cacheOptions: {}, requestParams: undefined };
        }

        const { ttl, skipCache, ...rest } = params as K & CacheOptions & Record<string, unknown>;
        const hasParams = Object.keys(rest).length > 0;
        return {
            cacheOptions: { ttl, skipCache },
            requestParams: hasParams ? (rest as Omit<K, keyof CacheOptions>) : undefined,
        };
    }

    protected createCacheKey(uri: string, params?: unknown) {
        if (!params) {
            return uri;
        }

        return `${uri}:${objectHash(params)}`;
    }
    protected async handleRequest<T, K = undefined>(uri: string, params?: K): Promise<MethodResponse<T>> {
        try {
            const { requestParams, cacheOptions } = this.partitionOptions(params);
            const queryParams = this.prepareQueryParams(requestParams);
            const cacheKey = this.createCacheKey(uri, queryParams);
            const shouldUseCache = Boolean(this.cache && !cacheOptions.skipCache);

            if (shouldUseCache && this.cache) {
                const cached = await this.cache.get(cacheKey);
                if (typeof cached !== 'undefined') {
                    return { success: true, response: cached as T };
                }
            }

            const { data } = await this.client.get<T>(uri, { params: queryParams });

            if (shouldUseCache && this.cache) {
                await this.cache.set(cacheKey, data, cacheOptions.ttl);
            }

            return { success: true, response: data };
        } catch (error) {
            return { success: false, error: handleAxiosError(error) };
        }
    }

    protected mapResponse<TInput, TOutput>(
        result: MethodResponse<TInput>,
        mapper: (value: TInput) => TOutput
    ): MethodResponse<TOutput> {
        if (!result.success) {
            return result;
        }

        return { success: true, response: mapper(result.response) };
    }

    protected normalizeList<T>(payload: ApiListResponse<T>): T[] {
        if (Array.isArray(payload)) {
            return payload;
        }

        if (Array.isArray(payload.results)) {
            return payload.results as T[];
        }

        if (Array.isArray(payload.data)) {
            return payload.data as T[];
        }

        return [];
    }

    protected async requestList<T>(uri: string, options?: CacheOptions): Promise<MethodResponse<T[]>> {
        const result = await this.handleRequest<ApiListResponse<T>, CacheOptions>(uri, options);
        return this.mapResponse(result, (payload) => this.normalizeList(payload));
    }

    protected prepareQueryParams(params?: Record<string, unknown>) {
        if (!params) {
            return undefined;
        }

        const normalized: Record<string, unknown> = { ...params };

        if (typeof normalized.sort !== 'undefined') {
            normalized.sort = this.serializeSortOption(normalized.sort as SortOption);
            if (typeof normalized.sort === 'undefined') {
                delete normalized.sort;
            }
        } else {
            delete normalized.sort;
        }

        return normalized;
    }

    protected serializeSortOption(option: SortOption) {
        const { field, order } = option;
        if (!field) {
            return undefined;
        }

        const direction: SortOrder = order ?? 'desc';
        return `${field}:${direction}`;
    }

    getSneakers(options: GetSneakersOptions): Promise<MethodResponse<GetSneakersResponse>> {
        return this.handleRequest<GetSneakersResponse, GetSneakersOptions>('/sneakers', options);
    }

    async getSneakerById(sneakerId: string, options?: CacheOptions): Promise<MethodResponse<Sneaker[]>> {
        const result = await this.handleRequest<ApiListResponse<Sneaker>, CacheOptions>(
            `/sneakers/${sneakerId}`,
            options
        );
        return this.mapResponse(result, (payload) => this.normalizeList(payload));
    }

    getBrands(options?: CacheOptions): Promise<MethodResponse<string[]>> {
        return this.requestList<string>(`/brands`, options);
    }

    getGenders(options?: CacheOptions): Promise<MethodResponse<string[]>> {
        return this.requestList<string>(`/genders`, options);
    }

    search(options: SearchOptions): Promise<MethodResponse<SearchResponse>> {
        return this.handleRequest<SearchResponse, SearchOptions>(`/search`, options);
    }
}
