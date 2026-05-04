export interface ILawyerFeesContract {
  id: string;

  customerId: string | null;
  caseId:     string | null;

  contractNumber: string | null;
  contractDay:    string | null;
  contractDate:   string | null;
  hijriDate:      string | null;

  clientName:     string | null;
  clientIdNumber: string | null;
  clientPhone:    string | null;

  serviceDescription: string | null;

  totalFees:         string | number | null;
  firstInstallment:  string | number | null;
  secondInstallment: string | number | null;
  otherFees:         string | null;
  currency:          string | null;

  firstPartySignature:  string | null;
  firstPartySignedAt:   string | null;
  secondPartySignature: string | null;
  secondPartySignedAt:  string | null;

  reportFileId:      string | null;
  reportUrl:         string | null;
  reportGeneratedAt: string | null;
  sentToClientAt:    string | null;

  createdById: string;
  isDeleted:   boolean;
  createdAt:   string;
  updatedAt:   string;

  customer?: { id: string; fullName: string; email?: string | null; phone: string; caseReportsFolderId?: string | null } | null;
  case?:     { id: string; caseType: string; caseDate: string; agencyNumber: string | null; customerId: string } | null;
  createdBy?: { id: string; name: string } | null;
}
