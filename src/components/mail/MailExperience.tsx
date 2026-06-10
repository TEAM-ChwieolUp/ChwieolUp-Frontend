'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import AiAnalysis from './ai-analysis/AiAnalysis';
import MailDetail from './mail-detail/MailDetail';
import MailList from './mail-list/MailList';
import type { MailAiAction, MailDetailData, MailRecord, MailThread } from './types';
import {
  ClassifiedMailMessageResponse,
  disconnectMailIntegration,
  listClassifiedMailMessages,
  listMailIntegrations,
  mailKeys,
} from '@/features/mail/api/mail';
import { ApiError } from '@/lib/api';
import styles from '@/app/(dashboard)/mail/page.module.scss';

const CLASSIFIED_MAIL_LIMIT = 60;

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function formatReceivedLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function getSenderParts(from: string) {
  const match = from.match(/^(.*?)\\s*<([^>]+)>$/);

  if (!match) {
    return {
      name: from,
      email: from,
    };
  }

  return {
    name: match[1].replace(/^"|"$/g, '').trim() || match[2],
    email: match[2],
  };
}

function getAvatarLabel(name: string) {
  const compact = name.trim();

  if (!compact) {
    return 'M';
  }

  return compact.slice(0, 2).toUpperCase();
}

function isRecruitmentMail(message: ClassifiedMailMessageResponse) {
  return (
    message.classification.recruitmentMail ??
    message.classification.isRecruitmentMail ??
    false
  );
}

function getStatusLabel(message: ClassifiedMailMessageResponse) {
  const { classification } = message;

  if (!isRecruitmentMail(message)) {
    return '일반 메일';
  }

  if (classification.recommendedStageName) {
    return classification.recommendedStageName;
  }

  if (classification.stageCategory === 'PASSED') {
    return '합격 감지';
  }

  if (classification.stageCategory === 'REJECTED') {
    return '불합격 감지';
  }

  return '채용 메일';
}

function getStageCategoryLabel(category: ClassifiedMailMessageResponse['classification']['stageCategory']) {
  switch (category) {
    case 'IN_PROGRESS':
      return '진행 중';
    case 'PASSED':
      return '합격';
    case 'REJECTED':
      return '불합격';
    default:
      return '-';
  }
}

function mapMessageToAiActions(
  message: ClassifiedMailMessageResponse
): MailAiAction[] {
  const { classification } = message;

  if (!isRecruitmentMail(message)) {
    return [];
  }

  const actions: MailAiAction[] = [];

  if (classification.recommendedStageId !== null) {
    actions.push({
      id: `${message.messageId}-stage`,
      tone: 'blue',
      icon: 'kanban',
      title: '칸반 보드에서',
      accentText: classification.recommendedStageName
        ? `[${classification.recommendedStageName}]`
        : undefined,
      description: [
        classification.recommendedStageName
          ? '단계로 이동을 검토해보세요.'
          : '채용 단계 변경이 감지되었습니다.',
        classification.reason,
      ],
      primaryAction: '확인',
      secondaryAction: '닫기',
    });
  }

  return actions;
}

function mapMessageToRecord(message: ClassifiedMailMessageResponse): MailRecord {
  const sender = getSenderParts(message.from);
  const receivedLabel = formatReceivedLabel(message.receivedAt);
  const { classification } = message;
  const confidencePercent = Math.round(classification.confidence * 100);
  const statusLabel = getStatusLabel(message);
  const thread: MailThread = {
    id: message.messageId,
    sender: sender.name,
    subject: message.subject,
    preview: message.snippet,
    receivedAt: receivedLabel,
    accent: isRecruitmentMail(message) ? 'blue' : undefined,
  };
  const detail: MailDetailData = {
    statusLabel,
    statusTone: 'green',
    receivedLabel: `수신 시간 ${receivedLabel}`,
    subject: message.subject,
    senderName: sender.name,
    senderEmail: sender.email,
    recipient: message.accountEmail,
    recipientLabel: `${message.provider} 계정`,
    avatarLabel: getAvatarLabel(sender.name),
    bodyBlocks: [
      {
        id: `${message.messageId}-snippet`,
        lines: [message.snippet || '메일 미리보기가 없습니다.'],
      },
      {
        id: `${message.messageId}-reason`,
        tone: 'strong',
        lines: [classification.reason],
      },
    ],
    interviewNote: {
      title: 'AI 분류 결과',
      items: [
        {
          label: '채용 메일',
          value: isRecruitmentMail(message) ? '예' : '아니오',
        },
        {
          label: '단계 분류',
          value: getStageCategoryLabel(classification.stageCategory),
        },
        {
          label: '추천 단계',
          value: classification.recommendedStageName ?? '-',
        },
        {
          label: '추천 단계 ID',
          value:
            classification.recommendedStageId === null
              ? '-'
              : String(classification.recommendedStageId),
        },
        {
          label: '신뢰도',
          value: `${confidencePercent}%`,
        },
        {
          label: '분류 사유',
          value: classification.reason || '-',
        },
      ],
    },
    closingLines: ['메일 본문 전체는 현재 API 응답에 포함되어 있지 않습니다.'],
  };

  return {
    thread,
    detail,
    aiActions: mapMessageToAiActions(message),
    aiSummary: statusLabel,
  };
}

export default function MailExperience() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);

  const messagesQuery = useQuery({
    queryKey: mailKeys.classifiedMessages(CLASSIFIED_MAIL_LIMIT),
    queryFn: () => listClassifiedMailMessages(CLASSIFIED_MAIL_LIMIT),
  });

  const integrationsQuery = useQuery({
    queryKey: mailKeys.integrations,
    queryFn: listMailIntegrations,
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnectMailIntegration,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: mailKeys.integrations });
      await queryClient.invalidateQueries({ queryKey: mailKeys.all });
    },
    onError: (error) => {
      window.alert(
        getApiErrorMessage(error, '메일 계정 연결 해제 중 오류가 발생했습니다.')
      );
    },
  });

  const records = useMemo(
    () => (messagesQuery.data ?? []).map(mapMessageToRecord),
    [messagesQuery.data]
  );

  const selectedId = activeId ?? records[0]?.thread.id ?? null;
  const activeMail =
    records.find((record) => record.thread.id === selectedId) ?? records[0] ?? null;
  const errorMessage = messagesQuery.isError
    ? getApiErrorMessage(messagesQuery.error, '메일 목록을 불러오지 못했습니다.')
    : integrationsQuery.isError
      ? getApiErrorMessage(
        integrationsQuery.error,
        '메일 계정 연결 목록을 불러오지 못했습니다.'
      )
      : null;

  function handleOpenMailSettings() {
    router.push('/more?tab=mail-sync');
  }

  function handleDisconnect(integrationId: number) {
    disconnectMutation.mutate(integrationId);
  }

  return (
    <div className={styles.page}>
      <MailList
        threads={records.map((record) => record.thread)}
        activeId={selectedId}
        integrations={integrationsQuery.data ?? []}
        isLoading={messagesQuery.isLoading || integrationsQuery.isLoading}
        errorMessage={errorMessage}
        onSelect={setActiveId}
        onOpenMailSettings={handleOpenMailSettings}
        onDisconnect={handleDisconnect}
      />

      <div className={styles.content}>
        <div className={styles.contentInner}>
          {activeMail ? (
            <>
              <MailDetail mail={activeMail.detail} />
              <AiAnalysis
                actions={activeMail.aiActions}
                summary={activeMail.aiSummary}
              />
            </>
          ) : (
            <section className={styles.emptyState}>
              메일 계정을 연결하면 채용 메일 분석 결과가 표시됩니다.
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
