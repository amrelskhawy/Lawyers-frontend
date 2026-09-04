import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment.pord';

/** Everything a single page needs a crawler to know about it. */
export interface SeoConfig {
  title: string;
  description?: string | null;
  /** Absolute URL. Falls back to the current location when omitted. */
  canonical?: string | null;
  /** Absolute URL of the sharing image (1200×630 reads best on every network). */
  image?: string | null;
  type?: 'website' | 'article';
  /** e.g. `index, follow` or `noindex, follow`. */
  robots?: string;
  keywords?: string[];
  /** ISO timestamps — only meaningful when `type` is `article`. */
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authorName?: string | null;
  /**
   * Language of the *content*, not of the UI chrome. Most articles here are
   * Arabic even when a visitor has the interface set to English, and it is the
   * content's language a crawler needs.
   */
  language?: 'ar' | 'en';
  /** Open Graph locale matching `language`, e.g. `ar_SA`. */
  locale?: string;
  /** schema.org graph for this page. Replaces whatever the last page set. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[] | null;
}

/**
 * The firm's name in each language. Arabic first — it is what most visitors
 * search for, and what index.html and the manifest already declare. Kept here
 * rather than in the translation files because it has to be readable
 * synchronously, before the i18n bundle has loaded.
 */
const SITE_NAME: Record<'ar' | 'en', string> = {
  ar: 'شركة سعد البقمي للمحاماة والاستشارات القانونية',
  en: 'Saad Al-Baqami Law Firm & Legal Consultations',
};

const SITE_DESCRIPTION: Record<'ar' | 'en', string> = {
  ar: 'شركة سعد البقمي للمحاماة والاستشارات القانونية تقدم خدمات قانونية احترافية ومتخصصة تغطي جميع جوانب القانون السعودي، بخبرة تمتد لأكثر من 15 عامًا في العقود والتقاضي والشركات وقضايا الأسرة.',
  en: 'Saad Al-Baqami Law Firm & Legal Consultations – professional and specialized legal services covering all aspects of Saudi law, with over 15 years of experience.',
};

const SITE_IMAGE = `${environment.siteUrl}/assets/Img/LOGO-GOLD.svg`;

/**
 * The one place that writes crawler-facing tags.
 *
 * Angular keeps a single `<head>` for the whole session, so tags a page sets
 * survive into the next route unless something clears them — an article's
 * `og:image` staying put on the contact page is the classic version of that
 * bug. Every page therefore goes through `apply()`, which writes the full set
 * and overwrites the previous page's values rather than merging with them.
 */
@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  /** Absolute origin, no trailing slash — matches the backend's SITE_URL. */
  readonly siteUrl = environment.siteUrl.replace(/\/+$/, '');
  /** The firm's name in the language the visitor is currently reading. */
  get siteName(): string {
    return SITE_NAME[this.uiLanguage];
  }

  /** The other language's name — used as `alternateName` in structured data. */
  get siteNameAlternate(): string {
    return SITE_NAME[this.uiLanguage === 'ar' ? 'en' : 'ar'];
  }

  /**
   * Whether the current route has published its own tags yet. Route defaults
   * are translated asynchronously, so without this flag a slow translation file
   * could land after an article had already set its metadata and overwrite it —
   * the article would then be shared with the home page's description.
   */
  private ownedByPage = false;

  /** Called on every NavigationEnd, before anything writes tags. */
  beginNavigation(): void {
    this.ownedByPage = false;
  }

  /**
   * Site-wide tags, for every route that has nothing more specific to say.
   * Yields to a page that has already spoken for itself.
   */
  applySiteDefaults(description?: string | null): void {
    if (this.ownedByPage) return;
    const language = this.uiLanguage;
    this.write({
      title: SITE_NAME[language],
      // The translated string when i18n has loaded, otherwise the built-in copy
      // for that language — never the English one as a stand-in for Arabic.
      description: description || SITE_DESCRIPTION[language],
      image: SITE_IMAGE,
      type: 'website',
      robots: 'index, follow',
      language,
      jsonLd: null,
    });
  }

  /** A page claiming its own metadata. Wins over the site defaults. */
  apply(config: SeoConfig): void {
    this.ownedByPage = true;
    this.write(config);
  }

