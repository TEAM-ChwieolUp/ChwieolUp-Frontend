import { api } from '@/lib/api';
import type { ApiSuccessResponse } from '@/lib/api';

export type MailProvider = 'GOOGLE' | 'NAVER' | 'OUTLOOK';
export type MailProviderParam = 'google' | 'naver' | 'outlook';
export type MailStageCategory = 'IN_PROGRESS' | 'PASSED' | 'REJECTED';

export interface MailClassificationResponse {
  isRecruitmentMail: boolean;
  stageCategory: MailStageCategory | null;
  recommendedStageId: number | null;
  recommendedStageName: string | null;
  confidence: number;
  reason: string;
}

export interface ClassifiedMailMessageResponse {
  integrationId: number | null;
  provider: MailProvider;
  accountEmail: string;
  messageId: string;
  threadId: string;
  subject: string;
  from: string;
  receivedAt: string;
  snippet: string;
  classification: MailClassificationResponse;
}

interface ClassifiedMailMessagesResponse {
  messages: ClassifiedMailMessageResponse[];
}

export interface MailIntegration {
  id: number;
  provider: MailProvider;
  accountEmail: string;
}

interface MailOAuthAuthorizeResponse {
  authorizationUrl: string;
}

export const mailKeys = {
  all: ['mail'] as const,
  classifiedMessages: (limit: number) => ['mail', 'classifiedMessages', limit] as const,
  integrations: ['mail', 'integrations'] as const,
};

export async function listClassifiedMailMessages(limit = 20) {
  const response = await api.get<
    ApiSuccessResponse<ClassifiedMailMessagesResponse>
  >('/api/mail/messages/classified', {
    params: { limit },
  });

  return response.data.messages.filter(
    (message) => message.classification.isRecruitmentMail
  );
}

export async function listMailIntegrations() {
  const response = await api.get<ApiSuccessResponse<MailIntegration[]>>(
    '/api/mail/integrations'
  );

  return response.data;
}

export async function getMailAuthorizationUrl(
  provider: MailProviderParam,
  redirectAfter = '/mail'
) {
  const response = await api.get<ApiSuccessResponse<MailOAuthAuthorizeResponse>>(
    `/api/mail/integrations/oauth/${provider}/authorize`,
    {
      params: { redirectAfter },
    }
  );

  return response.data.authorizationUrl;
}

export async function disconnectMailIntegration(integrationId: number) {
  await api.delete(`/api/mail/integrations/${integrationId}`);
}
