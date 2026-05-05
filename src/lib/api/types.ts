export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>;

export type QueryParams = Record<string, QueryParamValue>;

export interface ApiRequestOptions
  extends Omit<RequestInit, 'body' | 'credentials' | 'headers' | 'method'> {
  body?: BodyInit | object | null;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
  method?: HttpMethod;
  params?: QueryParams;
  retryOnAuthError?: boolean;
  skipAuth?: boolean;
}

export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

export interface AccessTokenPayload {
  accessToken: string;
}

export interface RefreshResponse {
  accessToken?: string;
  data?: Partial<AccessTokenPayload>;
}
