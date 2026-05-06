export interface RetrospectiveItem {
  question: string;
  answer: string;
}

export interface RetrospectiveSummary {
  id: string;
  applicationId: string;
  stageId: string | null;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  company: string;
  position: string;
  stageName: string;
  stageColor: string;
  isOverall: boolean;
}

export interface RetrospectiveDetail extends RetrospectiveSummary {
  items: RetrospectiveItem[];
}

export interface RetrospectiveTemplate {
  id: string;
  name: string;
  questions: string[];
}

export interface RetrospectiveEditorForm {
  applicationId: string;
  stageId: string;
  items: RetrospectiveItem[];
}

export const OVERALL_STAGE_NAME = '종합';
export const OVERALL_STAGE_COLOR = '#64748b';
