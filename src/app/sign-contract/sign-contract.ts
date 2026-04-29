import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Data } from '../core/Servies/data';

type Phase = 'verify' | 'sign' | 'success' | 'error';

interface SigningPreview {
  id: string;
  contractNumber: string | null;
  contractDate: string | null;
  hijriDate: string | null;
  clientName: string | null;
  serviceDescription: string | null;
  totalFees: string | number | null;
  firstInstallment: string | number | null;
  secondInstallment: string | number | null;
  currency: string | null;
  firmName: string;
  expiresAt: string | null;
}

@Component({
  selector: 'app-sign-contract',
  standalone: false,
  templateUrl: './sign-contract.html',
  styleUrl: './sign-contract.scss',
})
export class SignContract implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('pad') padRef!: ElementRef<HTMLCanvasElement>;

  constructor(
    private fb: FormBuilder,
    private data: Data,
    private route: ActivatedRoute,
  ) {}

  token = signal<string>('');
  phase = signal<Phase>('verify');
  loading = signal<boolean>(false);
  error = signal<string>('');
  preview = signal<SigningPreview | null>(null);
  signedPdfUrl = signal<string>('');

  verifyForm!: FormGroup;
  hasStrokes = signal<boolean>(false);

  private ctx: CanvasRenderingContext2D | null = null;
  private drawing = false;
  private last: { x: number; y: number } | null = null;

  ngOnInit() {
    this.token.set(this.route.snapshot.paramMap.get('token') ?? '');
    this.verifyForm = this.fb.group({
      idNumber: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  ngAfterViewInit() {
    // Canvas is only mounted in the 'sign' phase; bind on demand instead
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
      this.drawing = false;
      this.last = null;
    };
    canvas.onpointerup = stop;
    canvas.onpointercancel = stop;
    canvas.onpointerleave = stop;
  }

  clearPad() {
    const canvas = this.padRef?.nativeElement;
    if (!canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.hasStrokes.set(false);
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
