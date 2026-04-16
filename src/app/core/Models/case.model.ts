export type CaseType =
  | 'CRIMINAL'
  | 'ADMINISTRATIVE'
  | 'LABOR'
  | 'COMMERCIAL'
  | 'PENAL'
  | 'GENERAL'
  | 'PERSONAL_STATUS'
  | 'OTHER';

export interface IDataCase {
  id: string;
  customerId: string;
  caseType: CaseType;
  otherCaseType: string | null;
  caseDate: string;

  wantsSpecificLawyer: boolean;
  preferredLawyerId: string | null;
  sessionReceiverId: string | null;
  sessionDate: string | null;

  hasStructuredNotes: boolean;
  weaknesses: string[];
  strengths: string[];
  gaps: string[];
  freeNotes: string | null;

  reportFileId: string | null;
  reportUrl: string | null;
  sentToClientAt: string | null;

  createdById: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;

  customer?: { id: string; fullName: string; email: string; phone: string } | null;
  preferredLawyer?: { id: string; name: string } | null;
  sessionReceiver?: { id: string; name: string } | null;
  createdBy?: { id: string; name: string } | null;
}

export interface ILawyerOption {
  id: string;
  name: string;
  email: string;
}

/**
 * Display order + Arabic labels for the case-type checkbox grid.
 * Mirrors the backend CASE_TYPE_LABELS — the report renders them in this order.
 */
export const CASE_TYPE_OPTIONS: { value: CaseType; label: string }[] = [
  { value: 'CRIMINAL', label: 'جنائية' },
  { value: 'ADMINISTRATIVE', label: 'إدارية' },
  { value: 'LABOR', label: 'عمالية' },
  { value: 'COMMERCIAL', label: 'تجارية' },
  { value: 'PENAL', label: 'جزائية' },
  { value: 'GENERAL', label: 'عامة' },
  { value: 'PERSONAL_STATUS', label: 'أحوال شخصية' },
  { value: 'OTHER', label: 'أخرى' },
];

export const REPORT_REQUIREMENTS: string[] = [
  'صورة الهوية',
  'رقم جوال أبشر',
  'العنوان الوطني',
  'صورة من المستندات',
  'تحميل تطبيق نفاذ',
];
