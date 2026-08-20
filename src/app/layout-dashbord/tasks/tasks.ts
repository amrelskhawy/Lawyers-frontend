import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DashboardCrudPage } from '../dashboard-crud-page/dashboard-crud-page';
import { IColumn } from '../types/shared';
import { Auth } from '../../core/Servies/auth';
import { Data } from '../../core/Servies/data';

/**
 * Tasks list. The server already limits the response to tasks the signed-in
 * user created or was assigned to, so there is nothing to filter here — even an
 * ADMIN sees only their own slice.
 */
@Component({
  selector: 'app-tasks',
  standalone: false,
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class Tasks implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;

  columns: IColumn[] = [];
  searchFields = ['title', 'description', 'assigneeNames', 'statusLabel', 'priorityLabel'];
  visibelform = signal<boolean>(false);
  visibelShow = signal<boolean>(false);
  selectedTask = signal<any>(null);

  /** Server-side filters handed to the crud page. */
  extraParams = signal<{ [key: string]: any }>({});
  activeScope = signal<'all' | 'created' | 'assigned'>('all');

  statusOptions: { label: string; value: string }[] = [];

  constructor(
    private translate: TranslateService,
    private auth: Auth,
    private Data: Data,
  ) {}

  ngOnInit() {
    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('task_title'), value: 'title', frozen: true },
      { key: this.translate.instant('task_status'), value: 'statusLabel' },
      { key: this.translate.instant('task_priority'), value: 'priorityLabel' },
      { key: this.translate.instant('task_assignees'), value: 'assigneeNames' },
      { key: this.translate.instant('task_due_date'), value: 'dueDateLabel' },
      { key: this.translate.instant('task_created_by'), value: 'createdByName' },
    ];

    // Labels stay as i18n keys and are translated by the pipe in the template:
    // ngOnInit runs before the language file resolves, so instant() here would
    // bake in the raw key.
    this.statusOptions = ['TODO', 'IN_PROGRESS', 'DONE'].map((value) => ({
      label: `task_status_${value}`,
      value,
    }));
  }

  private get myId(): string {
    return this.auth.currentUser()?.id ?? '';
  }

  dataMapper = (item: any, index: number) => {
    const due = item.dueDate ? new Date(item.dueDate) : null;
    return {
      ...item,
      index: index + 1,
      // Kept for client-side search only — the cells render the pipe instead.
      statusLabel: this.translate.instant(`task_status_${item.status}`),
      priorityLabel: this.translate.instant(`task_priority_${item.priority}`),
      assigneeNames: (item.assignees ?? []).map((a: any) => a.user?.name).filter(Boolean).join('، '),
      createdByName: item.createdBy?.name ?? '',
      dueDateLabel: due ? due.toLocaleDateString() : '—',
      // Overdue only matters while there is still work left on the task.
      isOverdue: !!due && due.getTime() < Date.now() && item.status !== 'DONE',
      isMine: item.createdById === this.myId,
      canChangeStatus:
        item.createdById === this.myId ||
        (item.assignees ?? []).some((a: any) => a.userId === this.myId),
    };
  };

  setScope(scope: 'all' | 'created' | 'assigned') {
    this.activeScope.set(scope);
    this.extraParams.set(scope === 'all' ? {} : { mine: scope });
  }

  onAdd() {
    this.selectedTask.set(null);
    this.visibelform.set(true);
  }

  onEdit(item: any) {
    this.selectedTask.set(item);
    this.visibelform.set(true);
  }

  onView(item: any) {
    this.selectedTask.set(item);
    this.visibelShow.set(true);
  }

  /** Assignees can advance a task without being allowed to edit it. */
  onStatusChange(item: any, status: string) {
    if (!status || status === item.status) return;
    this.Data.patch(`tasks/${item.id}/status`, { status }).subscribe(() =>
      this.crudPage.loadData(),
    );
  }

  HandelResponseSuccess() {
    this.crudPage.loadData();
    this.visibelform.set(false);
  }
}
