export type RetroStage = '서류' | '코테' | '면접' | '최종';

export interface RetroSection {
  id: string;
  title: string;
  content: string;
}

export interface Retrospective {
  id: string;
  company: string;
  position: string;
  stage: RetroStage;
  date: string; // YYYY-MM-DD
  question: string;
  answer: string;
  reflection: string;
  feeling: string;
  extraSections: RetroSection[];
}

export interface NewRetroForm {
  company: string;
  position: string;
  stage: RetroStage;
  date: string;
  question: string;
  answer: string;
  reflection: string;
  feeling: string;
  extraSections: RetroSection[];
}

export const STAGE_OPTIONS: RetroStage[] = ['서류', '코테', '면접', '최종'];

export const STAGE_COLORS: Record<RetroStage, { bg: string; text: string }> = {
  서류: { bg: '#dbeafe', text: '#2563eb' },
  코테: { bg: '#ede9fe', text: '#7c3aed' },
  면접: { bg: '#ffedd5', text: '#ea580c' },
  최종: { bg: '#dcfce7', text: '#16a34a' },
};