  private write(config: SeoConfig): void {
    const description = (config.description ?? SITE_DESCRIPTION[this.uiLanguage]).trim();
    const canonical = this.absolute(config.canonical) ?? this.currentUrl();
    const image = this.absolute(config.image) ?? SITE_IMAGE;
    const type = config.type ?? 'website';
    // A page that knows its own content language wins; otherwise the language
    // the visitor is browsing in.
    const language = config.language ?? this.uiLanguage;
    const locale = config.locale ?? (language === 'en' ? 'en_US' : 'ar_SA');

    this.title.setTitle(config.title);

    this.set('name', 'description', description);
    this.set('name', 'robots', config.robots ?? 'index, follow');
    this.set('name', 'keywords', config.keywords?.join(', ') ?? '');
    this.set('name', 'author', config.authorName ?? this.siteName);

    // Open Graph — Facebook, WhatsApp, LinkedIn, Telegram.
    this.set('property', 'og:site_name', this.siteName);
    this.set('property', 'og:type', type);
    this.set('property', 'og:title', config.title);
    this.set('property', 'og:description', description);
    this.set('property', 'og:url', canonical);
    this.set('property', 'og:image', image);
    this.set('property', 'og:locale', locale);
    this.set('property', 'og:locale:alternate', language === 'ar' ? 'en_US' : 'ar_SA');
    // Spelled out for the crawlers that read this rather than sniffing the
    // script — the Arabic pages are the ones that must not be mislabelled.
    this.set('name', 'language', language === 'en' ? 'English' : 'Arabic');

    // X/Twitter reads its own namespace; `summary_large_image` is what turns a
    // shared link into a full-width card instead of a thumbnail.
    this.set('name', 'twitter:card', 'summary_large_image');
    this.set('name', 'twitter:title', config.title);
    this.set('name', 'twitter:description', description);
    this.set('name', 'twitter:image', image);

    // Only articles carry these; a stale published date on the home page would
    // otherwise tell Google the site has not been touched since that post.
    this.set('property', 'article:published_time', type === 'article' ? config.publishedTime ?? '' : '');
    this.set('property', 'article:modified_time', type === 'article' ? config.modifiedTime ?? '' : '');

    this.setCanonical(canonical);
    this.setJsonLd(config.jsonLd ?? null);
  }

  /**
   * Writes a tag, or removes it when the value is empty — an empty
   * `<meta name="keywords" content="">` is worse than no tag at all.
   */
  private set(attr: 'name' | 'property', key: string, value: string): void {
    const selector = `${attr}='${key}'`;
    if (!value) {
      this.meta.removeTag(selector);
      return;
    }
    this.meta.updateTag({ [attr]: key, content: value } as any, selector);
  }

  /**
   * The self-referencing canonical. Without it every tracking parameter
   * (`?utm_source=…`, `?fbclid=…`) on a shared link looks to Google like a
   * separate copy of the article competing with the original.
   */
  private setCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /** Replaces the page's schema.org block, or clears it on a page without one. */
  private setJsonLd(data: Record<string, unknown> | Record<string, unknown>[] | null): void {
    const existing = this.document.getElementById('page-jsonld');
    if (existing) existing.remove();
    if (!data) return;

    const script = this.document.createElement('script');
    script.id = 'page-jsonld';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  /**
   * The language the visitor is currently reading the site in. Read from the
   * live `<html lang>` — index.html ships `ar`, and the Translation component
   * rewrites it when someone switches — so this is correct from first paint
   * without waiting on the i18n bundle.
   */
  get uiLanguage(): 'ar' | 'en' {
    return this.document.documentElement.lang === 'en' ? 'en' : 'ar';
  }

  /** Builds an absolute site URL from a route path. */
  url(path: string): string {
    return `${this.siteUrl}/${path.replace(/^\/+/, '')}`;
  }

  /** Leaves already-absolute URLs (Drive covers) alone, resolves the rest. */
  private absolute(value: string | null | undefined): string | null {
    if (!value) return null;
    return /^https?:\/\//i.test(value) ? value : this.url(value);
  }

  /** Current route as an absolute URL, query string dropped. */
  private currentUrl(): string {
    return this.url(this.document.location.pathname);
  }
}
