export interface MailThread {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  receivedAt: string;
  accent?: 'blue';
}

export interface MailBodyBlock {
  id: string;
  lines: string[];
  tone?: 'default' | 'strong';
}

export interface MailInterviewNote {
  title: string;
  items: Array<{
    label: string;
    value: string;
  }>;
}

export interface MailDetailData {
  statusLabel: string;
  statusTone: 'green';
  receivedLabel: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  recipient: string;
  recipientLabel: string;
  avatarLabel: string;
  bodyBlocks: MailBodyBlock[];
  interviewNote: MailInterviewNote;
  closingLines: string[];
}

export interface MailAiAction {
  id: string;
  tone: 'blue' | 'green';
  title: string;
  description: string[];
  accentText?: string;
  primaryAction: string;
  secondaryAction: string;
  icon: 'kanban' | 'calendar';
}

export interface MailRecord {
  thread: MailThread;
  detail: MailDetailData;
  aiActions: MailAiAction[];
}
