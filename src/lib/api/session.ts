import { LEGACY_AUTH_COOKIE, LOGIN_ROUTE, REFRESH_ENDPOINT } from './config';
import {
  createTemporaryDevSession,
  disableTemporaryDevAuth,
  isTemporaryDevAuthEnabled,
} from './dev-auth';
import { createApiError, buildRequestUrl, parseResponseBody } from './http';
import {
  clearAuthSession,
  markAuthBootstrapped,
  markAuthBootstrapping,
  setAuthSession,
} from '@/store/auth-store';
import type { AuthSessionPayload, RefreshResponse } from './types';

let refreshPromise: Promise<AuthSessionPayload> | null = null;
let authFailureHandler: (() => void) | null = null;

function getSessionFromResponse(payload: RefreshResponse | null) {
  if (!payload) {
    return null;
  }

  const accessToken =
    typeof payload.accessToken === 'string'
      ? payload.accessToken
      : typeof payload.data?.accessToken === 'string'
        ? payload.data.accessToken
        : null;

  if (!accessToken) {
    return null;
  }

  return {
    accessToken,
    user: payload.user ?? payload.data?.user ?? null,
  };
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
  const session = getSessionFromResponse(payload);

  if (!session) {
    throw new Error('Refresh response did not include an access token.');
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[auth] accessToken', session.accessToken);
  }

  setAuthSession(session);
  return session;
}

export function onAuthFailure(handler: (() => void) | null) {
  authFailureHandler = handler;
}

export function notifyAuthFailure() {
  disableTemporaryDevAuth();
  clearAuthSession();

  if (authFailureHandler) {
    authFailureHandler();
    return;
  }

  defaultAuthFailureHandler();
}

function clearLegacyAuthCookie() {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${LEGACY_AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
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
    clearAuthSession();
    throw error;
  }
}

export async function bootstrapSession() {
  markAuthBootstrapping();

  if (isTemporaryDevAuthEnabled()) {
    setAuthSession(createTemporaryDevSession());
    return;
  }

  try {
    await refreshAccessToken();
  } catch {
    clearAuthSession();
    return;
  }

  markAuthBootstrapped();
}

export function logoutSession() {
  clearAuthSession();
  clearLegacyAuthCookie();
}
