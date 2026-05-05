import { LEGACY_AUTH_COOKIE, LOGIN_ROUTE, REFRESH_ENDPOINT } from './config';
import { createApiError, buildRequestUrl, parseResponseBody } from './http';
import { clearAccessToken, setAccessToken } from './token-store';
import type { RefreshResponse } from './types';

let refreshPromise: Promise<string> | null = null;
let authFailureHandler: (() => void) | null = null;

function getAccessTokenFromResponse(payload: RefreshResponse | null) {
  if (!payload) {
    return null;
  }

  if (typeof payload.accessToken === 'string') {
    return payload.accessToken;
  }

  if (typeof payload.data?.accessToken === 'string') {
    return payload.data.accessToken;
  }

  return null;
}

function defaultAuthFailureHandler() {
  if (typeof window === 'undefined') {
    return;
  }

  document.cookie = `${LEGACY_AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;

  if (window.location.pathname !== LOGIN_ROUTE) {
    window.location.replace(LOGIN_ROUTE);
  }
}

async function requestRefreshToken() {
  const url = buildRequestUrl(REFRESH_ENDPOINT);
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw await createApiError(response, url);
  }

  const payload = (await parseResponseBody(response)) as RefreshResponse | null;
  const nextAccessToken = getAccessTokenFromResponse(payload);

  if (!nextAccessToken) {
    throw new Error('Refresh response did not include an access token.');
  }

  setAccessToken(nextAccessToken);
  return nextAccessToken;
}

export function onAuthFailure(handler: (() => void) | null) {
  authFailureHandler = handler;
}

export function notifyAuthFailure() {
  clearAccessToken();

  if (authFailureHandler) {
    authFailureHandler();
    return;
  }

  defaultAuthFailureHandler();
}

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestRefreshToken().finally(() => {
      refreshPromise = null;
    });
  }

  try {
    return await refreshPromise;
  } catch (error) {
    clearAccessToken();
    throw error;
  }
}

export async function bootstrapSession() {
  try {
    await refreshAccessToken();
  } catch {
    clearAccessToken();
  }
}

export function logoutSession() {
  notifyAuthFailure();
}
