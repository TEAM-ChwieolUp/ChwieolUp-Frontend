import { useAuthStore } from '@/store/auth-store';

export function getAccessToken() {
  return useAuthStore.getState().accessToken;
}

export function setAccessToken(token: string | null) {
  useAuthStore.getState().setAccessToken(token);
}

export function clearAccessToken() {
  setAccessToken(null);
}

export function subscribeAccessToken(listener: (token: string | null) => void) {
  return useAuthStore.subscribe((state, previousState) => {
    if (state.accessToken !== previousState.accessToken) {
      listener(state.accessToken);
    }
  });
}
