import { Component, EventEmitter, Input, OnInit, Output, signal, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { Data } from '../../../core/Servies/data';
import { ArticleStatus, IArticle, IArticlePayload } from '../../../core/Models/article.model';

/** 5 MB — matches the limit multer enforces on the upload endpoint. */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/**
 * Where Google starts truncating. The fields are not capped at these lengths —
 * the counters in the form just turn amber past them, so a writer can see they
 * are about to lose the tail of their own headline in the search result.
 */
export const SEO_TITLE_LIMIT = 60;
export const SEO_DESCRIPTION_LIMIT = 160;

/**
 * Create/edit dialog for an article. The body is written in the rich-text
 * editor: fonts, sizes, colours, alignment and inline images. Pictures are
 * uploaded to Drive as they are inserted, so the stored HTML only ever carries
 * URLs — never megabytes of base64.
 */
@Component({
  selector: 'app-form-article',
  standalone: false,
  templateUrl: './form-article.html',
  styleUrl: './form-article.scss',
})
export class FormArticle implements OnInit {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() success = new EventEmitter<boolean>();

  @Input() set objdata(value: IArticle | null) {
    this.editing.set(value ?? null);
    if (this.Form().controls['title']) this.patchForm(value);
  }

  /** Hidden picker used by the editor's image button. */
  @ViewChild('bodyImageInput') bodyImageInput!: ElementRef<HTMLInputElement>;

  Form = signal<FormGroup>(new FormGroup({}));
  editing = signal<IArticle | null>(null);
  uploadingCover = signal<boolean>(false);
  uploadingBodyImage = signal<boolean>(false);
  imageError = signal<string>('');
  saving = signal<boolean>(false);

  /** The Quill instance behind the editor, once it has initialised. */
  private quill: any = null;

  constructor(
    private FB: FormBuilder,
    private Data: Data,
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.patchForm(this.editing());
  }

  createForm() {
    this.Form.set(
      this.FB.group({
        title: ['', [Validators.required, Validators.maxLength(200)]],
        slug: [''],
        excerpt: ['', [Validators.maxLength(500)]],
        coverImage: [''],
        content: ['', Validators.required],
        status: ['DRAFT' as ArticleStatus],

        // SEO overrides. All optional — left empty, the server falls back to
        // the title and the excerpt, so an article is never published without
        // a usable search-result snippet.
        metaTitle: ['', [Validators.maxLength(70)]],
        metaDescription: ['', [Validators.maxLength(200)]],
        keywords: [''],
        noIndex: [false],
      }),
    );
  }

  private patchForm(article: IArticle | null) {
    if (!article) {
      this.resetForm();
      return;
    }
    this.Form().patchValue({
      title: article.title ?? '',
      slug: article.slug ?? '',
      excerpt: article.excerpt ?? '',
      coverImage: article.coverImage ?? '',
      content: article.content ?? '',
      status: article.status ?? 'DRAFT',
      metaTitle: article.metaTitle ?? '',
      metaDescription: article.metaDescription ?? '',
      keywords: (article.keywords ?? []).join(', '),
      noIndex: article.noIndex ?? false,
    });
    this.imageError.set('');
  }

  private resetForm() {
    this.Form().reset({
      status: 'DRAFT',
      slug: '',
      coverImage: '',
      content: '',
      excerpt: '',
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      noIndex: false,
    });
    this.imageError.set('');
  }

  // ── Editor ─────────────────────────────────────────────────────────────

  /**
   * Take over the toolbar's image button: Quill's own handler embeds the file
   * as base64 straight into the HTML, which would bloat every read of the
   * article. Ours uploads first and inserts the returned URL.
   */
  onEditorInit(event: any) {
    this.quill = event?.editor ?? null;
    this.quill?.getModule('toolbar')?.addHandler('image', () => {
      this.bodyImageInput?.nativeElement.click();
    });
  }

  onBodyImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!this.isValidImage(file)) {
      input.value = '';
      return;
    }

    // The selection is lost while the file dialog is open, so remember where
    // the caret was and insert there once the upload comes back.
    const index = this.quill?.getSelection(true)?.index ?? this.quill?.getLength() ?? 0;

    this.uploadingBodyImage.set(true);
    this.upload(file).subscribe({
      next: (url) => {
        this.uploadingBodyImage.set(false);
        // Inserting as a "user" edit is what makes the editor propagate the
        // new HTML to the form control — a silent insert would never be saved.
        this.quill?.insertEmbed(index, 'image', url, 'user');
        this.quill?.setSelection(index + 1, 0);
        input.value = '';
      },
      error: (err) => {
        this.uploadingBodyImage.set(false);
        this.imageError.set(err?.error?.message ?? 'تعذّر رفع الصورة، حاول مرة أخرى');
        input.value = '';
      },
    });
  }

  // ── Cover image ────────────────────────────────────────────────────────

  onCoverSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!this.isValidImage(file)) {
      input.value = '';
      return;
    }

    this.uploadingCover.set(true);
    this.upload(file).subscribe({
      next: (url) => {
        this.uploadingCover.set(false);
        this.Form().get('coverImage')?.setValue(url);
        input.value = '';
      },
      error: (err) => {
        this.uploadingCover.set(false);
        this.imageError.set(err?.error?.message ?? 'تعذّر رفع الصورة، حاول مرة أخرى');
        input.value = '';
      },
    });
  }

  removeCover() {
    this.Form().get('coverImage')?.setValue('');
    this.imageError.set('');
  }

  private isValidImage(file: File): boolean {
    this.imageError.set('');
    if (!file.type.startsWith('image/')) {
      this.imageError.set('يُسمح بملفات الصور فقط');
      return false;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      this.imageError.set('حجم الصورة يتجاوز 5 ميجابايت');
      return false;
    }
    return true;
  }

  /** Upload one image and hand back the public URL the server stored it under. */
  private upload(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.Data
      .post<{ data: { url: string } }>('articles/upload-image', formData)
      .pipe(map((res) => res?.data?.url ?? ''));
  }

  // ── Save ───────────────────────────────────────────────────────────────

  /** Save as-is (keeps the current status). */
  onSubmit() {
    this.save(this.Form().value.status ?? 'DRAFT');
  }

  /** Save and make it live in one step. */
  onPublish() {
    this.save('PUBLISHED');
  }

  private save(status: ArticleStatus) {
    if (this.Form().invalid) {
      this.Form().markAllAsTouched();
      return;
    }

    const raw = this.Form().value;
    const body: IArticlePayload = {
      title: raw.title.trim(),
      content: raw.content,
      excerpt: raw.excerpt?.trim() ? raw.excerpt.trim() : null,
      coverImage: raw.coverImage?.trim() ? raw.coverImage.trim() : null,
      status,
      metaTitle: raw.metaTitle?.trim() || null,
      metaDescription: raw.metaDescription?.trim() || null,
      keywords: this.parseKeywords(raw.keywords),
      noIndex: !!raw.noIndex,
    };
    // An untouched slug is left to the server, which derives it from the title.
    if (raw.slug?.trim()) body.slug = raw.slug.trim();

    const article = this.editing();
    const request = article?.id
      ? this.Data.put(`articles/${article.id}`, body)
      : this.Data.post('articles', body);

    this.saving.set(true);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.handelResponseSuccess();
      },
      error: () => this.saving.set(false),
    });
  }

  handelResponseSuccess() {
    this.resetForm();
    this.editing.set(null);
    this.success.emit(true);
  }

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onClose() {
    this.closeDialog();
  }

  getControlName(controlName: string) {
    return this.Form().get(controlName);
  }

  // ── SEO helpers ────────────────────────────────────────────────────────

  readonly SEO_TITLE_LIMIT = SEO_TITLE_LIMIT;
  readonly SEO_DESCRIPTION_LIMIT = SEO_DESCRIPTION_LIMIT;

  /** Comma- or newline-separated input, deduplicated, capped at the API's 15. */
  private parseKeywords(value: string | null | undefined): string[] {
    if (!value) return [];
    const seen = new Set<string>();
    for (const keyword of value.split(/[,\n]/)) {
      const trimmed = keyword.trim();
      if (trimmed) seen.add(trimmed);
    }
    return [...seen].slice(0, 15);
  }

  /**
   * Live length of what the search result will actually show — the override if
   * the writer typed one, otherwise the value the server would fall back to.
   */
  seoLength(field: 'metaTitle' | 'metaDescription'): number {
    const override = (this.Form().get(field)?.value ?? '').trim();
    if (override) return override.length;
    const fallback = field === 'metaTitle' ? 'title' : 'excerpt';
    return ((this.Form().get(fallback)?.value ?? '') as string).trim().length;
  }

  /** True once the snippet is long enough that Google will cut it short. */
  seoOverLimit(field: 'metaTitle' | 'metaDescription'): boolean {
    const limit = field === 'metaTitle' ? SEO_TITLE_LIMIT : SEO_DESCRIPTION_LIMIT;
    return this.seoLength(field) > limit;
  }
}
