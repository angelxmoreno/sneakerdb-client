import axios, { type AxiosInstance, type CreateAxiosDefaults } from 'axios';
import { addAxiosDateTransformer, createAxiosDateTransformer } from 'axios-date-transformer';

import type {
    ApiListResponse,
    GetSneakersOptions,
    GetSneakersResponse,
    MethodResponse,
    SearchOptions,
    SearchResponse,
    Sneaker,
} from './interfaces';
import { handleAxiosError } from './utils';

export class TheSneakerDatabaseClient {
    readonly client: AxiosInstance;

    constructor(rapidApiKey: string, axiosParam?: AxiosInstance | CreateAxiosDefaults) {
        this.client = this.configureAxiosInstance(rapidApiKey, axiosParam);
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

    protected async handleRequest<T, K = undefined>(uri: string, params?: K): Promise<MethodResponse<T>> {
        try {
            const { data } = await this.client.get<T>(uri, { params });
            return { response: data };
        } catch (error) {
            return { error: handleAxiosError(error) };
        }
    }

    protected mapResponse<TInput, TOutput>(
        result: MethodResponse<TInput>,
        mapper: (value: TInput) => TOutput
    ): MethodResponse<TOutput> {
        if (result.error) {
            return { error: result.error };
        }

        if (typeof result.response === 'undefined') {
            return {};
        }

        return { response: mapper(result.response) };
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

    protected async requestList<T>(uri: string): Promise<MethodResponse<T[]>> {
        const result = await this.handleRequest<ApiListResponse<T>>(uri);
        return this.mapResponse(result, (payload) => this.normalizeList(payload));
    }

    getSneakers(options: GetSneakersOptions): Promise<MethodResponse<GetSneakersResponse>> {
        return this.handleRequest<GetSneakersResponse, GetSneakersOptions>('/sneakers', options);
    }

    async getSneakerById(sneakerId: string): Promise<MethodResponse<Sneaker[]>> {
        const result = await this.handleRequest<ApiListResponse<Sneaker>>(`/sneakers/${sneakerId}`);
        return this.mapResponse(result, (payload) => this.normalizeList(payload));
    }

    getBrands(): Promise<MethodResponse<string[]>> {
        return this.requestList<string>(`/brands`);
    }

    getGenders(): Promise<MethodResponse<string[]>> {
        return this.requestList<string>(`/genders`);
    }

    search(options: SearchOptions): Promise<MethodResponse<SearchResponse>> {
        return this.handleRequest<SearchResponse, SearchOptions>(`/search`, options);
    }
}
