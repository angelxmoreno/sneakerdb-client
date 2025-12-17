import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';
import { addAxiosDateTransformer, createAxiosDateTransformer } from 'axios-date-transformer';

import {
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
        axiosParam?: AxiosInstance | CreateAxiosDefaults,
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

    getSneakers(options: GetSneakersOptions): Promise<MethodResponse<GetSneakersResponse>> {
        return this.handleRequest<GetSneakersResponse, GetSneakersOptions>('/sneakers', options);
    }

    getSneakerById(sneakerId: string): Promise<MethodResponse<Sneaker[]>> {
        return this.handleRequest<Sneaker[]>(`/sneakers/${sneakerId}`);
    }

    getBrands(): Promise<MethodResponse<string[]>> {
        return this.handleRequest<string[]>(`/brands`);
    }

    getGenders(): Promise<MethodResponse<string[]>> {
        return this.handleRequest<string[]>(`/genders`);
    }

    search(options: SearchOptions): Promise<MethodResponse<SearchResponse>> {
        return this.handleRequest<SearchResponse, SearchOptions>(`/search`, options);
    }
}
