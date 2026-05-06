import { api } from '@/lib/api';
import type { ApiSuccessResponse } from '@/lib/api';

export type OAuth2Provider = 'GOOGLE' | 'KAKAO';

export interface UserProfile {
  id: number;
  oauth2Provider: OAuth2Provider;
  email: string;
  name: string;
  profileImageUrl: string | null;
}

export const userProfileKeys = {
  me: ['users', 'me'] as const,
};

export async function getMyProfile(): Promise<UserProfile> {
  const response = await api.get<ApiSuccessResponse<UserProfile>>('/api/users/me');
  return response.data;
}
