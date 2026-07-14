import { Component, OnDestroy, signal } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, degrees } from 'pdf-lib';

// Run pdf.js in a real worker. The worker file is copied verbatim into
// `assets/` by an angular.json asset rule (see the "pdfjs-dist" glob).
//
// pdf.js v6 spawns the worker as an ES module (`new Worker(url, { type: 'module' })`)
// and browsers enforce strict MIME checking on module scripts. Our production
// host (Nginx) serves `.mjs` as `application/octet-stream` with
// `X-Content-Type-Options: nosniff`, so pointing pdf.js straight at the served
// path makes the browser refuse the worker and every PDF load fails with
// "document_load_failed". Dev servers serve `.mjs` as JS, which is why this only
// broke in production.
//
// Fix: fetch the worker ourselves (fetch ignores Content-Type) and hand pdf.js a
// same-origin Blob URL tagged `text/javascript`. The Blob's own type is
// authoritative, so worker loading no longer depends on the server's `.mjs` MIME
// mapping. Done once, lazily, and cached.
let pdfWorkerReady: Promise<void> | null = null;
function ensurePdfWorker(): Promise<void> {
  if (!pdfWorkerReady) {
    pdfWorkerReady = (async () => {
      const url = new URL('assets/pdf.worker.min.mjs', document.baseURI).href;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`pdf worker fetch failed: ${res.status}`);
      const code = await res.text();
      const blob = new Blob([code], { type: 'text/javascript' });
      pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
    })().catch((err) => {
      // Reset so a transient failure can be retried on the next document load.
      pdfWorkerReady = null;
      throw err;
    });
  }
  return pdfWorkerReady;
}

/** A page rendered for on-screen display. */
interface RenderedPage {
  /** PNG data URL of the rasterised page (or the raw image for image docs). */
  src: string;
  /** Intrinsic pixel dimensions of `src` — used only to keep the wrapper aspect ratio. */
  width: number;
  height: number;
}

/** A signature placed on the document. Position/size are stored as fractions
 *  (0–1) of the page box so they survive responsive resizing and map cleanly
 *  to PDF points on export. */
interface PlacedSignature {
  id: number;
  pageIndex: number;
  src: string;
  /** Top-left corner as a fraction of page width/height. */
  xFrac: number;
  yFrac: number;
  /** Width as a fraction of page width; height derived from `aspect`. */
  wFrac: number;
  /** natural height / natural width of the signature image. */
  aspect: number;
}

type DocType = 'pdf' | 'image';

@Component({
  selector: 'app-document-signer',
  standalone: false,
  templateUrl: './document-signer.html',
  styleUrl: './document-signer.scss',
})
export class DocumentSigner implements OnDestroy {
  // ── Document state ─────────────────────────────────────────────────────
  docType = signal<DocType | null>(null);
  fileName = signal<string>('');
  pages = signal<RenderedPage[]>([]);
  loading = signal<boolean>(false);
  errorMsg = signal<string>('');
  exporting = signal<boolean>(false);

  /** Pristine PDF bytes, kept for vector stamping on export (pdf.js detaches
   *  its own copy, so this is a separate slice). */
  private pdfBytes: Uint8Array | null = null;

  // ── Signature state ────────────────────────────────────────────────────
  /** Currently-uploaded signature PNG, ready to drop onto a page. */
  activeSignature = signal<string>('');
  private activeAspect = 1;
  placed = signal<PlacedSignature[]>([]);
  selectedId = signal<number | null>(null);
  private nextId = 1;

  // Scale pdf.js renders at for on-screen display.
  private readonly DISPLAY_SCALE = 1.5;
  // Higher DPI raster used only for rotated pages on export (see exportPdf).
  private readonly ROTATED_EXPORT_SCALE = 2.5;

  private dragCleanup: (() => void) | null = null;

