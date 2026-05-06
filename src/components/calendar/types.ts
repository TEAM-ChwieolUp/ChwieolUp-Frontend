export type ScheduleCategory = 'JOB_POSTING' | 'APPLICATION_PROCESS' | 'PERSONAL';

export interface CalendarEvent {
  id: string;
  applicationId: string | null;
  category: ScheduleCategory;
  title: string;
  startAt: string;
  endAt: string | null;
  applicationName?: string;
}

export interface CalendarApplicationOption {
  id: string;
  companyName: string;
  position: string;
}

export interface EventFormValues {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  category: ScheduleCategory;
  applicationId: string;
}

export const CATEGORY_OPTIONS: ScheduleCategory[] = [
  'JOB_POSTING',
  'APPLICATION_PROCESS',
  'PERSONAL',
];

export const CATEGORY_LABELS: Record<ScheduleCategory, string> = {
  JOB_POSTING: '채용공고',
  APPLICATION_PROCESS: '내 프로세스',
  PERSONAL: '개인 일정',
};

export const CATEGORY_DESCRIPTIONS: Record<ScheduleCategory, string> = {
  JOB_POSTING: '채용공고 접수 시작, 마감, 설명회 일정을 관리합니다.',
  APPLICATION_PROCESS: '면접, 코딩테스트, 발표 일정 등 채용 프로세스를 관리합니다.',
  PERSONAL: '스터디, 회고, 개인 학습 일정 등을 관리합니다.',
};
