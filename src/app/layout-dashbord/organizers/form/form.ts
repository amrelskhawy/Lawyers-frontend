import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Data } from '../../../core/Servies/data';

@Component({
  selector: 'app-organizer-form',
  standalone: false,
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class OrganizerForm implements OnInit {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() success = new EventEmitter<boolean>();

  Form = signal<FormGroup>(new FormGroup({}));
  users = signal<{ label: string; value: string }[]>([]);

  constructor(
    private FB: FormBuilder,
    private Data: Data,
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.loadUsers();
  }

  createForm() {
    this.Form.set(
      this.FB.group({
        userId: ['', Validators.required],
      }),
    );
  }

  loadUsers() {
    this.Data.get<any>('admin/users').subscribe((res) => {
      this.users.set(
        (res.data as any[]).map((u) => ({
          label: `${u.name} — ${u.email} (${u.role})`,
          value: u.id,
        })),
      );
    });
  }

  onSubmit() {
    if (this.Form().invalid) {
      this.Form().markAllAsTouched();
      return;
    }
    this.Data.post('organizers', this.Form().value).subscribe((res) => {
      this.handelResponseSuccess();
    });
  }

  handelResponseSuccess() {
    this.Form().reset();
    this.loadUsers();
    this.success.emit(true);
  }

  onClose() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  getControlName(controlName: string) {
    return this.Form().get(controlName);
  }
}
