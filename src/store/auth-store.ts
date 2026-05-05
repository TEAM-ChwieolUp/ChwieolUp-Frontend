import { create } from 'zustand';
import type { AuthSessionPayload, AuthStatus, AuthUser } from '@/lib/api/types';

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  status: AuthStatus;
  isBootstrapped: boolean;
  setSession: (payload: AuthSessionPayload) => void;
  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  setBootstrapping: () => void;
  markBootstrapped: () => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  status: 'idle',
  isBootstrapped: false,
  setSession: ({ accessToken, user }) =>
    set({
      accessToken,
      user,
      status: 'authenticated',
      isBootstrapped: true,
    }),
  setAccessToken: (accessToken) =>
    set((state) => ({
      accessToken,
      status: accessToken ? 'authenticated' : state.isBootstrapped ? 'anonymous' : 'idle',
    })),
  setUser: (user) => set({ user }),
  setBootstrapping: () =>
    set((state) => ({
      status: state.accessToken ? 'authenticated' : 'bootstrapping',
    })),
  markBootstrapped: () =>
    set((state) => ({
      isBootstrapped: true,
      status: state.accessToken ? 'authenticated' : 'anonymous',
    })),
  clearSession: () =>
    set({
      accessToken: null,
      user: null,
      status: 'anonymous',
      isBootstrapped: true,
    }),
}));

export function setAuthSession(payload: AuthSessionPayload) {
  useAuthStore.getState().setSession(payload);
}

export function clearAuthSession() {
  useAuthStore.getState().clearSession();
}

export function getAuthSession() {
  const { accessToken, user, status, isBootstrapped } = useAuthStore.getState();

  return {
    accessToken,
    user,
    status,
    isBootstrapped,
  };
}

export function getCurrentUser() {
  return useAuthStore.getState().user;
}

export function markAuthBootstrapping() {
  useAuthStore.getState().setBootstrapping();
}

export function markAuthBootstrapped() {
  useAuthStore.getState().markBootstrapped();
}
