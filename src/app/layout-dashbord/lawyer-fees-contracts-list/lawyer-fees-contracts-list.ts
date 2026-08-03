import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DashboardCrudPage } from '../dashboard-crud-page/dashboard-crud-page';
import { ILawyerFeesContract } from '../../core/Models/lawyer-fees-contract.model';
import { IColumn } from '../types/shared';

@Component({
  selector: 'app-lawyer-fees-contracts-list',
  standalone: false,
  templateUrl: './lawyer-fees-contracts-list.html',
  styleUrl: './lawyer-fees-contracts-list.scss',
})
export class LawyerFeesContractsList implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;

  constructor(private router: Router, private translate: TranslateService) { }

  endpoint = signal<string>('lawyer-fees-contracts');
  columns: IColumn[] = [];
  searchFields = ['contractNumber', 'clientName', 'clientIdNumber'];

  /** Contract the payments dialog is currently opened on. */
  activeContractId = signal<string | null>(null);
  paymentsVisible = signal<boolean>(false);

  /** Same rule as the cases list — collections stay with the staff who own them. */
  get canManagePayments(): boolean {
    const raw = sessionStorage.getItem('user');
    return ['ADMIN', 'MODERATOR'].includes(raw ? JSON.parse(raw)?.role : '');
  }

  dataMapper = (item: ILawyerFeesContract, index: number) => ({
    ...item,
    index: index + 1,
    contractNumberDisplay:
      item.contractNumber ?? (item.id ? item.id.slice(0, 4).toUpperCase() : ''),
    clientNameDisplay: item.clientName ?? item.customer?.fullName ?? '—',
    contractDateFormatted: item.contractDate ? this.formatDate(item.contractDate) : '—',
    totalFeesFormatted: item.totalFees != null ? `${item.totalFees}` : '—',
    statusLabel: item.secondPartySignedAt
      ? this.translate.instant('signed')
      : item.sentToClientAt
        ? this.translate.instant('sent')
        : this.translate.instant('draft'),
    createdAtFormatted: item.createdAt ? this.formatDate(item.createdAt) : '',
  });

  private formatDate(value: string | Date): string {
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '';
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}/${month}/${day}`;
  }

  ngOnInit() {
    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('contract_number'), value: 'contractNumberDisplay' },
      { key: this.translate.instant('client_name'), value: 'clientNameDisplay', frozen: true },
      { key: this.translate.instant('contract_date'), value: 'contractDateFormatted' },
      { key: this.translate.instant('total_fees'), value: 'totalFeesFormatted' },
      { key: this.translate.instant('status'), value: 'statusLabel' },
      { key: this.translate.instant('created_at'), value: 'createdAtFormatted' },
    ];
  }

  onEdit(item: ILawyerFeesContract) {
    this.router.navigate(['/dashboard/content/lawyer-fees-contract', item.id]);
  }

  onAddNew() {
    this.router.navigate(['/dashboard/content/lawyer-fees-contract', 'new']);
  }

  onManagePayments(item: ILawyerFeesContract) {
    if (!item.id) return;
    this.activeContractId.set(item.id);
    this.paymentsVisible.set(true);
  }

  /** Totals shown in the table move with the collections, so reload the page. */
  onPaymentsChanged() {
    this.crudPage?.refresh();
  }

  onOpenDriveFolder(item: ILawyerFeesContract) {
    const folderId = item.customer?.caseReportsFolderId;
    if (!folderId) return;
    window.open(`https://drive.google.com/drive/folders/${folderId}`, '_blank');
  }
}
