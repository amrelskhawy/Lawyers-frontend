export type CaseAssignmentStatus = 'UNASSIGNED' | 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type CaseType =
  | 'CRIMINAL'
  | 'ADMINISTRATIVE'
  | 'LABOR'
  | 'COMMERCIAL'
  | 'PENAL'
  | 'GENERAL'
  | 'PERSONAL_STATUS'
  | 'OTHER';

/** Litigation degree (درجة التقاضي) — each degree has a fixed display color. */
export type CaseDegree = 'FIRST_INSTANCE' | 'APPEAL' | 'CASSATION' | 'PETITION' | 'OTHER';

export interface IDataCase {
  id: string;
  customerId: string;
  caseType: CaseType;
  otherCaseType: string | null;
  caseDegree: CaseDegree | null;
  otherDegreeText: string | null;
  caseDate: string;
  hijriDate: string | null;
  agencyNumber: string | null;

  // Lawyer slot
  wantsSpecificLawyer: boolean;
  preferredLawyerId: string | null;
  preferredLawyerName: string | null;
  assignmentStatus: CaseAssignmentStatus;
  assignmentRejectedAt: string | null;
  assignmentRejectionReason: string | null;
  // Consultant slot (independent lifecycle)
  consultantId: string | null;
  consultantName: string | null;
  consultantAssignmentStatus: CaseAssignmentStatus;
  consultantAssignmentRejectedAt: string | null;
  consultantAssignmentRejectionReason: string | null;
  sessionReceiverId: string | null;
  sessionReceiverName: string | null;
  // Canonical session date is Hijri (sessionHijriDate + sessionTime); sessionDate
  // is the derived Gregorian instant used by the reminder scheduler.
  sessionHijriDate: string | null;
  sessionTime: string | null;
  sessionDate: string | null;

  hasStructuredNotes: boolean;
  weaknesses: string[];
  strengths: string[];
  gaps: string[];
  freeNotes: string | null;

  reportFileId: string | null;
  reportUrl: string | null;
  sentToClientAt: string | null;

  // Set when the case is marked "fully completed" from the reminders dialog.
  completedAt: string | null;
  completedById?: string | null;

  // Whether a consultant memo has been requested for this case.
  needsMemo?: boolean;
  memoDeadline?: string | null;
  memoType?: string | null;

  createdById: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;

  customer?: { id: string; fullName: string; email: string; phone: string; caseReportsFolderId?: string | null } | null;
  preferredLawyer?: { id: string; name: string } | null;
  consultant?: { id: string; name: string } | null;
  sessionReceiver?: { id: string; name: string } | null;
  createdBy?: { id: string; name: string } | null;
}

export type AssignmentKind = 'LAWYER' | 'CONSULTANT';

export interface ILawyerOption {
  id: string;
  name: string;
  email: string;
  role?: string;
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

/**
 * Litigation degrees (الدرجات) with their fixed colors:
 * الابتدائية = أخضر، الاستئناف = أصفر، النقض = أزرق، الالتماس = برتقالي.
 * `colorLight` is the gradient end used by the dashboard stat cards.
 */
export const CASE_DEGREE_OPTIONS: {
  value: CaseDegree;
  label: string;
  color: string;
  colorLight: string;
}[] = [
  { value: 'FIRST_INSTANCE', label: 'الابتدائية', color: '#16a34a', colorLight: '#4ade80' },
  { value: 'APPEAL', label: 'الاستئناف', color: '#eab308', colorLight: '#facc15' },
  { value: 'CASSATION', label: 'النقض', color: '#2563eb', colorLight: '#60a5fa' },
  { value: 'PETITION', label: 'الالتماس', color: '#f97316', colorLight: '#fb923c' },
  { value: 'OTHER', label: 'أخرى', color: '#8b5cf6', colorLight: '#a78bfa' },
];

export const REPORT_REQUIREMENTS: string[] = [
  'صورة الهوية',
  'رقم جوال أبشر',
  'العنوان الوطني',
  'صورة من المستندات',
  'تحميل تطبيق نفاذ',
];
