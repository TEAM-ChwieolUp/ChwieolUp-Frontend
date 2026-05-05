import { fetcher } from './fetcher';
import type { ApiRequestOptions } from './types';

type RequestOptionsWithoutMethod = Omit<ApiRequestOptions, 'body' | 'method'>;

export const api = {
  get: <T = unknown>(path: string, options?: RequestOptionsWithoutMethod) =>
    fetcher<T>(path, { ...options, method: 'GET' }),

  post: <T = unknown>(
    path: string,
    body?: ApiRequestOptions['body'],
    options?: RequestOptionsWithoutMethod,
  ) => fetcher<T>(path, { ...options, method: 'POST', body }),

  put: <T = unknown>(
    path: string,
    body?: ApiRequestOptions['body'],
    options?: RequestOptionsWithoutMethod,
  ) => fetcher<T>(path, { ...options, method: 'PUT', body }),

  patch: <T = unknown>(
    path: string,
    body?: ApiRequestOptions['body'],
    options?: RequestOptionsWithoutMethod,
  ) => fetcher<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T = unknown>(path: string, options?: RequestOptionsWithoutMethod) =>
    fetcher<T>(path, { ...options, method: 'DELETE' }),
};
