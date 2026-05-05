import { api } from '@/lib/api';
import type { ApiSuccessResponse } from '@/lib/api';
import type { QueryParams } from '@/lib/api';
import type {
  KanbanCard,
  KanbanStage,
  StageCategory,
  Priority,
} from '@/components/kanban/types';

interface TagSummaryResponse {
  id: number;
  name: string;
  color: string;
}

interface ApplicationCardResponse {
  id: number;
  companyName: string;
  position: string;
  appliedAt: string;
  deadlineAt?: string | null;
  priority: Priority;
  memo?: string | null;
  jobPostingUrl?: string | null;
  noResponseDays?: number | null;
  tags: TagSummaryResponse[];
}

interface StageNodeResponse {
  id: number;
  name: string;
  displayOrder: number;
  color: string;
  category: StageCategory;
  applications: ApplicationCardResponse[];
}

interface BoardResponseData {
  stages: StageNodeResponse[];
}

export interface ApplicationsQueryParams extends QueryParams {
  stage?: string;
  tag?: string;
  priority?: Priority;
}

export interface UpsertApplicationPayload {
  stageId: string;
  companyName: string;
  position: string;
  appliedAt: string;
  deadlineAt?: string | null;
  noResponseDays?: number;
  priority?: Priority;
  memo?: string;
  jobPostingUrl?: string;
  tagIds?: number[];
}

export interface UpdateApplicationPayload {
  companyName?: string;
  position?: string;
  stageId?: string;
  appliedAt?: string;
  deadlineAt?: string | null;
  noResponseDays?: number;
  priority?: Priority;
  memo?: string;
  jobPostingUrl?: string;
  tagIds?: number[] | null;
  isEmpty?: boolean;
}

export interface BoardData {
  stages: KanbanStage[];
  cards: KanbanCard[];
}

export const applicationKeys = {
  all: ['applications'] as const,
  board: (params?: ApplicationsQueryParams) => ['applications', 'board', params ?? {}] as const,
};

function getStageKind(category: StageCategory): KanbanStage['kind'] {
  switch (category) {
    case 'PASSED':
      return 'passed';
    case 'REJECTED':
      return 'rejected';
    default:
      return 'custom';
  }
}

function formatAppliedDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function mapStageNodeToStage(stage: StageNodeResponse): KanbanStage {
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

function mapApplicationToCard(
  application: ApplicationCardResponse,
  stage: StageNodeResponse,
): KanbanCard {
  const finalResult =
    stage.category === 'PASSED'
      ? '합격'
      : stage.category === 'REJECTED'
        ? '불합격'
        : null;

  return {
    id: String(application.id),
    company: application.companyName,
    position: application.position,
    appliedDate: formatAppliedDate(application.appliedAt),
    appliedAt: application.appliedAt,
    deadlineAt: application.deadlineAt ?? null,
    stageId: String(stage.id),
    tags: application.tags.map((tag) => tag.name),
    tagIds: application.tags.map((tag) => tag.id),
    nextAction: undefined,
    noResponseDays: application.noResponseDays ?? undefined,
    finalResult,
    memo: application.memo ?? undefined,
    priority: application.priority,
    jobPostingUrl: application.jobPostingUrl ?? undefined,
  };
}

export async function listApplications(params?: ApplicationsQueryParams): Promise<BoardData> {
  const response = await api.get<ApiSuccessResponse<BoardResponseData>>('/api/applications', {
    params,
  });

  const sortedStages = [...response.data.stages].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return {
    stages: sortedStages.map(mapStageNodeToStage),
    cards: sortedStages.flatMap((stage) =>
      stage.applications.map((application) => mapApplicationToCard(application, stage))
    ),
  };
}

export async function createApplication(payload: UpsertApplicationPayload) {
  const response = await api.post<ApiSuccessResponse<ApplicationCardResponse>>(
    '/api/applications',
    {
      ...payload,
      stageId: Number(payload.stageId),
    }
  );

  return response.data;
}

export async function updateApplication(applicationId: string, payload: UpdateApplicationPayload) {
  const response = await api.patch<ApiSuccessResponse<ApplicationCardResponse>>(
    `/api/applications/${applicationId}`,
    {
      ...payload,
      stageId: payload.stageId ? Number(payload.stageId) : payload.stageId,
      tagIds: payload.tagIds ?? undefined,
    }
  );

  return response.data;
}

export async function deleteApplication(applicationId: string) {
  await api.delete(`/api/applications/${applicationId}`);
}

export function mapApplicationResponseToCard(
  application: ApplicationCardResponse,
  stage: KanbanStage
): KanbanCard {
  return {
    id: String(application.id),
    company: application.companyName,
    position: application.position,
    appliedDate: formatAppliedDate(application.appliedAt),
    appliedAt: application.appliedAt,
    deadlineAt: application.deadlineAt ?? null,
    stageId: stage.id,
    tags: application.tags.map((tag) => tag.name),
    tagIds: application.tags.map((tag) => tag.id),
    nextAction: undefined,
    noResponseDays: application.noResponseDays ?? undefined,
    finalResult:
      stage.kind === 'passed' ? '합격' : stage.kind === 'rejected' ? '불합격' : null,
    memo: application.memo ?? undefined,
    priority: application.priority,
    jobPostingUrl: application.jobPostingUrl ?? undefined,
  };
}
