import { Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Data } from '../../../core/Servies/data';
import { IUser } from '../users';

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

  readonly roleOptions = [
    { label: 'مدير', value: 'ADMIN' },
    { label: 'مشرف', value: 'MODERATOR' },
    { label: 'موظف استقبال', value: 'RECEPTIONIST' },
    { label: 'محامي', value: 'LAWYER' },
  ];

  get isEdit() { return !!this.user; }
  get title() { return this.isEdit ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'; }

  roleIcon(role: string): string {
    switch (role) {
      case 'ADMIN':        return 'fa-user-shield';
      case 'MODERATOR':    return 'fa-user-tie';
      case 'RECEPTIONIST': return 'fa-headset';
      case 'LAWYER':       return 'fa-gavel';
      default:             return 'fa-user';
    }
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  constructor(private fb: FormBuilder, private data: Data) {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] || changes['visible']) {
      if (this.visible) this.buildForm();
    }
  }

  private buildForm() {
    const u = this.user;
    this.error.set('');
    this.form = this.fb.group({
      nameAr:   [u?.nameAr ?? '', Validators.required],
      nameEn:   [u?.nameEn ?? ''],
      email:    [u?.email ?? '', [Validators.required, Validators.email]],
      password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
      phone:    [u?.phone ?? ''],
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
    const payload: any = {
      name:     val.nameAr,
      nameAr:   val.nameAr || null,
      nameEn:   val.nameEn || null,
      email:    val.email,
      phone:    val.phone || null,
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
