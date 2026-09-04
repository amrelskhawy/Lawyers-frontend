import { Component, OnInit, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Data } from '../../../core/Servies/data';
import { Seo } from '../../../core/Servies/seo';
import { IArticleCard } from '../../../core/Models/article.model';

/** Public blog index — published articles only, newest first. */
@Component({
  selector: 'app-articles-list',
  standalone: false,
  templateUrl: './articles-list.html',
  styleUrl: './articles-list.scss',
})
export class ArticlesList implements OnInit {
  articles = signal<IArticleCard[]>([]);
  loading = signal<boolean>(true);

  /** Paging is "load more" here — a blog reads better than it paginates. */
  page = signal<number>(1);
  hasMore = signal<boolean>(false);
  loadingMore = signal<boolean>(false);

  private readonly PAGE_SIZE = 9;

  constructor(
    private data: Data,
    private seo: Seo,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.translate
      .get(['articles_page_title', 'articles_page_description'])
      .subscribe((labels: Record<string, string>) => {
        this.pageTitle = labels['articles_page_title'];
        this.applyMetadata();
      });
    this.fetch();
  }

  private pageTitle = '';

  /**
   * The index page's own listing. `ItemList` is what lets Google show the
   * newest posts as sitelinks under the blog result instead of one bare row.
   */
  private applyMetadata() {
    this.translate.get('articles_page_description').subscribe((description: string) => {
      this.seo.apply({
        title: this.pageTitle,
        description,
        canonical: this.seo.url('articles'),
        type: 'website',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          '@id': this.seo.url('articles'),
          name: this.pageTitle,
          description,
          inLanguage: 'ar',
          publisher: { '@type': 'Organization', name: this.seo.siteName },
          blogPost: this.articles().map((article) => ({
            '@type': 'BlogPosting',
            headline: article.title,
            url: article.seo.canonical,
            datePublished: article.seo.publishedTime ?? undefined,
            image: article.seo.image ?? undefined,
          })),
        },
      });
    });
  }

  private fetch() {
    this.data
      .get<any>('public/articles', { page: this.page(), limit: this.PAGE_SIZE })
      .subscribe({
        next: (res) => {
          const rows: IArticleCard[] = res?.data ?? [];
          this.articles.update((current) => (this.page() === 1 ? rows : [...current, ...rows]));
          this.hasMore.set((res?.meta?.page ?? 1) < (res?.meta?.totalPages ?? 1));
          // The listing is only worth emitting once there are cards in it.
          if (this.pageTitle) this.applyMetadata();
          this.loading.set(false);
          this.loadingMore.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.loadingMore.set(false);
        },
      });
  }

  loadMore() {
    if (this.loadingMore() || !this.hasMore()) return;
    this.loadingMore.set(true);
    this.page.update((p) => p + 1);
    this.fetch();
  }
}
