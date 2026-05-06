import { api } from '@/lib/api';
import type { ApiSuccessResponse } from '@/lib/api';

export interface RetrospectiveItemResponse {
  question: string;
  answer: string;
}

interface RetrospectiveSummaryResponse {
  id: number;
  applicationId: number;
  stageId: number | null;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

interface RetrospectiveDetailResponse {
  id: number;
  applicationId: number;
  stageId: number | null;
  items: RetrospectiveItemResponse[];
  createdAt: string;
  updatedAt: string;
}

interface RetrospectiveItemsResponseData {
  items: RetrospectiveItemResponse[];
  version: number;
}

interface RetrospectiveListResponseData {
  retrospectives: RetrospectiveSummaryResponse[];
}

interface TemplateResponse {
  id: number;
  name: string;
  questions: string[];
}

interface TemplateListResponseData {
  templates: TemplateResponse[];
}

interface AiQuestionsResponseData {
  questions: string[];
}

export interface CreateRetrospectivePayload {
  stageId?: string | null;
}

export interface UpsertRetrospectiveItemPayload {
  question?: string;
  answer?: string;
  isEmpty?: boolean;
}

export const retrospectiveKeys = {
  all: ['retrospectives'] as const,
  list: (applicationId: string) => ['retrospectives', 'list', applicationId] as const,
  detail: (retrospectiveId: string) => ['retrospectives', 'detail', retrospectiveId] as const,
  templates: ['retrospectives', 'templates'] as const,
};

export async function listApplicationRetrospectives(applicationId: string) {
  const response = await api.get<ApiSuccessResponse<RetrospectiveListResponseData>>(
    `/api/applications/${applicationId}/retrospectives`
  );

  return response.data.retrospectives.map((retrospective) => ({
    id: String(retrospective.id),
    applicationId: String(retrospective.applicationId),
    stageId: retrospective.stageId === null ? null : String(retrospective.stageId),
    itemCount: retrospective.itemCount,
    createdAt: retrospective.createdAt,
    updatedAt: retrospective.updatedAt,
  }));
}

export async function getRetrospective(retrospectiveId: string) {
  const response = await api.get<ApiSuccessResponse<RetrospectiveDetailResponse>>(
    `/api/retrospectives/${retrospectiveId}`
  );

  return {
    id: String(response.data.id),
    applicationId: String(response.data.applicationId),
    stageId: response.data.stageId === null ? null : String(response.data.stageId),
    items: response.data.items,
    createdAt: response.data.createdAt,
    updatedAt: response.data.updatedAt,
  };
}

export async function createApplicationRetrospective(
  applicationId: string,
  payload: CreateRetrospectivePayload
) {
  const response = await api.post<ApiSuccessResponse<RetrospectiveDetailResponse>>(
    `/api/applications/${applicationId}/retrospectives`,
    {
      stageId:
        payload.stageId === undefined || payload.stageId === null || payload.stageId === ''
          ? null
          : Number(payload.stageId),
    }
  );

  return {
    id: String(response.data.id),
    applicationId: String(response.data.applicationId),
    stageId: response.data.stageId === null ? null : String(response.data.stageId),
    items: response.data.items,
    createdAt: response.data.createdAt,
    updatedAt: response.data.updatedAt,
  };
}

export async function deleteRetrospective(retrospectiveId: string) {
  await api.delete(`/api/retrospectives/${retrospectiveId}`);
}

export async function addRetrospectiveItem(
  retrospectiveId: string,
  payload: Required<Pick<RetrospectiveItemResponse, 'question'>> &
    Partial<Pick<RetrospectiveItemResponse, 'answer'>>
) {
  const response = await api.post<ApiSuccessResponse<RetrospectiveItemsResponseData>>(
    `/api/retrospectives/${retrospectiveId}/items`,
    payload
  );

  return response.data;
}

export async function updateRetrospectiveItem(
  retrospectiveId: string,
  index: number,
  payload: UpsertRetrospectiveItemPayload
) {
  const response = await api.patch<ApiSuccessResponse<RetrospectiveItemsResponseData>>(
    `/api/retrospectives/${retrospectiveId}/items/${index}`,
    payload
  );

  return response.data;
}

export async function deleteRetrospectiveItem(
  retrospectiveId: string,
  index: number
) {
  const response = await api.delete<ApiSuccessResponse<RetrospectiveItemsResponseData>>(
    `/api/retrospectives/${retrospectiveId}/items/${index}`
  );

  return response.data;
}

export async function listRetrospectiveTemplates() {
  const response = await api.get<ApiSuccessResponse<TemplateResponse[] | TemplateListResponseData>>(
    '/api/retrospective-templates'
  );

  const templates = Array.isArray(response.data)
    ? response.data
    : response.data.templates;

  return templates.map((template) => ({
    id: String(template.id),
    name: template.name,
    questions: template.questions,
  }));
}

export async function applyRetrospectiveTemplate(
  retrospectiveId: string,
  templateId: string
) {
  const response = await api.post<ApiSuccessResponse<RetrospectiveDetailResponse>>(
    `/api/retrospectives/${retrospectiveId}/apply-template`,
    {
      templateId: Number(templateId),
    }
  );

  return {
    id: String(response.data.id),
    applicationId: String(response.data.applicationId),
    stageId: response.data.stageId === null ? null : String(response.data.stageId),
    items: response.data.items,
    createdAt: response.data.createdAt,
    updatedAt: response.data.updatedAt,
  };
}

export async function generateAiRetrospectiveQuestions(payload: {
  applicationId: string;
  stageId?: string | null;
}) {
  const response = await api.post<ApiSuccessResponse<AiQuestionsResponseData>>(
    '/api/retrospectives/ai-questions',
    {
      applicationId: Number(payload.applicationId),
      stageId:
        payload.stageId === undefined || payload.stageId === null || payload.stageId === ''
          ? undefined
          : Number(payload.stageId),
    }
  );

  return response.data.questions;
}
