import {
  GOOGLE_OAUTH_START_ENDPOINT,
  KAKAO_OAUTH_START_ENDPOINT,
  OAUTH_BASE_URL,
} from './config';

export type OAuthProvider = 'google' | 'kakao';

const OAUTH_START_ENDPOINTS: Record<OAuthProvider, string> = {
  google: GOOGLE_OAUTH_START_ENDPOINT,
  kakao: KAKAO_OAUTH_START_ENDPOINT,
};

function getOAuthStartUrl(provider: OAuthProvider) {
  const path = OAUTH_START_ENDPOINTS[provider];

  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${OAUTH_BASE_URL}${path}`;
}

export function startSocialLogin(provider: OAuthProvider) {
  if (typeof window === 'undefined') {
    return;
  }

  window.location.assign(getOAuthStartUrl(provider));
}
