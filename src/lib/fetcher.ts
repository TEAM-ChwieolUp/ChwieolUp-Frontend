// src/lib/fetcher.ts

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type QueryParams = Record<string, string | number | boolean | null | undefined>;

interface FetcherOptions extends Omit<RequestInit, 'method' | 'body'> {
  method?: HttpMethod;
  params?: QueryParams;
  body?: unknown;
  headers?: HeadersInit;
}

export class FetcherError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'FetcherError';
    this.status = status;
    this.data = data;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(
    path.startsWith('http://') || path.startsWith('https://')
      ? path
      : `${BASE_URL}${path}`,
  );

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    }
  }

  return url.toString();
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    return response.json();
  }

  if (contentType?.includes('text/')) {
    return response.text();
  }

  return null;
}

export async function fetcher<T = unknown>(
  path: string,
  options: FetcherOptions = {},
): Promise<T> {
  const { method = 'GET', params, body, headers, ...restOptions } = options;

  const isFormData = body instanceof FormData;

  const response = await fetch(buildUrl(path, params), {
    method,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body:
      body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    ...restOptions,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as { message?: unknown }).message === 'string'
        ? (data as { message: string }).message
        : `Request failed with status ${response.status}`;

    throw new FetcherError(message, response.status, data);
  }

  return data as T;
}

export const api = {
  get: <T = unknown>(
    path: string,
    options?: Omit<FetcherOptions, 'method' | 'body'>,
  ) => fetcher<T>(path, { ...options, method: 'GET' }),

  post: <T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<FetcherOptions, 'method' | 'body'>,
  ) => fetcher<T>(path, { ...options, method: 'POST', body }),

  put: <T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<FetcherOptions, 'method' | 'body'>,
  ) => fetcher<T>(path, { ...options, method: 'PUT', body }),

  patch: <T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<FetcherOptions, 'method' | 'body'>,
  ) => fetcher<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T = unknown>(
    path: string,
    options?: Omit<FetcherOptions, 'method' | 'body'>,
  ) => fetcher<T>(path, { ...options, method: 'DELETE' }),
};
