import type { CalendarEvent } from '@/components/calendar/types';
import type { KanbanCard, KanbanStage } from '@/components/kanban/types';
import type {
  RetrospectiveDetail,
  RetrospectiveSummary,
  RetrospectiveTemplate,
} from '@/components/retrospective/types';
import type { TagResponse } from '@/features/kanban/api/tags';
import type { UserProfile } from '@/features/user/api/profile';

export const TEMP_DEV_STAGES: KanbanStage[] = [
  {
    id: '101',
    name: '지원 완료',
    color: '#64748b',
    displayOrder: 0,
    category: 'IN_PROGRESS',
    kind: 'custom',
    locked: false,
  },
  {
    id: '102',
    name: '서류 검토',
    color: '#3b82f6',
    displayOrder: 1,
    category: 'IN_PROGRESS',
    kind: 'custom',
    locked: false,
  },
  {
    id: '103',
    name: '최종 합격',
    color: '#22c55e',
    displayOrder: 2,
    category: 'PASSED',
    kind: 'passed',
    locked: true,
  },
  {
    id: '104',
    name: '불합격',
    color: '#ef4444',
    displayOrder: 3,
    category: 'REJECTED',
    kind: 'rejected',
    locked: true,
  },
];

export const TEMP_DEV_CARDS: KanbanCard[] = [
  {
    id: '1001',
    company: 'OpenAI Korea',
    position: 'Frontend Engineer Intern',
    appliedDate: '5/8',
    appliedAt: '2026-05-08T09:00:00.000Z',
    deadlineAt: '2026-05-15T14:59:59.000Z',
    stageId: '101',
    tags: ['관심기업'],
    tagIds: [1],
    noResponseDays: 2,
    memo: '임시 로그인 검증용 더미 카드',
    priority: 'HIGH',
    jobPostingUrl: 'https://example.com/jobs/frontend-intern',
    finalResult: null,
  },
];

export const TEMP_DEV_TAGS: TagResponse[] = [
  {
    id: 1,
    name: '관심기업',
    color: '#2563eb',
  },
];

export const TEMP_DEV_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: '2001',
    applicationId: '1001',
    category: 'APPLICATION_PROCESS',
    title: 'OpenAI Korea 과제 제출',
    startAt: '2026-05-10T04:00:00.000Z',
    endAt: '2026-05-10T06:00:00.000Z',
    applicationName: 'OpenAI Korea',
  },
  {
    id: '2002',
    applicationId: null,
    category: 'PERSONAL',
    title: '포트폴리오 정리',
    startAt: '2026-05-12T10:00:00.000Z',
    endAt: '2026-05-12T12:00:00.000Z',
  },
];

export const TEMP_DEV_PROFILE: UserProfile = {
  id: 0,
  oauth2Provider: 'GOOGLE',
  email: 'dev@chwieolup.local',
  name: 'Dev User',
  profileImageUrl: null,
};

export const TEMP_DEV_RETROSPECTIVE_SUMMARIES: RetrospectiveSummary[] = [
  {
    id: '3001',
    applicationId: '1001',
    stageId: '101',
    itemCount: 2,
    createdAt: '2026-05-08T11:00:00.000Z',
    updatedAt: '2026-05-08T12:30:00.000Z',
    company: 'OpenAI Korea',
    position: 'Frontend Engineer Intern',
    stageName: '지원 완료',
    stageColor: '#64748b',
    isOverall: false,
  },
];

export const TEMP_DEV_RETROSPECTIVE_DETAILS: RetrospectiveDetail[] = [
  {
    ...TEMP_DEV_RETROSPECTIVE_SUMMARIES[0],
    items: [
      {
        question: '이번 지원에서 잘한 점은 무엇인가요?',
        answer: '이력서와 포트폴리오를 공고 요구사항에 맞춰 다시 정리했다.',
      },
      {
        question: '다음 지원 전에 보완할 점은 무엇인가요?',
        answer: '프로젝트 성과를 수치로 더 명확하게 적고, 자기소개 문장을 더 짧게 다듬어야 한다.',
      },
    ],
  },
];

export const TEMP_DEV_RETROSPECTIVE_TEMPLATES: RetrospectiveTemplate[] = [
  {
    id: '4001',
    name: '기본 회고 템플릿',
    questions: [
      '이번 지원에서 잘한 점은 무엇인가요?',
      '다음 지원 전에 보완할 점은 무엇인가요?',
      '다음 액션으로 바로 할 일은 무엇인가요?',
    ],
  },
];
