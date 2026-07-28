/** Money bucket: clients that came through the company vs. clients a lawyer brought in. */
export type FinancialsScope = 'COMPANY' | 'LAWYER';

/** Tabs shown on the Financials page — the report scopes plus the Consulting CRUD tab (admin/moderator only). */
export type FinancialsTab = FinancialsScope | 'CONSULTING';

/** One collection recorded against a fees contract. */
export interface IContractPayment {
  id: string;
  contractId: string;
  amount: number;
  paidAt: string;
  note: string | null;
  recordedBy?: { id: string; name: string } | null;
  createdAt: string;
}

/** A contract's money state plus its payment history — returned by every payments call. */
export interface IContractPaymentsSummary {
  contractId: string;
  totalFees: number;
  paidTotal: number;
  remaining: number;
  payments: IContractPayment[];
}

/** Lightweight contract row used by the case-level payments picker. */
export interface ICasePaymentContract {
  id: string;
  contractNumber: string | null;
  clientName: string | null;
  contractDate: string | null;
  currency: string | null;
  totalFees: number;
  paidTotal: number;
  remaining: number;
}

/** One row of the financials table — a contract with its collections rolled up. */
export interface IFinancialsRow {
  id: string;
  contractNumber: string | null;
  contractDate: string | null;
  clientName: string;
  caseId: string | null;
  caseType: string | null;
  currency: string;
  sourceLawyerId: string | null;
  sourceLawyerName: string | null;
  totalFees: number;
  paidTotal: number;
  /** Collected inside the selected period only. */
  paidInPeriod: number;
  remaining: number;
}

export interface IFinancialsLawyerTotals {
  lawyerId: string;
  name: string;
  contractsTotal: number;
  paidTotal: number;
  remainingTotal: number;
  contractsCount: number;
}

export interface IFinancialsSummary {
  scope: FinancialsScope;
  year: number | null;
  month: number | null;
  contractsCount: number;
  /** Value of contracts signed inside the period. */
  contractsTotal: number;
  /** Lifetime collections on those contracts. */
  paidTotal: number;
  /** Collections that happened inside the period. */
  paidInPeriod: number;
  /** Lifetime debt still owed on those contracts. */
  remainingTotal: number;
  byLawyer: IFinancialsLawyerTotals[];
}
