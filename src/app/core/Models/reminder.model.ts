export type ReminderType =
  | 'SESSION_DETAILS_REVIEW'
  | 'MEMO_REVIEW_UPLOAD'
  | 'URGENT_SESSION_SOON'
  | 'CUSTOM';

export type ReminderStatus = 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';

export interface IReminder {
  id: string;
  caseId: string;
  type: ReminderType;
  title?: string | null;
  content?: string | null;
  scheduledAt: string;
  repeat: boolean;
  repeatEveryHours?: number | null;
  status: ReminderStatus;
  lastSentAt?: string | null;
  sentCount: number;
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IReminderTypeOption {
  value: ReminderType;
  description: string;
}
