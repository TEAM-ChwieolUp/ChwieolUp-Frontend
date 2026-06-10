import type { AuthSessionPayload } from './types';

const TEMP_DEV_AUTH_STORAGE_KEY = 'chwieolup.temp-dev-auth';

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function isTemporaryDevAuthAvailable() {
  return true;
}

export function enableTemporaryDevAuth() {
  if (!isTemporaryDevAuthAvailable() || !canUseBrowserStorage()) {
    return;
  }

  window.sessionStorage.setItem(TEMP_DEV_AUTH_STORAGE_KEY, 'true');
}

export function disableTemporaryDevAuth() {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.sessionStorage.removeItem(TEMP_DEV_AUTH_STORAGE_KEY);
}

export function isTemporaryDevAuthEnabled() {
  if (!isTemporaryDevAuthAvailable() || !canUseBrowserStorage()) {
    return false;
  }

  return window.sessionStorage.getItem(TEMP_DEV_AUTH_STORAGE_KEY) === 'true';
}

export function shouldUseTemporaryDevData() {
  return isTemporaryDevAuthEnabled();
}

export function createTemporaryDevSession(): AuthSessionPayload {
  return {
    accessToken: 'temp-dev-access-token',
    user: {
      id: 0,
      email: 'dev@chwieolup.local',
      name: 'Dev User',
      profileImageUrl: null,
    },
  };
}
