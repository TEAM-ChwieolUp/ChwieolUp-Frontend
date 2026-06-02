import { api } from '@/lib/api';
import { shouldUseTemporaryDevData } from '@/lib/api/dev-auth';
import { TEMP_DEV_PROFILE } from '@/lib/api/dev-mock-data';
import type { ApiSuccessResponse } from '@/lib/api';

export type OAuth2Provider = 'GOOGLE' | 'KAKAO' | 'MICROSOFT';

export interface UserProfile {
  id: number;
  oauth2Provider: OAuth2Provider;
  email: string;
  name: string | null;
  profileImageUrl: string | null;
}

export const userProfileKeys = {
  me: ['users', 'me'] as const,
};

export async function getMyProfile(): Promise<UserProfile> {
  if (shouldUseTemporaryDevData()) {
    return TEMP_DEV_PROFILE;
  }

  const response = await api.get<ApiSuccessResponse<UserProfile>>('/api/users/me');
  return response.data;
}