  ngOnDestroy(): void {
    this.dragCleanup?.();
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  Document loading
  // ─────────────────────────────────────────────────────────────────────────

  async onDocumentSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // allow re-selecting the same file
    if (!file) return;

    this.reset();
    this.fileName.set(file.name);
    this.loading.set(true);
    this.errorMsg.set('');

    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        await this.loadPdf(file);
      } else if (file.type.startsWith('image/')) {
        await this.loadImage(file);
      } else {
        this.errorMsg.set('unsupported_file_type');
      }
    } catch (err) {
      console.error('[document-signer] failed to load document', err);
      this.errorMsg.set('document_load_failed');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadPdf(file: File): Promise<void> {
    await ensurePdfWorker();
    const buffer = await file.arrayBuffer();
    this.pdfBytes = new Uint8Array(buffer.slice(0)); // keep a copy for pdf-lib

    const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise;
    const rendered: RenderedPage[] = [];

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: this.DISPLAY_SCALE });
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d')!;
      await page.render({ canvas, canvasContext: ctx, viewport } as any).promise;
      rendered.push({ src: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height });
    }

    this.docType.set('pdf');
    this.pages.set(rendered);
  }

  private async loadImage(file: File): Promise<void> {
    const src = await this.readAsDataUrl(file);
    const img = await this.loadHtmlImage(src);
    this.docType.set('image');
    this.pages.set([{ src, width: img.naturalWidth, height: img.naturalHeight }]);
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  Signature upload + placement
  // ─────────────────────────────────────────────────────────────────────────

  async onSignatureSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.errorMsg.set('signature_must_be_image');
      return;
    }
    const src = await this.readAsDataUrl(file);
    const img = await this.loadHtmlImage(src);
    this.activeAspect = img.naturalHeight / img.naturalWidth || 1;
    this.activeSignature.set(src);
  }

  /** Drop the active signature onto a page, centred. */
  addSignatureToPage(pageIndex: number): void {
    if (!this.activeSignature()) return;
    const wFrac = 0.25;
    const sig: PlacedSignature = {
      id: this.nextId++,
      pageIndex,
      src: this.activeSignature(),
      wFrac,
      // Height fraction depends on page aspect; centre it roughly.
      xFrac: 0.5 - wFrac / 2,
      yFrac: 0.4,
      aspect: this.activeAspect,
    };
    this.placed.update((list) => [...list, sig]);
    this.selectedId.set(sig.id);
  }

  /** Copy a placed signature onto every other page at the same relative spot
   *  (fractions), so a signature/initial can be applied across a whole document
   *  in one click. Skips pages that already hold an identical placement so
   *  repeated clicks don't stack duplicates. */
  applyToAllPages(sig: PlacedSignature): void {
    const total = this.pages().length;
    if (total < 2) return;
    const eps = 0.001;
    const additions: PlacedSignature[] = [];

    for (let page = 0; page < total; page++) {
      if (page === sig.pageIndex) continue;
      const alreadyThere = this.placed().some(
        (s) =>
          s.pageIndex === page &&
          s.src === sig.src &&
          Math.abs(s.xFrac - sig.xFrac) < eps &&
          Math.abs(s.yFrac - sig.yFrac) < eps &&
          Math.abs(s.wFrac - sig.wFrac) < eps,
      );
      if (alreadyThere) continue;
      additions.push({ ...sig, id: this.nextId++, pageIndex: page });
    }

    if (additions.length) {
      this.placed.update((list) => [...list, ...additions]);
    }
  }

  removeSignature(id: number): void {
    this.placed.update((list) => list.filter((s) => s.id !== id));
    if (this.selectedId() === id) this.selectedId.set(null);
  }

  select(id: number): void {
    this.selectedId.set(id);
  }

  /** height fraction of a signature relative to page height, from wFrac + aspect. */
  heightFrac(sig: PlacedSignature, page: RenderedPage): number {
    return (sig.wFrac * page.width * sig.aspect) / page.height;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  Drag + resize (pointer based, zoneless-safe via signal writes)
  // ─────────────────────────────────────────────────────────────────────────

  startDrag(event: PointerEvent, sig: PlacedSignature, wrapper: HTMLElement): void {
    event.preventDefault();
    event.stopPropagation();
    this.selectedId.set(sig.id);

    const rect = wrapper.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startXFrac = sig.xFrac;
    const startYFrac = sig.yFrac;

    const move = (e: PointerEvent) => {
      const dxFrac = (e.clientX - startX) / rect.width;
      const dyFrac = (e.clientY - startY) / rect.height;
      this.updateSig(sig.id, (s) => ({
        ...s,
        xFrac: this.clamp(startXFrac + dxFrac, 0, 1 - s.wFrac),
        yFrac: this.clamp(startYFrac + dyFrac, 0, 1),
      }));
    };
    this.attachPointer(move);
  }

  startResize(
    event: PointerEvent,
    sig: PlacedSignature,
    wrapper: HTMLElement,
    page: RenderedPage,
  ): void {
    event.preventDefault();
    event.stopPropagation();
    this.selectedId.set(sig.id);

    const rect = wrapper.getBoundingClientRect();
    const startX = event.clientX;
    const startWFrac = sig.wFrac;

    const move = (e: PointerEvent) => {
      const dwFrac = (e.clientX - startX) / rect.width;
      this.updateSig(sig.id, (s) => ({
        ...s,
        wFrac: this.clamp(startWFrac + dwFrac, 0.05, 1 - s.xFrac),
      }));
    };
    this.attachPointer(move);
  }

  private attachPointer(move: (e: PointerEvent) => void): void {
    this.dragCleanup?.();
    const up = () => this.dragCleanup?.();
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    this.dragCleanup = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      this.dragCleanup = null;
    };
  }

  private updateSig(id: number, fn: (s: PlacedSignature) => PlacedSignature): void {
    this.placed.update((list) => list.map((s) => (s.id === id ? fn(s) : s)));
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  Export
  // ─────────────────────────────────────────────────────────────────────────

  async download(): Promise<void> {
    if (!this.pages().length || this.exporting()) return;
    this.exporting.set(true);
    this.errorMsg.set('');
    try {
      if (this.docType() === 'pdf') {
        await this.exportPdf();
      } else {
        await this.exportImage();
      }
    } catch (err) {
      console.error('[document-signer] export failed', err);
      this.errorMsg.set('export_failed');
    } finally {
      this.exporting.set(false);
    }
  }

  private async exportPdf(): Promise<void> {
    const pdfDoc = await PDFDocument.load(this.pdfBytes!);
    const pdfPages = pdfDoc.getPages();

    // Cache embedded signature images by data URL.
    const embedCache = new Map<string, any>();
    const embed = async (src: string) => {
      if (!embedCache.has(src)) {
        embedCache.set(src, await pdfDoc.embedPng(src));
      }
      return embedCache.get(src);
    };

    // Group placements by page.
    const byPage = new Map<number, PlacedSignature[]>();
    for (const s of this.placed()) {
      const bucket = byPage.get(s.pageIndex);
      if (bucket) bucket.push(s);
      else byPage.set(s.pageIndex, [s]);
    }

    for (const [pageIndex, sigs] of byPage) {
      const page = pdfPages[pageIndex];
      if (!page) continue;
      const rotation = ((page.getRotation().angle % 360) + 360) % 360;

      if (rotation === 0) {
        // Fidelity path: stamp vector image directly onto the untouched page.
        const { width: W, height: H } = page.getSize();
        for (const s of sigs) {
          const png = await embed(s.src);
          const w = s.wFrac * W;
          const h = w * s.aspect;
          const x = s.xFrac * W;
          const y = H - s.yFrac * H - h; // PDF origin is bottom-left
          page.drawImage(png, { x, y, width: w, height: h });
        }
      } else {
        // Rotated page: rasterise it upright, flatten to a rotation-0 page,
        // then stamp on top. Only rotated pages lose vector text.
        await this.flattenRotatedPage(pdfDoc, page, pageIndex, sigs, embed);
      }
    }

    const bytes = await pdfDoc.save();
    this.triggerDownload(new Blob([bytes as BlobPart], { type: 'application/pdf' }), '.pdf');
  }

  /** Re-render a rotated page via pdf.js (rotation baked in), replace its
   *  content with that upright raster, and stamp signatures at rotation 0. */
  private async flattenRotatedPage(
    pdfDoc: PDFDocument,
    page: any,
    pageIndex: number,
    sigs: PlacedSignature[],
    embed: (src: string) => Promise<any>,
  ): Promise<void> {
    await ensurePdfWorker();
    const doc = await pdfjsLib.getDocument({ data: new Uint8Array(this.pdfBytes!.slice(0)) })
      .promise;
    const jsPage = await doc.getPage(pageIndex + 1);
    const viewport = jsPage.getViewport({ scale: this.ROTATED_EXPORT_SCALE });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d')!;
    await jsPage.render({ canvas, canvasContext: ctx, viewport } as any).promise;

    const visW = viewport.width / this.ROTATED_EXPORT_SCALE;
    const visH = viewport.height / this.ROTATED_EXPORT_SCALE;

    page.setRotation(degrees(0));
    page.setSize(visW, visH);

    const pageRaster = await pdfDoc.embedPng(canvas.toDataURL('image/png'));
    page.drawImage(pageRaster, { x: 0, y: 0, width: visW, height: visH });

    for (const s of sigs) {
      const png = await embed(s.src);
      const w = s.wFrac * visW;
      const h = w * s.aspect;
      const x = s.xFrac * visW;
      const y = visH - s.yFrac * visH - h;
      page.drawImage(png, { x, y, width: w, height: h });
    }
  }

  private async exportImage(): Promise<void> {
    const page = this.pages()[0];
    const base = await this.loadHtmlImage(page.src);
    const canvas = document.createElement('canvas');
    canvas.width = base.naturalWidth;
    canvas.height = base.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

    for (const s of this.placed().filter((p) => p.pageIndex === 0)) {
      const sig = await this.loadHtmlImage(s.src);
      const w = s.wFrac * canvas.width;
      const h = w * s.aspect;
      const x = s.xFrac * canvas.width;
      const y = s.yFrac * canvas.height;
      ctx.drawImage(sig, x, y, w, h);
    }

    await new Promise<void>((resolve) =>
      canvas.toBlob((blob) => {
        if (blob) this.triggerDownload(blob, '.png');
        resolve();
      }, 'image/png'),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  Helpers
  // ─────────────────────────────────────────────────────────────────────────

  private triggerDownload(blob: Blob, ext: string): void {
    const base = this.fileName().replace(/\.[^.]+$/, '') || 'document';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${base}-signed${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private loadHtmlImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private clamp(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v));
  }

  private reset(): void {
    this.pdfBytes = null;
    this.docType.set(null);
    this.pages.set([]);
    this.placed.set([]);
    this.selectedId.set(null);
    this.errorMsg.set('');
  }
}
