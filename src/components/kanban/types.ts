export type FinalResult = '합격' | '불합격' | null;
export type Tag = string;
export type StageCategory = 'IN_PROGRESS' | 'PASSED' | 'REJECTED';
export type KanbanStageKind = 'custom' | 'passed' | 'rejected';
export type Priority = 'LOW' | 'NORMAL' | 'HIGH';

export interface KanbanStage {
  id: string;
  name: string;
  color: string;
  displayOrder: number;
  category: StageCategory;
  kind: KanbanStageKind;
  locked: boolean;
}

export interface KanbanCard {
  id: string;
  company: string;
  position: string;
  appliedDate: string; // 'M/D' 형식
  appliedAt?: string | null;
  deadlineAt?: string | null;
  stageId: string;
  tags: Tag[];
  tagIds?: number[];
  nextAction?: string;
  noResponseDays?: number; // 무응답 N일째
  finalResult?: FinalResult;
  memo?: string;
  priority?: Priority;
  jobPostingUrl?: string;
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

export const DEFAULT_CUSTOM_STAGES: KanbanStage[] = [
  {
    id: 'applied',
    name: '지원 완료',
    color: '#64748b',
    displayOrder: 0,
    category: 'IN_PROGRESS',
    kind: 'custom',
    locked: false,
  },
  {
    id: 'screening',
    name: '서류 검토',
    color: '#3b82f6',
    displayOrder: 1,
    category: 'IN_PROGRESS',
    kind: 'custom',
    locked: false,
  },
  {
    id: 'process',
    name: '전형 진행',
    color: '#f59e0b',
    displayOrder: 2,
    category: 'IN_PROGRESS',
    kind: 'custom',
    locked: false,
  },
  {
    id: 'interview',
    name: '면접',
    color: '#f97316',
    displayOrder: 3,
    category: 'IN_PROGRESS',
    kind: 'custom',
    locked: false,
  },
];

export const INITIAL_STAGES: KanbanStage[] = [
  ...DEFAULT_CUSTOM_STAGES,
  {
    id: 'passed',
    name: '최종 합격',
    color: '#22c55e',
    displayOrder: 4,
    category: 'PASSED',
    kind: 'passed',
    locked: true,
  },
  {
    id: 'rejected',
    name: '불합격',
    color: '#ef4444',
    displayOrder: 5,
    category: 'REJECTED',
    kind: 'rejected',
    locked: true,
  },
];

export const FIXED_STAGE_KINDS: KanbanStageKind[] = ['passed', 'rejected'];

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
