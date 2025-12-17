import { AxiosError } from 'axios';

import { handleAxiosError } from './utils';

describe('handleAxiosError', () => {
    it('returns response data for Axios errors', () => {
        const response = {
            data: { message: 'Request failed' },
            status: 400,
            statusText: 'Bad Request',
            headers: {},
            config: {},
        };
        const axiosError = new AxiosError('Request failed', 'ERR_BAD_REQUEST', {}, {}, response);

        const handled = handleAxiosError(axiosError);

        expect(handled).toEqual(response.data);
    });

    it('wraps non-Axios errors as Error instances', () => {
        const handled = handleAxiosError('boom');

        expect(handled).toBeInstanceOf(Error);
        expect((handled as Error).message).toBe('boom');
    });
});
