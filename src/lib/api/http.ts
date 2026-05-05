import { API_BASE_URL } from './config';
import { ApiError } from './errors';
import type { QueryParams } from './types';

function isAbsoluteUrl(path: string) {
  return /^https?:\/\//.test(path);
}

export function buildRequestUrl(path: string, params?: QueryParams) {
  const basePath = isAbsoluteUrl(path) || !API_BASE_URL ? path : `${API_BASE_URL}${path}`;
  const searchParams = new URLSearchParams();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        continue;
      }

      if (Array.isArray(value)) {
        value.forEach((entry) => {
          searchParams.append(key, String(entry));
        });
        continue;
      }

      searchParams.append(key, String(value));
    }
  }

  const query = searchParams.toString();

  if (!query) {
    return basePath;
  }

  return `${basePath}${basePath.includes('?') ? '&' : '?'}${query}`;
}

export async function parseResponseBody(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    return response.json();
  }

  if (contentType?.includes('text/')) {
    return response.text();
  }

  return null;
}

export function getErrorMessage(response: Response, data: unknown) {
  if (typeof data === 'object' && data !== null) {
    if ('message' in data && typeof data.message === 'string') {
      return data.message;
    }

    if (
      'error' in data &&
      typeof data.error === 'object' &&
      data.error !== null &&
      'message' in data.error &&
      typeof data.error.message === 'string'
    ) {
      return data.error.message;
    }
  }

  return `Request failed with status ${response.status}`;
}

export async function createApiError(response: Response, url: string) {
  const data = await parseResponseBody(response);
  return new ApiError(getErrorMessage(response, data), response.status, url, data);
}
