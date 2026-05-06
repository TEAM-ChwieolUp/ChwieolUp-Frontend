import { api } from '@/lib/api';
import type { ApiSuccessResponse } from '@/lib/api';
import type {
  KanbanStage,
  KanbanStageKind,
  StageCategory,
} from '@/components/kanban/types';

export interface StageResponse {
  id: number;
  name: string;
  displayOrder: number;
  color: string;
  category: StageCategory;
}

export interface CreateStageRequest {
  name: string;
  color: string;
  displayOrder?: number;
}

export interface UpdateStageRequest {
  name?: string;
  color?: string;
  displayOrder?: number;
  isEmpty?: boolean;
}

export const stageKeys = {
  all: ['stages'] as const,
};

function getStageKind(category: StageCategory): KanbanStageKind {
  switch (category) {
    case 'PASSED':
      return 'passed';
    case 'REJECTED':
      return 'rejected';
    default:
      return 'custom';
  }
}

export function mapStageResponseToKanbanStage(stage: StageResponse): KanbanStage {
  return {
    id: String(stage.id),
    name: stage.name,
    color: stage.color,
    displayOrder: stage.displayOrder,
    category: stage.category,
    kind: getStageKind(stage.category),
    locked: stage.category !== 'IN_PROGRESS',
  };
}

export async function listStages() {
  const response = await api.get<ApiSuccessResponse<StageResponse[]>>('/api/stages');
  return response.data
    .map(mapStageResponseToKanbanStage)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function createStage(payload: CreateStageRequest) {
  const response = await api.post<ApiSuccessResponse<StageResponse>>(
    '/api/stages',
    payload,
  );
  return mapStageResponseToKanbanStage(response.data);
}

export async function updateStage(stageId: string, payload: UpdateStageRequest) {
  const response = await api.patch<ApiSuccessResponse<StageResponse>>(
    `/api/stages/${stageId}`,
    payload,
  );
  return mapStageResponseToKanbanStage(response.data);
}

export async function deleteStage(stageId: string) {
  await api.delete(`/api/stages/${stageId}`);
}
