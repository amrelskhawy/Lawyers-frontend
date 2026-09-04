import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { IArticle } from '../../../core/Models/article.model';

/** Read-only preview — the article exactly as a visitor would read it. */
@Component({
  selector: 'app-show-article-data',
  standalone: false,
  templateUrl: './show-article-data.html',
  styleUrl: './show-article-data.scss',
})
export class ShowArticleData {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() set objdata(value: IArticle | null) {
    this.article.set(value ?? null);
  }

  article = signal<IArticle | null>(null);

  /** Where this article lives on the public site once it is published. */
  get publicUrl(): string {
    const slug = this.article()?.slug;
    return slug ? `${window.location.origin}/articles/${encodeURIComponent(slug)}` : '';
  }

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
