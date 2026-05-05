export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export const REFRESH_ENDPOINT =
  process.env.NEXT_PUBLIC_API_REFRESH_PATH ?? '/api/auth/refresh';

export const LOGIN_ROUTE = '/login';
export const AUTH_CALLBACK_ROUTE = '/auth/callback';
export const GOOGLE_OAUTH_START_ENDPOINT = '/oauth2/authorization/google';
export const KAKAO_OAUTH_START_ENDPOINT = '/oauth2/authorization/kakao';

export const LEGACY_AUTH_COOKIE = 'chwieolup_auth';
