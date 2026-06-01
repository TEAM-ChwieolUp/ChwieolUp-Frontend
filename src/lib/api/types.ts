export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>;

export type QueryParams = Record<string, QueryParamValue>;
export type AuthStatus =
  | 'idle'
  | 'bootstrapping'
  | 'authenticated'
  | 'anonymous';

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
  meta?: {
    timestamp: string;
    requestId: string | null;
  };
  message?: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  profileImageUrl: string | null;
}

export interface AccessTokenPayload {
  accessToken: string;
}

export interface AuthResponseData extends AccessTokenPayload {
  user?: AuthUser | null;
}

export interface AuthSessionPayload {
  accessToken: string;
  user: AuthUser | null;
}

export interface RefreshResponse {
  accessToken?: string;
  user?: AuthUser | null;
  data?: Partial<AuthResponseData>;
}
