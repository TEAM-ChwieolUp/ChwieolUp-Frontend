export type EventCategory = '채용공고' | '내 프로세스' | '개인 일정';
export type EventType = '마감' | '면접' | '코딩테스트' | '스터디' | '기타';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  allDay?: boolean;
  category: EventCategory;
  type: EventType;
  company?: string;
  location?: string;
  description?: string;
}

export interface NewEventForm {
  title: string;
  date: string;
  time: string;
  allDay: boolean;
  type: EventType;
  category: EventCategory;
  company: string;
  location: string;
  description: string;
}

export const EVENT_TYPE_OPTIONS: EventType[] = ['마감', '면접', '코딩테스트', '스터디', '기타'];
export const CATEGORY_OPTIONS: EventCategory[] = ['채용공고', '내 프로세스', '개인 일정'];
export const DUMMY_COMPANIES = ['라인', '토스페이먼츠', '카카오', '네이버', '쿠팡', '배달의민족'];
