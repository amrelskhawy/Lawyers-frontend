export type ArticleStatus = 'DRAFT' | 'PUBLISHED';

/**
 * Crawler-facing values for one article, resolved by the API — the fallbacks
 * (meta title → title, meta description → excerpt → body) and the canonical URL
 * are decided server-side so the page and the sitemap can never disagree.
 */
export interface IArticleSeo {
  /** The article's own language, not the visitor's UI language. */
  language: 'ar' | 'en';
  /** Open Graph locale for that language, e.g. `ar_SA`. */
  locale: string;
  dir: 'rtl' | 'ltr';
  title: string;
  description: string;
  canonical: string;
  image: string | null;
  keywords: string[];
  robots: string;
  publishedTime: string | null;
  modifiedTime: string | null;
}

/** A blog article. `content` is sanitised rich-text HTML from the editor. */
export interface IArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: ArticleStatus;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  noIndex: boolean;
  language: 'ar' | 'en';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id?: string; name: string; picture?: string | null } | null;
  updatedBy?: { id: string; name: string } | null;
}

/** Card shape returned by the public endpoints — no body, no draft fields. */
export interface IArticleCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  seo: IArticleSeo;
  createdBy?: { name: string; picture?: string | null } | null;
}

/** Reader page payload: the article plus a short "keep reading" rail. */
export interface IArticleDetails extends IArticleCard {
  content: string;
  related: IArticleCard[];
}

/** What the dashboard form sends on create/update. */
export interface IArticlePayload {
  title: string;
  slug?: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  status?: ArticleStatus;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[];
  noIndex?: boolean;
  /** Detected from the body server-side; sent only to override a wrong guess. */
  language?: 'ar' | 'en';
}
