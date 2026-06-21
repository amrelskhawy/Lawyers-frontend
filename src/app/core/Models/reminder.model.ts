export type ReminderType =
  | 'SESSION_DETAILS_REVIEW'
  | 'MEMO_REVIEW_UPLOAD'
  | 'URGENT_SESSION_SOON'
  | 'CUSTOM'
  | 'MEMO_REQUEST';

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
  autoScheduled?: boolean;
  createdById?: string;
  recipientId?: string | null;
  memoDeadline?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IConsultantReminder extends IReminder {
  case?: {
    id: string;
    agencyNumber: string | null;
    needsMemo: boolean;
    memoDeadline: string | null;
    memoType: string | null;
    customer?: { fullName: string } | null;
    consultant?: { name: string; nameAr?: string | null } | null;
    sessionReports?: { caseNumber?: string | null; courtName?: string | null }[];
  } | null;
  createdBy?: { name: string; nameAr?: string | null } | null;
}

export interface IReminderTypeOption {
  value: ReminderType;
  description: string;
}

export interface IAttachment {
  id: string;
  caseId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  sentAt?: string | null;
  createdAt: string;
}
