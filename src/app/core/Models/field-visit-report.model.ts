export interface IFieldVisitReport {
  id: string;
  caseId: string;

  reviewLawyer:  string | null;
  reviewPlace:   string | null;
  agencyNumber:  string | null;
  clientName:    string | null;
  caseNumber:    string | null;
  reviewDate:    string | null;
  reportSummary: string | null;

  reportFileId:      string | null;
  reportUrl:         string | null;
  reportGeneratedAt: string | null;
  sentToClientAt:    string | null;

  createdById: string;
  isDeleted:   boolean;
  createdAt:   string;
  updatedAt:   string;

  case?: {
    customer?: { id: string; fullName: string; email?: string | null; phone: string } | null;
  } | null;
  createdBy?: { id: string; name: string } | null;
}
