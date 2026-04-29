import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { Data } from '../../core/Servies/data';
import { IDataCustomer } from '../../core/Models/customers.model';
import { IDataCase } from '../../core/Models/case.model';
import { ILawyerFeesContract } from '../../core/Models/lawyer-fees-contract.model';
import { LawyerFeesContractPreviewData } from '../../shared/lawyer-fees-contract-preview/lawyer-fees-contract-preview';

type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'app-lawyer-fees-contract',
  standalone: false,
  templateUrl: './lawyer-fees-contract.html',
  styleUrl: './lawyer-fees-contract.scss',
})
export class LawyerFeesContract implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private data: Data,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  caseId = signal<string>('');
  contractId = signal<string>('');
  loading = signal<boolean>(true);
  saveStatus = signal<SaveStatus>('idle');
  generating = signal<boolean>(false);
  loaded = signal<ILawyerFeesContract | null>(null);
  loadedCase = signal<IDataCase | null>(null);
  customers = signal<IDataCustomer[]>([]);

  Form!: FormGroup;
  formTick = signal<number>(0);
  private destroy$ = new Subject<void>();
  private skipNextDirty = false;

  ngOnInit() {
    const caseId = this.route.snapshot.paramMap.get('caseId') ?? '';
    const rawId  = this.route.snapshot.paramMap.get('id') ?? '';
    const id     = rawId === 'new' ? '' : rawId;
    this.caseId.set(caseId);
    this.buildForm();
    this.wireDirtyTracking();
    this.bootstrap(caseId, id);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm() {
    this.Form = this.fb.group({
      customerId:        [null],

      contractNumber:    [''],
      contractDay:       [''],
      contractDate:      [null],
      hijriDate:         [''],

      clientName:        [''],
      clientIdNumber:    [''],
      clientPhone:       [''],

      serviceDescription: [''],

      totalFees:         [null],
      firstInstallment:  [null],
      secondInstallment: [null],
      currency:          ['SAR'],
    });
  }

  private bootstrap(caseId: string, id: string) {
    this.loading.set(true);

    if (caseId) {
      // Case-bound mode: load case + customers, then find-or-create the draft contract for this case
      forkJoin({
        caseRes:   this.data.get<{ data: IDataCase }>(`cases/${caseId}`),
        customers: this.data.get<{ data: IDataCustomer[] }>('customers'),
      }).subscribe({
        next: ({ caseRes, customers }) => {
          this.loadedCase.set(caseRes.data);
          this.customers.set(customers.data ?? []);
          if (id) {
            this.loadExisting(id);
          } else {
            this.findOrCreateDraftForCase(caseId);
          }
        },
        error: () => this.loading.set(false),
      });
      return;
    }

    // Standalone mode (from list page)
    forkJoin({
      customers: this.data.get<{ data: IDataCustomer[] }>('customers'),
    }).subscribe({
      next: ({ customers }) => {
        this.customers.set(customers.data ?? []);
        if (id) {
          this.loadExisting(id);
        } else {
          this.createDraft({});
        }
      },
      error: () => this.loading.set(false),
    });
  }

  private findOrCreateDraftForCase(caseId: string) {
    this.data
      .get<{ data: ILawyerFeesContract[] }>(`lawyer-fees-contracts/by-case/${caseId}`)
      .subscribe({
        next: (res) => {
          const existing = (res.data ?? [])[0];
          if (existing) {
            this.patchContract(existing);
            this.router.navigate(
              ['/dashboard/content/lawyer-fees-contract/case', caseId, existing.id],
              { replaceUrl: true },
            );
          } else {
            const c = this.loadedCase();
            this.createDraft({
              caseId,
              customerId: c?.customerId ?? null,
              prefill: {
                clientName:  c?.customer?.fullName ?? '',
                clientPhone: c?.customer?.phone ?? '',
              },
            });
          }
        },
        error: () => this.createDraft({ caseId }),
      });
  }

  private patchContract(c: ILawyerFeesContract) {
    this.loaded.set(c);
    this.contractId.set(c.id);
    this.skipNextDirty = true;
    this.Form.patchValue({
      customerId:        c.customerId,
      contractNumber:    c.contractNumber ?? '',
      contractDay:       c.contractDay ?? '',
      contractDate:      c.contractDate ? new Date(c.contractDate) : null,
      hijriDate:         c.hijriDate ?? '',
      clientName:        c.clientName ?? c.customer?.fullName ?? this.loadedCase()?.customer?.fullName ?? '',
      clientIdNumber:    c.clientIdNumber ?? '',
      clientPhone:       c.clientPhone ?? c.customer?.phone ?? this.loadedCase()?.customer?.phone ?? '',
      serviceDescription: c.serviceDescription ?? '',
      totalFees:         c.totalFees ?? null,
      firstInstallment:  c.firstInstallment ?? null,
      secondInstallment: c.secondInstallment ?? null,
      currency:          c.currency ?? 'SAR',
    }, { emitEvent: true });
    this.loading.set(false);
    this.saveStatus.set('saved');
  }

  private createDraft(opts: {
    caseId?: string;
    customerId?: string | null;
    prefill?: { clientName?: string; clientPhone?: string };
  }) {
    const body: any = {};
    if (opts.caseId) body.caseId = opts.caseId;
    if (opts.customerId) body.customerId = opts.customerId;

    this.data
      .post<{ data: ILawyerFeesContract }>('lawyer-fees-contracts', body)
      .subscribe({
        next: (res) => {
          const contract = res.data;
          this.loaded.set(contract);
          this.contractId.set(contract.id);

          if (opts.prefill) {
            this.skipNextDirty = true;
            this.Form.patchValue({
              clientName:  opts.prefill.clientName ?? '',
              clientPhone: opts.prefill.clientPhone ?? '',
              customerId:  opts.customerId ?? null,
            });
          }

          this.loading.set(false);
          this.saveStatus.set('idle');

          const target = opts.caseId
            ? ['/dashboard/content/lawyer-fees-contract/case', opts.caseId, contract.id]
            : ['/dashboard/content/lawyer-fees-contract', contract.id];
          this.router.navigate(target, { replaceUrl: true });
        },
        error: () => this.loading.set(false),
      });
  }

  private loadExisting(id: string) {
    this.data
      .get<{ data: ILawyerFeesContract }>(`lawyer-fees-contracts/${id}`)
      .subscribe({
        next: (res) => this.patchContract(res.data),
        error: () => this.loading.set(false),
      });
  }

  private wireDirtyTracking() {
    this.Form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.formTick.update((n) => n + 1);
      if (this.skipNextDirty) { this.skipNextDirty = false; return; }
      if (this.loading()) return;
      this.saveStatus.set('unsaved');
    });
  }

  onCustomerChange(customerId: string | null) {
    if (!customerId) return;
    const c = this.customers().find((x) => x.id === customerId);
    if (!c) return;
    this.Form.patchValue({
      clientName:  c.fullName ?? '',
      clientPhone: c.phone ?? '',
    });
  }

  previewData = computed<LawyerFeesContractPreviewData>(() => {
    void this.formTick();
    const v = this.Form?.value ?? {};
    return {
      contractNumber:    v.contractNumber,
      contractDay:       v.contractDay,
      contractDate:      v.contractDate,
      hijriDate:         v.hijriDate,
      clientName:        v.clientName,
      clientIdNumber:    v.clientIdNumber,
      clientPhone:       v.clientPhone,
      serviceDescription: v.serviceDescription,
      totalFees:         v.totalFees,
      firstInstallment:  v.firstInstallment,
      secondInstallment: v.secondInstallment,
      currency:          v.currency,
    };
  });

  save() {
    if (!this.contractId() || this.saveStatus() === 'saving') return;
    this.saveStatus.set('saving');
    this.data
      .patch<{ data: ILawyerFeesContract }>(
        `lawyer-fees-contracts/${this.contractId()}`,
        this.toPayload(this.Form.getRawValue()),
      )
      .subscribe({
        next: (res) => { this.loaded.set(res.data); this.saveStatus.set('saved'); },
        error: () => this.saveStatus.set('error'),
      });
  }

  private toIsoOrNull(v: any): string | null {
    if (!v) return null;
    const d = v instanceof Date ? v : new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  private numOrNull(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
  }

  private toPayload(v: any) {
    return {
      customerId:        v.customerId || null,

      contractNumber:    v.contractNumber || null,
      contractDay:       v.contractDay || null,
      contractDate:      this.toIsoOrNull(v.contractDate),
      hijriDate:         v.hijriDate || null,

      clientName:        v.clientName || null,
      clientIdNumber:    v.clientIdNumber || null,
      clientPhone:       v.clientPhone || null,

      serviceDescription: v.serviceDescription || null,

      totalFees:         this.numOrNull(v.totalFees),
      firstInstallment:  this.numOrNull(v.firstInstallment),
      secondInstallment: this.numOrNull(v.secondInstallment),
      currency:          v.currency || null,
    };
  }

  signingUrl = signal<string>('');
  signingExpiresAt = signal<string>('');
  generatingLink = signal<boolean>(false);

  generateSigningLink() {
    if (!this.contractId() || this.generatingLink()) return;
    if (this.saveStatus() === 'unsaved') return;
    this.generatingLink.set(true);
    this.data
      .post<{ data: { url: string; token: string; expiresAt: string } }>(
        `lawyer-fees-contracts/${this.contractId()}/signing-link`,
        {},
      )
      .subscribe({
        next: (res) => {
          this.signingUrl.set(res.data.url);
          this.signingExpiresAt.set(res.data.expiresAt);
          this.generatingLink.set(false);
        },
        error: () => this.generatingLink.set(false),
      });
  }

  copySigningLink() {
    const url = this.signingUrl();
    if (!url) return;
    navigator.clipboard?.writeText(url);
  }

  sendingWhatsapp = signal<boolean>(false);
  whatsappSentAt = signal<string>('');

  sendSigningLinkWhatsapp() {
    if (!this.contractId() || this.sendingWhatsapp()) return;
    this.sendingWhatsapp.set(true);
    this.data
      .post<{ data: { url: string; expiresAt: string; sentTo: string } }>(
        `lawyer-fees-contracts/${this.contractId()}/signing-link/send-whatsapp`,
        {},
      )
      .subscribe({
        next: (res) => {
          // The endpoint may have refreshed an expired token, so sync the URL
          this.signingUrl.set(res.data.url);
          this.signingExpiresAt.set(res.data.expiresAt);
          this.whatsappSentAt.set(new Date().toISOString());
          this.sendingWhatsapp.set(false);
        },
        error: () => this.sendingWhatsapp.set(false),
      });
  }

  generatePdf() {
    if (!this.contractId()) return;
    this.generating.set(true);
    this.data
      .post<{ data: ILawyerFeesContract }>(
        `lawyer-fees-contracts/${this.contractId()}/generate-pdf`,
        {},
      )
      .subscribe({
        next: (res) => {
          this.loaded.set(res.data);
          this.generating.set(false);
          if (res.data.reportUrl) window.open(res.data.reportUrl, '_blank');
        },
        error: () => this.generating.set(false),
      });
  }

  back() {
    const caseId = this.caseId();
    if (caseId) {
      this.router.navigate(['/dashboard/content/client-cases']);
    } else {
      this.router.navigate(['/dashboard/content/lawyer-fees-contracts']);
    }
  }
}
