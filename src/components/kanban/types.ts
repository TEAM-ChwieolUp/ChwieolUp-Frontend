export type FinalResult = '합격' | '불합격' | null;
export type Tag = string;

export interface KanbanStage {
  id: string;
  name: string;
  color: string;
  kind: 'custom' | 'final';
  locked?: boolean;
}

export interface KanbanCard {
  id: string;
  company: string;
  position: string;
  appliedDate: string; // 'M/D' 형식
  stageId: string;
  tags: Tag[];
  nextAction?: string;
  noResponseDays?: number; // 무응답 N일째
  finalResult?: FinalResult;
  memo?: string;
}

export interface KanbanFormValues {
  company: string;
  position: string;
  appliedDate: string;
  stageId: string;
  tags: Tag[];
  nextAction: string;
  noResponseDays: string;
  finalResult: FinalResult;
  memo: string;
}

export const FINAL_STAGE_ID = 'final-result';

export const FINAL_STAGE: KanbanStage = {
  id: FINAL_STAGE_ID,
  name: '최종 결과',
  color: '#22c55e',
  kind: 'final',
  locked: true,
};

export const DEFAULT_CUSTOM_STAGES: KanbanStage[] = [
  {
    id: 'applied',
    name: '지원 완료',
    color: '#64748b',
    kind: 'custom',
  },
  {
    id: 'screening',
    name: '서류 검토',
    color: '#3b82f6',
    kind: 'custom',
  },
  {
    id: 'process',
    name: '전형 진행',
    color: '#f59e0b',
    kind: 'custom',
  },
  {
    id: 'interview',
    name: '면접',
    color: '#f97316',
    kind: 'custom',
  },
];

export const INITIAL_STAGES: KanbanStage[] = [
  ...DEFAULT_CUSTOM_STAGES,
  FINAL_STAGE,
];

export const TAG_SUGGESTIONS: Tag[] = [
  '관심기업',
  '대기업',
  '스타트업',
  '인턴',
  '정규직',
  '리모트',
  '포트폴리오 제출',
  '추천 채용',
];

export const STAGE_COLOR_PRESETS = [
  '#64748b',
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#f97316',
  '#14b8a6',
  '#ef4444',
  '#22c55e',
];
