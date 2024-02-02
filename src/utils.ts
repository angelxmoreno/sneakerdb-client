import axios from 'axios';

export const handleAxiosError = (error: any) => {
    if (axios.isAxiosError(error)) {
        // If the error is an AxiosError, return the response data
        return error.response?.data as Error;
    } else {
        // If the error is not an AxiosError, return the error as is
        return error as Error;
    }
};
