import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Render an article body as-is.
 *
 * The HTML comes back from our own API, which sanitises it on write against a
 * strict tag/attribute whitelist (see `html-sanitize.ts` on the backend), so the
 * only thing left to preserve here is the writer's formatting: Angular's own
 * sanitiser strips the inline `style` attributes the editor uses for colours,
 * fonts and sizes, which would flatten every styled article.
 *
 * Only ever pass article content from the API through this pipe.
 */
@Pipe({
  name: 'articleHtml',
  standalone: false,
})
export class ArticleHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value ?? '');
  }
}
