import { Component, EventEmitter, Input, OnChanges, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Data } from '../../core/Servies/data';
import {
  ICasePaymentContract,
  IContractPaymentsSummary,
} from '../../core/Models/financials.model';

/**
 * Records collections against a lawyer fees contract and shows what is still
 * owed. Opened from three places — the cases list, the financials page and the
 * contract screen — so it accepts either a `contractId` (opens straight into the
 * payments) or a `caseId` (resolves the case's contracts, offering a pick when
 * there is more than one).
 */
@Component({
  selector: 'app-contract-payments-dialog',
  standalone: false,
  templateUrl: './contract-payments-dialog.html',
  styleUrl: './contract-payments-dialog.scss',
})
export class ContractPaymentsDialog implements OnChanges {
  constructor(private fb: FormBuilder, private data: Data) {
    this.form = this.fb.group({
      amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
      paidAt: [new Date(), Validators.required],
      note: [''],
    });
  }

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  /** Fires after any change that moves money, so parents can refresh their totals. */
  @Output() paymentsChanged = new EventEmitter<void>();

  /** Open directly on one contract. Takes precedence over `caseId`. */
  @Input() contractId: string | null = null;
  /** Open on a case — its contracts are resolved, and picked between if several. */
  @Input() caseId: string | null = null;
  @Input() currency = 'SAR';

  isVisible = signal(false);
  loading = signal(false);
  saving = signal(false);
  /** Translation key of the last server-side failure, shown inline. */
  error = signal<string>('');

  /** Contract choices when opened by case and the case has more than one. */
  choices = signal<ICasePaymentContract[]>([]);
  activeContractId = signal<string | null>(null);
  summary = signal<IContractPaymentsSummary | null>(null);

  form: FormGroup;

  get isAdmin(): boolean {
    const raw = sessionStorage.getItem('user');
    return (raw ? JSON.parse(raw)?.role : '') === 'ADMIN';
  }

  /** What would still be owed if the typed amount were saved — live preview. */
  remainingAfterInput(): number {
    const s = this.summary();
    if (!s) return 0;
    const typed = Number(this.form.get('amount')?.value) || 0;
    return Math.round((s.remaining - typed) * 100) / 100;
  }

  /**
   * Loading is driven from `ngOnChanges` rather than a `visible` setter: the
   * setter would fire before `caseId` / `contractId` are bound, and open on a
   * stale target.
   */
  ngOnChanges() {
    if (this.visible === this.isVisible()) return;
    this.isVisible.set(this.visible);
    if (this.visible) this.open();
    else this.reset();
  }

  private open() {
    this.error.set('');
    if (this.contractId) {
      this.choices.set([]);
      this.loadContract(this.contractId);
      return;
    }
    if (this.caseId) this.loadCaseContracts(this.caseId);
  }

  /**
   * A case with a single contract skips the picker entirely — the common path
   * from the cases list is one click to the payment form.
   */
  private loadCaseContracts(caseId: string) {
    this.loading.set(true);
    this.data
      .get<{ data: ICasePaymentContract[] }>(`lawyer-fees-contracts/by-case/${caseId}/payments`)
      .subscribe({
        next: (res) => {
          const list = res.data ?? [];
          this.choices.set(list);
          this.loading.set(false);
          if (list.length === 1) this.loadContract(list[0].id);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('contract_payments_load_failed');
        },
      });
  }

  loadContract(contractId: string) {
    this.activeContractId.set(contractId);
    this.loading.set(true);
    this.error.set('');
    this.data
      .get<{ data: IContractPaymentsSummary }>(`lawyer-fees-contracts/${contractId}/payments`)
      .subscribe({
        next: (res) => {
          this.summary.set(res.data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('contract_payments_load_failed');
        },
      });
  }

  /** Back to the picker without closing, when a case has several contracts. */
  backToChoices() {
    this.summary.set(null);
    this.activeContractId.set(null);
    this.form.reset({ amount: null, paidAt: new Date(), note: '' });
  }

  submit() {
    const contractId = this.activeContractId();
    if (!contractId || this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const paidAt = v.paidAt instanceof Date ? v.paidAt : new Date(v.paidAt);

    this.saving.set(true);
    this.error.set('');
    this.data
      .post<{ data: IContractPaymentsSummary }>(
        `lawyer-fees-contracts/${contractId}/payments`,
        { amount: Number(v.amount), paidAt: paidAt.toISOString(), note: v.note || null },
      )
      .subscribe({
        next: (res) => {
          this.summary.set(res.data);
          this.saving.set(false);
          this.form.reset({ amount: null, paidAt: new Date(), note: '' });
          this.paymentsChanged.emit();
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(this.messageKey(err));
        },
      });
  }

  deletePayment(paymentId: string) {
    const contractId = this.activeContractId();
    if (!contractId || !this.isAdmin || this.saving()) return;

    this.saving.set(true);
    this.data
      .delete<{ data: IContractPaymentsSummary }>(
        `lawyer-fees-contracts/${contractId}/payments/${paymentId}`,
      )
      .subscribe({
        next: (res) => {
          this.summary.set(res.data);
          this.saving.set(false);
          this.paymentsChanged.emit();
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(this.messageKey(err));
        },
      });
  }

  /** Server error codes double as translation keys; fall back to a generic one. */
  private messageKey(err: unknown): string {
    const code = (err as { error?: { message?: string } })?.error?.message;
    return code === 'PAYMENT_EXCEEDS_CONTRACT_TOTAL' || code === 'CONTRACT_TOTAL_FEES_NOT_SET'
      ? code.toLowerCase()
      : 'contract_payment_save_failed';
  }

  private reset() {
    this.summary.set(null);
    this.choices.set([]);
    this.activeContractId.set(null);
    this.error.set('');
    this.form.reset({ amount: null, paidAt: new Date(), note: '' });
  }

  close() {
    this.isVisible.set(false);
    this.visibleChange.emit(false);
    this.reset();
  }
}
