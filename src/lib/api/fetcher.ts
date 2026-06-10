import { ApiError } from './errors';
import { isTemporaryDevAuthEnabled } from './dev-auth';
import { buildRequestUrl, createApiError, parseResponseBody } from './http';
import { refreshAccessToken, notifyAuthFailure } from './session';
import { getAccessToken } from './token-store';
import type { ApiRequestOptions } from './types';

interface InternalRequestOptions extends ApiRequestOptions {
  _hasRetried?: boolean;
}

function isBodyInit(body: ApiRequestOptions['body']): body is BodyInit {
  return (
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  );
}

function createHeaders(options: InternalRequestOptions) {
  const headers = new Headers(options.headers);
  const accessToken = getAccessToken();

  if (!options.skipAuth && accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const body = options.body;
  const isFormData = body instanceof FormData;
  const isBinaryBody = body instanceof Blob || body instanceof ArrayBuffer || ArrayBuffer.isView(body);

  if (body != null && !isFormData && !isBinaryBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return headers;
}

function createRequestBody(body: ApiRequestOptions['body']) {
  if (body == null) {
    return undefined;
  }

  if (typeof body === 'string' || isBodyInit(body)) {
    return body;
  }

  return JSON.stringify(body);
}

async function executeRequest<T>(
  path: string,
  options: InternalRequestOptions,
): Promise<T> {
  const {
    method = 'GET',
    params,
    body,
    credentials = 'include',
    retryOnAuthError = true,
    ...restOptions
  } = options;
  const url = buildRequestUrl(path, params);

  const response = await fetch(url, {
    ...restOptions,
    method,
    body: createRequestBody(body),
    headers: createHeaders(options),
    credentials,
  });

  if (response.status === 401 && isTemporaryDevAuthEnabled()) {
    throw await createApiError(response, url);
  }

  if (response.status === 401 && retryOnAuthError && !options.skipAuth && !options._hasRetried) {
    try {
      await refreshAccessToken();

      return executeRequest<T>(path, {
        ...options,
        _hasRetried: true,
      });
    } catch (error) {
      notifyAuthFailure();
      throw error;
    }
  }

  if (!response.ok) {
    throw await createApiError(response, url);
  }

  return (await parseResponseBody(response)) as T;
}

export async function fetcher<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  try {
    return await executeRequest<T>(path, options);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Unexpected API error',
      0,
      buildRequestUrl(path, options.params),
      error,
    );
  }
}
