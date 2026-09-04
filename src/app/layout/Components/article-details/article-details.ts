import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { Data } from '../../../core/Servies/data';
import { Seo } from '../../../core/Servies/seo';
import { IArticleDetails } from '../../../core/Models/article.model';

/**
 * Public reader page for one article. The body is the writer's own HTML — it is
 * sanitised server-side on save, so it is rendered through `articleHtml` to
 * keep the fonts, colours and sizes the editor produced.
 */
@Component({
  selector: 'app-article-details',
  standalone: false,
  templateUrl: './article-details.html',
  styleUrl: './article-details.scss',
})
export class ArticleDetails implements OnInit {
  article = signal<IArticleDetails | null>(null);
  loading = signal<boolean>(true);
  notFound = signal<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private data: Data,
    private seo: Seo,
  ) {}

  ngOnInit(): void {
    // A "keep reading" link swaps the slug without leaving the route, so the
    // fetch follows the param rather than running once.
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.loading.set(true);
          this.notFound.set(false);
          const slug = params.get('slug') ?? '';
          return this.data.get<any>(`public/articles/${encodeURIComponent(slug)}`);
        }),
      )
      .subscribe({
        next: (res) => {
          const article: IArticleDetails | null = res?.data ?? null;
          this.article.set(article);
          this.loading.set(false);
          if (article) this.applyMetadata(article);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: () => {
          this.loading.set(false);
          this.notFound.set(true);
        },
      });
  }

  /**
   * Everything a crawler reads about this page. The values come straight from
   * `article.seo` — resolved by the API — so the canonical URL here is byte-for
   * -byte the one in the sitemap, which is what keeps the page indexable.
   */
  private applyMetadata(article: IArticleDetails) {
    this.seo.apply({
      title: article.seo.title,
      description: article.seo.description,
      canonical: article.seo.canonical,
      image: article.seo.image,
      type: 'article',
      robots: article.seo.robots,
      keywords: article.seo.keywords,
      publishedTime: article.seo.publishedTime,
      modifiedTime: article.seo.modifiedTime,
      authorName: article.createdBy?.name ?? null,
      jsonLd: this.buildJsonLd(article),
    });
  }

  /**
   * schema.org graph for the reader page: the article itself, plus the
   * breadcrumb trail Google renders under the result instead of a raw URL.
   */
  private buildJsonLd(article: IArticleDetails) {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        mainEntityOfPage: { '@type': 'WebPage', '@id': article.seo.canonical },
        headline: article.title,
        description: article.seo.description,
        image: article.seo.image ? [article.seo.image] : undefined,
        keywords: article.seo.keywords.length ? article.seo.keywords : undefined,
        datePublished: article.seo.publishedTime ?? undefined,
        dateModified: article.seo.modifiedTime ?? article.seo.publishedTime ?? undefined,
        inLanguage: 'ar',
        author: article.createdBy?.name
          ? { '@type': 'Person', name: article.createdBy.name }
          : { '@type': 'Organization', name: this.seo.siteName },
        publisher: {
          '@type': 'Organization',
          name: this.seo.siteName,
          logo: { '@type': 'ImageObject', url: this.seo.url('assets/Img/LOGO-GOLD.svg') },
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: this.seo.siteName, item: this.seo.url('') },
          { '@type': 'ListItem', position: 2, name: 'Articles', item: this.seo.url('articles') },
          { '@type': 'ListItem', position: 3, name: article.title, item: article.seo.canonical },
        ],
      },
    ];
  }
}
