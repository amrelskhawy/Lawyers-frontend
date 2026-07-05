import { Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Data } from '../../../core/Servies/data';
import { IUser } from '../users';
import { Country, COUNTRIES } from '../../../core/Models/countries.model';

@Component({
  selector: 'app-form-user',
  standalone: false,
  templateUrl: './form-user.html',
  styleUrl: './form-user.scss',
})
export class FormUser implements OnChanges {
  @Input() user: IUser | null = null;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;
  saving = signal<boolean>(false);
  error = signal<string>('');
  uploadingImage = signal<boolean>(false);
  imageError = signal<string>('');

  private static readonly MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

  countries = COUNTRIES;
  selectedCountry: Country = COUNTRIES[0];

  readonly roleOptions = [
    { label: 'مدير', value: 'ADMIN' },
    { label: 'مشرف', value: 'MODERATOR' },
    { label: 'موظف استقبال', value: 'RECEPTIONIST' },
    { label: 'محامي', value: 'LAWYER' },
    { label: 'مستشار قانوني', value: 'CONSULTANT' },
  ];

  get isEdit() { return !!this.user; }
  get title() { return this.isEdit ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'; }

  roleIcon(role: string): string {
    switch (role) {
      case 'ADMIN':        return 'fa-user-shield';
      case 'MODERATOR':    return 'fa-user-tie';
      case 'RECEPTIONIST': return 'fa-headset';
      case 'LAWYER':       return 'fa-gavel';
      case 'CONSULTANT':   return 'fa-user-graduate';
      default:             return 'fa-user';
    }
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  /** Pick a file → upload to Drive immediately → store the returned URL on the
   *  `picture` control (persisted when the form is saved). */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.imageError.set('');
    if (!file.type.startsWith('image/')) {
      this.imageError.set('يُسمح بملفات الصور فقط');
      input.value = '';
      return;
    }
    if (file.size > FormUser.MAX_IMAGE_BYTES) {
      this.imageError.set('حجم الصورة يتجاوز 5 ميجابايت');
      input.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.uploadingImage.set(true);
    this.data.post<{ data: { url: string } }>('admin/users/upload-image', formData).subscribe({
      next: (res) => {
        this.uploadingImage.set(false);
        this.form.get('picture')?.setValue(res?.data?.url ?? '');
        input.value = '';
      },
      error: (err) => {
        this.uploadingImage.set(false);
        this.imageError.set(err?.error?.message ?? 'تعذّر رفع الصورة، حاول مرة أخرى');
        input.value = '';
      },
    });
  }

  removeImage() {
    this.form.get('picture')?.setValue('');
    this.imageError.set('');
  }

  constructor(private fb: FormBuilder, private data: Data) {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] || changes['visible']) {
      if (this.visible) this.buildForm();
    }
  }

  private detectCountry(phone: string | null): { country: Country; localNumber: string } {
    if (!phone) return { country: COUNTRIES[0], localNumber: '' };
    const sorted = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);
    for (const c of sorted) {
      if (phone.startsWith(c.code)) {
        return { country: c, localNumber: phone.slice(c.code.length) };
      }
    }
    return { country: COUNTRIES[0], localNumber: phone };
  }

  private buildForm() {
    const u = this.user;
    this.error.set('');
    const detected = this.detectCountry(u?.phone ?? '');
    this.selectedCountry = detected.country;

    this.form = this.fb.group({
      nameAr:   [u?.nameAr ?? '', Validators.required],
      nameEn:   [u?.nameEn ?? ''],
      email:    [u?.email ?? '', [Validators.required, Validators.email]],
      password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
      phone:    [detected.localNumber],
      location: [u?.location ?? ''],
      picture:  [u?.picture ?? ''],
      role:     [u?.role ?? 'RECEPTIONIST', Validators.required],
    });
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  submit() {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.error.set('');

    const val = this.form.value;
    const fullPhone = val.phone ? this.selectedCountry.code + val.phone : null;

    const payload: any = {
      name:     val.nameAr,
      nameAr:   val.nameAr || null,
      nameEn:   val.nameEn || null,
      email:    val.email,
      phone:    fullPhone,
      location: val.location || null,
      picture:  val.picture || null,
      role:     val.role,
    };
    if (val.password) payload.password = val.password;

    const req$ = this.isEdit
      ? this.data.patch(`admin/users/${this.user!.id}`, payload)
      : this.data.post('admin/users', payload);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.close();
        this.saved.emit();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'حدث خطأ، حاول مرة أخرى');
      },
    });
  }
}

