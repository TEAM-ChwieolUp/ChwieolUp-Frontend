export type KanbanStage = '지원완료' | '서류통과' | '코테/과제' | '면접' | '최종결과';
export type FinalResult = '합격' | '불합격' | null;
export type Tag =
  | '관심기업'
  | '핀테크'
  | '스타트업'
  | '대기업'
  | '외국계'
  | 'AI'
  | '백엔드'
  | '프론트엔드';

export interface KanbanCard {
  id: string;
  company: string;
  position: string;
  appliedDate: string; // 'M/D' 형식
  stage: KanbanStage;
  tags: Tag[];
  nextAction?: string;
  noResponseDays?: number; // 무응답 N일째
  finalResult?: FinalResult;
}

export interface NewCardForm {
  company: string;
  position: string;
  appliedDate: string;
  stage: KanbanStage;
  tags: Tag[];
  nextAction: string;
}

export const ALL_STAGES: KanbanStage[] = [
  '지원완료',
  '서류통과',
  '코테/과제',
  '면접',
  '최종결과',
];

export const ALL_TAGS: Tag[] = [
  '관심기업',
  '핀테크',
  '스타트업',
  '대기업',
  '외국계',
  'AI',
  '백엔드',
  '프론트엔드',
];

export const STAGE_COLORS: Record<KanbanStage, string> = {
  '지원완료': '#6b7280',
  '서류통과': '#3b82f6',
  '코테/과제': '#f59e0b',
  '면접': '#f97316',
  '최종결과': '#22c55e',
};
