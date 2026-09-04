import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DashboardCrudPage } from '../dashboard-crud-page/dashboard-crud-page';
import { IColumn } from '../types/shared';
import { Data } from '../../core/Servies/data';
import { ArticleStatus, IArticle } from '../../core/Models/article.model';

/**
 * Articles list. The endpoint is already gated to ADMIN/MODERATOR server-side,
 * so every row here is editable by whoever can reach the page.
 */
@Component({
  selector: 'app-articles',
  standalone: false,
  templateUrl: './articles.html',
  styleUrl: './articles.scss',
})
export class Articles implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;

  columns: IColumn[] = [];
  searchFields = ['title', 'excerpt', 'statusLabel', 'createdByName'];
  visibelform = signal<boolean>(false);
  visibelShow = signal<boolean>(false);
  selectedArticle = signal<IArticle | null>(null);

  /** Server-side status filter handed to the crud page. */
  extraParams = signal<{ [key: string]: any }>({});
  activeScope = signal<'all' | ArticleStatus>('all');

  constructor(
    private translate: TranslateService,
    private Data: Data,
  ) {}

  ngOnInit() {
    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('article_cover'), value: 'coverImage' },
      { key: this.translate.instant('article_title'), value: 'title', frozen: true },
      { key: this.translate.instant('article_status'), value: 'statusLabel' },
      { key: this.translate.instant('article_published_at'), value: 'publishedAtLabel' },
      { key: this.translate.instant('article_author'), value: 'createdByName' },
      { key: this.translate.instant('article_updated_at'), value: 'updatedAtLabel' },
    ];
  }

  dataMapper = (item: IArticle, index: number) => {
    const published = item.publishedAt ? new Date(item.publishedAt) : null;
    return {
      ...item,
      index: index + 1,
      // Kept for client-side search only — the cells render their own template.
      statusLabel: this.translate.instant(`article_status_${item.status}`),
      publishedAtLabel: published ? published.toLocaleDateString() : '—',
      updatedAtLabel: new Date(item.updatedAt).toLocaleDateString(),
      createdByName: item.createdBy?.name ?? '',
      isPublished: item.status === 'PUBLISHED',
    };
  };

  setScope(scope: 'all' | ArticleStatus) {
    this.activeScope.set(scope);
    this.extraParams.set(scope === 'all' ? {} : { status: scope });
  }

  onAdd() {
    this.selectedArticle.set(null);
    this.visibelform.set(true);
  }

  onEdit(item: IArticle) {
    this.selectedArticle.set(item);
    this.visibelform.set(true);
  }

  onView(item: IArticle) {
    this.selectedArticle.set(item);
    this.visibelShow.set(true);
  }

  /** Publish / unpublish straight from the row, without opening the editor. */
  onToggleStatus(item: IArticle) {
    this.Data.patch(`articles/${item.id}/toggle-status`, {}).subscribe(() =>
      this.crudPage.loadData(),
    );
  }

  HandelResponseSuccess() {
    this.crudPage.loadData();
    this.visibelform.set(false);
  }
}
