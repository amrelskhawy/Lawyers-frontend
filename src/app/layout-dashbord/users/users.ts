import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DashboardCrudPage } from '../dashboard-crud-page/dashboard-crud-page';

export interface IUser {
  id: string;
  name: string;
  nameAr: string | null;
  nameEn: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  picture: string | null;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;

  constructor(private translate: TranslateService) {}

  columns: { key: string; value: string }[] = [];
  searchFields = ['name', 'nameAr', 'nameEn', 'email', 'phone', 'role'];
  private _visibleForm = signal<boolean>(false);
  get visibleForm() { return this._visibleForm(); }
  set visibleForm(v: boolean) { this._visibleForm.set(v); }
  editingUser = signal<IUser | null>(null);

  readonly roleOptions = [
    { label: 'الكل', value: '' },
    { label: 'مدير', value: 'ADMIN' },
    { label: 'مشرف', value: 'MODERATOR' },
    { label: 'موظف استقبال', value: 'RECEPTIONIST' },
    { label: 'محامي', value: 'LAWYER' },
    { label: 'مستشار قانوني', value: 'CONSULTANT' },
  ];
  activeRoleFilter = signal<string>('');

  get endpoint() {
    const r = this.activeRoleFilter();
    return r ? `admin/users?role=${r}` : 'admin/users';
  }

  dataMapper = (item: IUser, index: number) => ({
    ...item,
    index: index + 1,
    displayName: item.nameAr || item.name,
    roleLabel: this.roleLabelMap[item.role] ?? item.role,
  });

  readonly roleLabelMap: Record<string, string> = {
    ADMIN: 'مدير',
    MODERATOR: 'مشرف',
    RECEPTIONIST: 'موظف استقبال',
    LAWYER: 'محامي',
    CONSULTANT: 'مستشار قانوني',
  };

  ngOnInit() {
    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('user_name_ar'), value: 'displayName' },
      { key: this.translate.instant('user_name_en'), value: 'nameEn' },
      { key: this.translate.instant('email'), value: 'email' },
      { key: this.translate.instant('phone'), value: 'phone' },
      { key: this.translate.instant('role'), value: 'roleLabel' },
    ];
  }

  openCreate() {
    this.editingUser.set(null);
    this.visibleForm = true;
  }

  openEdit(item: IUser) {
    this.editingUser.set(item);
    this.visibleForm = true;
  }

  onSaved() {
    this.visibleForm = false;
    this.crudPage?.refresh();
  }

  setRoleFilter(role: string) {
    this.activeRoleFilter.set(role);
    setTimeout(() => this.crudPage?.refresh(), 0);
  }
}
