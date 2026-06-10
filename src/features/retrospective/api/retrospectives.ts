import { api } from '@/lib/api';
import { shouldUseTemporaryDevData } from '@/lib/api/dev-auth';
import {
  TEMP_DEV_RETROSPECTIVE_DETAILS,
  TEMP_DEV_RETROSPECTIVE_SUMMARIES,
  TEMP_DEV_RETROSPECTIVE_TEMPLATES,
} from '@/lib/api/dev-mock-data';
import type { ApiSuccessResponse } from '@/lib/api';

export interface RetrospectiveItemResponse {
  question: string;
  answer?: string | null;
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

interface AiQuestionResponse {
  category: string;
  question: string;
  reason: string;
  priority: string;
  sourceTemplateIds: string[];
}

interface AiQuestionsResponseData {
  questionSetTitle: string;
  jobRole: string;
  processStage: string;
  questions: AiQuestionResponse[];
}

export interface CreateRetrospectivePayload {
  stageId?: string | null;
}

export interface UpsertRetrospectiveItemPayload {
  question?: string | null;
  answer?: string | null;
  isEmpty?: boolean;
}

export const retrospectiveKeys = {
  all: ['retrospectives'] as const,
  list: (applicationId: string) => ['retrospectives', 'list', applicationId] as const,
  detail: (retrospectiveId: string) => ['retrospectives', 'detail', retrospectiveId] as const,
  templates: ['retrospectives', 'templates'] as const,
};

function normalizeRetrospectiveItems(items: RetrospectiveItemResponse[]) {
  return items.map((item) => ({
    question: item.question,
    answer: item.answer ?? '',
  }));
}

export async function listApplicationRetrospectives(applicationId: string) {
  if (shouldUseTemporaryDevData()) {
    return TEMP_DEV_RETROSPECTIVE_SUMMARIES.filter(
      (retrospective) => retrospective.applicationId === applicationId
    ).map((retrospective) => ({
      id: retrospective.id,
      applicationId: retrospective.applicationId,
      stageId: retrospective.stageId,
      itemCount: retrospective.itemCount,
      createdAt: retrospective.createdAt,
      updatedAt: retrospective.updatedAt,
    }));
  }

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
  if (shouldUseTemporaryDevData()) {
    const retrospective = TEMP_DEV_RETROSPECTIVE_DETAILS.find(
      (entry) => entry.id === retrospectiveId
    );

    if (!retrospective) {
      throw new Error(`Temporary retrospective not found: ${retrospectiveId}`);
    }

    return {
      id: retrospective.id,
      applicationId: retrospective.applicationId,
      stageId: retrospective.stageId,
      items: retrospective.items,
      createdAt: retrospective.createdAt,
      updatedAt: retrospective.updatedAt,
    };
  }

  const response = await api.get<ApiSuccessResponse<RetrospectiveDetailResponse>>(
    `/api/retrospectives/${retrospectiveId}`
  );

  return {
    id: String(response.data.id),
    applicationId: String(response.data.applicationId),
    stageId: response.data.stageId === null ? null : String(response.data.stageId),
    items: normalizeRetrospectiveItems(response.data.items),
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
    items: normalizeRetrospectiveItems(response.data.items),
    createdAt: response.data.createdAt,
    updatedAt: response.data.updatedAt,
  };
}

export async function deleteRetrospective(retrospectiveId: string) {
  await api.delete(`/api/retrospectives/${retrospectiveId}`);
}

export async function addRetrospectiveItem(
  retrospectiveId: string,
  payload: {
    question: string;
    answer?: string | null;
  }
) {
  const response = await api.post<ApiSuccessResponse<RetrospectiveItemsResponseData>>(
    `/api/retrospectives/${retrospectiveId}/items`,
    payload
  );

  return {
    ...response.data,
    items: normalizeRetrospectiveItems(response.data.items),
  };
}

export async function updateRetrospectiveItem(
  retrospectiveId: string,
  index: number,
  payload: UpsertRetrospectiveItemPayload
) {
  const response = await api.patch<ApiSuccessResponse<RetrospectiveItemsResponseData>>(
    `/api/retrospectives/${retrospectiveId}/items/${index}`,
    {
      ...payload,
      isEmpty: payload.isEmpty ?? false,
    }
  );

  return {
    ...response.data,
    items: normalizeRetrospectiveItems(response.data.items),
  };
}

export async function deleteRetrospectiveItem(
  retrospectiveId: string,
  index: number
) {
  const response = await api.delete<ApiSuccessResponse<RetrospectiveItemsResponseData>>(
    `/api/retrospectives/${retrospectiveId}/items/${index}`
  );

  return {
    ...response.data,
    items: normalizeRetrospectiveItems(response.data.items),
  };
}

export async function listRetrospectiveTemplates() {
  if (shouldUseTemporaryDevData()) {
    return TEMP_DEV_RETROSPECTIVE_TEMPLATES;
  }

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
    items: normalizeRetrospectiveItems(response.data.items),
    createdAt: response.data.createdAt,
    updatedAt: response.data.updatedAt,
  };
}

export async function createRetrospectiveTemplate(payload: {
  name: string;
  questions: string[];
}) {
  const response = await api.post<ApiSuccessResponse<TemplateResponse>>(
    '/api/retrospective-templates',
    payload
  );

  return {
    id: String(response.data.id),
    name: response.data.name,
    questions: response.data.questions,
  };
}

export async function updateRetrospectiveTemplate(
  templateId: string,
  payload: {
    name?: string | null;
    questions?: string[] | null;
  }
) {
  const response = await api.patch<ApiSuccessResponse<TemplateResponse>>(
    `/api/retrospective-templates/${templateId}`,
    {
      ...payload,
      isEmpty: false,
    }
  );

  return {
    id: String(response.data.id),
    name: response.data.name,
    questions: response.data.questions,
  };
}

export async function deleteRetrospectiveTemplate(templateId: string) {
  await api.delete(`/api/retrospective-templates/${templateId}`);
}

export async function generateAiRetrospectiveQuestions(payload: {
  applicationId: string;
  stageId?: string | null;
  questionCount: number;
}) {
  const response = await api.post<ApiSuccessResponse<AiQuestionsResponseData>>(
    '/api/retrospectives/ai-questions',
    {
      applicationId: Number(payload.applicationId),
      stageId:
        payload.stageId === undefined || payload.stageId === null || payload.stageId === ''
          ? undefined
          : Number(payload.stageId),
      questionCount: payload.questionCount,
    }
  );

  return response.data.questions.map((question) => question.question);
}
