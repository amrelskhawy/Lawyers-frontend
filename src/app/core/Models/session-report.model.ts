import { IDataCase } from './case.model';

export interface IDataSessionReport {
  id: string;
  caseId: string;

  sessionDate: string | null;
  sessionTitle: string | null;
  sessionSummary: string | null;
  courtDecision: string | null;
  lawyerNotes: string | null;
  nextSessionDate: string | null;

  reportNumber: string | null;
  courtName: string | null;
  courtCircuit: string | null;
  caseCharge: string | null;
  opponentName: string | null;
  caseNumber: string | null;
  caseData: string | null;
  sessionOrdinal: string | null;
  attendanceOrdinal: string | null;
  sessionTime: string | null;
  hijriDate: string | null;
  closingNote: string | null;

  reportFileId: string | null;
  reportUrl: string | null;
  sentToClientAt: string | null;

  createdById: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;

  case?: IDataCase | null;
  createdBy?: { id: string; name: string } | null;
}
