import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DashboardCrudPage } from '../dashboard-crud-page/dashboard-crud-page';
import { ILawyerFeesContract } from '../../core/Models/lawyer-fees-contract.model';

@Component({
  selector: 'app-lawyer-fees-contracts-list',
  standalone: false,
  templateUrl: './lawyer-fees-contracts-list.html',
  styleUrl: './lawyer-fees-contracts-list.scss',
})
export class LawyerFeesContractsList implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;

  constructor(private router: Router, private translate: TranslateService) {}

  endpoint = signal<string>('lawyer-fees-contracts');
  columns: { key: string; value: string }[] = [];
  searchFields = ['contractNumber', 'clientName', 'clientIdNumber'];

  dataMapper = (item: ILawyerFeesContract, index: number) => ({
    ...item,
    index: index + 1,
    contractNumberDisplay:
      item.contractNumber ?? (item.id ? item.id.slice(0, 4).toUpperCase() : ''),
    clientNameDisplay: item.clientName ?? item.customer?.fullName ?? '—',
    contractDateFormatted: item.contractDate
      ? new Date(item.contractDate).toLocaleDateString()
      : '—',
    totalFeesFormatted: item.totalFees != null ? `${item.totalFees} ${item.currency ?? 'SAR'}` : '—',
    statusLabel: item.secondPartySignedAt
      ? this.translate.instant('signed')
      : item.sentToClientAt
      ? this.translate.instant('sent')
      : this.translate.instant('draft'),
    createdAtFormatted: item.createdAt
      ? new Date(item.createdAt).toLocaleDateString()
      : '',
  });

  ngOnInit() {
    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('contract_number'), value: 'contractNumberDisplay' },
      { key: this.translate.instant('client_name'), value: 'clientNameDisplay' },
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
}
