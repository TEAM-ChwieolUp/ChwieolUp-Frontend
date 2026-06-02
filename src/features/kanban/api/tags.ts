import { api } from '@/lib/api';
import { shouldUseTemporaryDevData } from '@/lib/api/dev-auth';
import { TEMP_DEV_TAGS } from '@/lib/api/dev-mock-data';
import type { ApiSuccessResponse } from '@/lib/api';

export interface TagResponse {
  id: number;
  name: string;
  color: string;
}

export interface CreateTagRequest {
  name: string;
  color: string;
}

export interface UpdateTagRequest {
  name?: string | null;
  color?: string | null;
  isEmpty?: boolean;
}

export const tagKeys = {
  all: ['tags'] as const,
};

export async function listTags() {
  if (shouldUseTemporaryDevData()) {
    return TEMP_DEV_TAGS;
  }

  const response = await api.get<ApiSuccessResponse<TagResponse[]>>('/api/tags');
  return response.data.sort((a, b) => a.id - b.id);
}

export async function createTag(payload: CreateTagRequest) {
  const response = await api.post<ApiSuccessResponse<TagResponse>>('/api/tags', payload);
  return response.data;
}

export async function updateTag(tagId: string, payload: UpdateTagRequest) {
  const response = await api.patch<ApiSuccessResponse<TagResponse>>(
    `/api/tags/${tagId}`,
    {
      ...payload,
      isEmpty: payload.isEmpty ?? false,
    },
  );
  return response.data;
}

export async function deleteTag(tagId: string) {
  await api.delete(`/api/tags/${tagId}`);
}
