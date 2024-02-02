export interface Image {
    original: string;
    small: string;
    thumbnail: string;
}

export interface Links {
    stockX: string;
    goat: string;
    flightClub: string;
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
    releaseDate: Date;
    releaseYear: number;
    links: Links;
    image: Image;
    story: string;
}

export type MethodResponse<T> = { error?: Error; response?: T };

export interface GetSneakersOptions {
    limit: number;
    gender?: string;
    silhouette?: string;
    colorway?: string;
    releaseYear?: string;
    page?: string;
    releaseDate?: Date | string;
    sku?: string;
    sort?: string;
    name?: string;
    brand?: string;
}

export interface GetSneakersResponse {
    count: number;
    results: Sneaker[];
}

export interface SearchOptions {
    limit: number;
    page?: number;
    query?: string;
}

export interface SearchResponse {
    count: number;
    totalPages: number;
    results: Sneaker[];
}
