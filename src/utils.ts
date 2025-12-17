import axios from 'axios';

export const handleAxiosError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        // If the error is an AxiosError, return the response data
        return error.response?.data as Error;
    }

    if (error instanceof Error) {
        return error;
    }

    // If the error is not an AxiosError, return it as a generic Error
    return new Error(String(error));
};
