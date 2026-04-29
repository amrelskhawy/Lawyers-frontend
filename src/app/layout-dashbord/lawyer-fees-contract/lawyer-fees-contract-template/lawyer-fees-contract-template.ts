import { Component, Input, signal } from '@angular/core';

export interface LawyerFeesContractPreviewData {
  contractNumber?:    string | null;
  contractDay?:       string | null;
  contractDate?:      string | Date | null;
  hijriDate?:         string | null;

  clientName?:        string | null;
  clientIdNumber?:    string | null;
  clientPhone?:       string | null;

  serviceDescription?: string | null;

  totalFees?:         string | number | null;
  firstInstallment?:  string | number | null;
  secondInstallment?: string | number | null;
  currency?:          string | null;
}

@Component({
  selector: 'app-lawyer-fees-contract-template',
  standalone: false,
  templateUrl: './lawyer-fees-contract-template.html',
  styleUrl: './lawyer-fees-contract-template.scss',
})
export class LawyerFeesContractTemplate {
  data = signal<LawyerFeesContractPreviewData>({});

  @Input() set value(v: LawyerFeesContractPreviewData | null | undefined) {
    this.data.set(v ?? {});
  }

  formattedDate(value: string | Date | null | undefined): string {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day} / ${month} / ${d.getFullYear()}`;
  }

  amount(v: string | number | null | undefined): string {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    return isNaN(n) ? String(v) : n.toLocaleString();
  }
}
