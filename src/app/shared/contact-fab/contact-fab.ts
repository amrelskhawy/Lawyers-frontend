import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Floating call + WhatsApp buttons for the public site.
 *
 * Rendered on every page outside the dashboard. On the home page the chatbot
 * FAB already occupies the bottom corner, so pass `[withChat]="true"` there to
 * lift this stack above it.
 */
@Component({
  selector: 'app-contact-fab',
  standalone: false,
  templateUrl: './contact-fab.html',
  styleUrl: './contact-fab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactFab {
  /** Offsets the stack so it clears the chatbot FAB when one is on the page. */
  @Input() withChat = false;

  readonly phone = '+966535041555';
  readonly whatsapp = 'https://wa.me/966535041555';
}
