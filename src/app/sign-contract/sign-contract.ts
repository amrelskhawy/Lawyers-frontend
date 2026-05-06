import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Data } from '../core/Servies/data';
import { LawyerFeesContractPreviewData } from '../shared/lawyer-fees-contract-preview/lawyer-fees-contract-preview';

type Phase = 'verify' | 'sign' | 'success' | 'error';

interface SigningPreview {
  id: string;
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
  currency:          string | null;

  firstPartySignature:  string | null;
  secondPartySignature: string | null;
  secondPartySignedAt:  string | null;

  existingPdfUrl: string | null;
  firmName:       string;
  expiresAt:      string | null;
}

@Component({
  selector: 'app-sign-contract',
  standalone: false,
  templateUrl: './sign-contract.html',
  styleUrl: './sign-contract.scss',
})
export class SignContract implements OnInit, OnDestroy {
  @ViewChild('pad') padRef!: ElementRef<HTMLCanvasElement>;

  constructor(
    private fb: FormBuilder,
    private data: Data,
    private route: ActivatedRoute,
    private translate: TranslateService,
  ) {}

  token = signal<string>('');
  phase = signal<Phase>('verify');
  loading = signal<boolean>(false);
  error = signal<string>('');
  preview = signal<SigningPreview | null>(null);
  signedPdfUrl = signal<string>('');

  // Live signature data URL — re-emitted on every stroke so the preview
  // can mirror it on page 3 in real time.
  liveSignature = signal<string>('');
  hasStrokes = signal<boolean>(false);

  verifyForm!: FormGroup;

  // The data fed into the embedded contract preview (pages 1-3).
  livePreview = computed<LawyerFeesContractPreviewData>(() => {
    const p = this.preview();
    if (!p) return {};
    return {
      contractNumber:    p.contractNumber,
      contractDay:       p.contractDay,
      contractDate:      p.contractDate,
      hijriDate:         p.hijriDate,
      clientName:        p.clientName,
      clientIdNumber:    p.clientIdNumber,
      clientPhone:       p.clientPhone,
      serviceDescription: p.serviceDescription,
      totalFees:         p.totalFees,
      firstInstallment:  p.firstInstallment,
      secondInstallment: p.secondInstallment,
      otherFees:         p.otherFees,
      currency:          p.currency,
      firstPartySignature:  p.firstPartySignature,
      secondPartySignature: this.liveSignature() || p.secondPartySignature,
      secondPartySignedAt:  this.liveSignature() ? new Date().toISOString() : p.secondPartySignedAt,
    };
  });

  private ctx: CanvasRenderingContext2D | null = null;
  private drawing = false;
  private last: { x: number; y: number } | null = null;

  ngOnInit() {
    // The public sign page is reached without going through the layouts that
    // normally call translate.use(...), so we have to load translations here.
    const saved = (typeof localStorage !== 'undefined' && localStorage.getItem('Language')) || 'ar';
    const lang = saved === 'ar' || saved === 'en' ? saved : 'ar';
    this.translate.setDefaultLang('ar');
    this.translate.use(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    this.token.set(this.route.snapshot.paramMap.get('token') ?? '');
    this.verifyForm = this.fb.group({
      idNumber: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  ngOnDestroy() {
    /* nothing to clean up */
  }

  verify() {
    if (this.verifyForm.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.data
      .post<{ data: SigningPreview }>(
        `public/sign-contract/${this.token()}/verify`,
        { idNumber: this.verifyForm.value.idNumber },
      )
      .subscribe({
        next: (res) => {
          this.preview.set(res.data);
          this.phase.set('sign');
          this.loading.set(false);
          // bind canvas after view updates
          setTimeout(() => this.bindPad(), 0);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'IDENTITY_MISMATCH');
          this.loading.set(false);
        },
      });
  }

  // ============ Signature pad ============
  private bindPad() {
    const canvas = this.padRef?.nativeElement;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0a1f44';
    ctx.lineWidth = 2.4;
    this.ctx = ctx;

    const getPos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    canvas.onpointerdown = (e: PointerEvent) => {
      this.drawing = true;
      this.last = getPos(e);
      canvas.setPointerCapture(e.pointerId);
    };
    canvas.onpointermove = (e: PointerEvent) => {
      if (!this.drawing || !this.ctx || !this.last) return;
      const p = getPos(e);
      this.ctx.beginPath();
      this.ctx.moveTo(this.last.x, this.last.y);
      this.ctx.lineTo(p.x, p.y);
      this.ctx.stroke();
      this.last = p;
      this.hasStrokes.set(true);
    };
    const stop = () => {
      if (this.drawing) {
        this.drawing = false;
        // Push to live preview when a stroke ends (cheaper than per-frame)
        this.refreshLiveSignature();
      }
      this.last = null;
    };
    canvas.onpointerup = stop;
    canvas.onpointercancel = stop;
    canvas.onpointerleave = stop;
  }

  private refreshLiveSignature() {
    const canvas = this.padRef?.nativeElement;
    if (!canvas) return;
    this.liveSignature.set(canvas.toDataURL('image/png'));
  }

  clearPad() {
    const canvas = this.padRef?.nativeElement;
    if (!canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.hasStrokes.set(false);
    this.liveSignature.set('');
  }

  submit() {
    if (!this.hasStrokes() || this.loading()) return;
    const canvas = this.padRef?.nativeElement;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    this.loading.set(true);
    this.error.set('');
    this.data
      .post<{ data: { id: string; reportUrl: string | null; secondPartySignedAt: string } }>(
        `public/sign-contract/${this.token()}/submit`,
        { idNumber: this.verifyForm.value.idNumber, signature: dataUrl },
      )
      .subscribe({
        next: (res) => {
          this.signedPdfUrl.set(res.data?.reportUrl ?? '');
          this.phase.set('success');
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'SIGNING_SUBMIT_FAILED');
          this.loading.set(false);
        },
      });
  }

  formatAmount(v: string | number | null | undefined): string {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    return isNaN(n) ? String(v) : n.toLocaleString();
  }
  formatDate(v: string | null | undefined): string {
    if (!v) return '';
    const d = new Date(v);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
  }
}
