import { Component, inject } from '@angular/core';
import { PwaInstallService } from './pwa-install.service';

/**
 * Auto install banner shown on every mobile/tablet platform, since browsers no
 * longer auto-prompt. All installability logic lives in `PwaInstallService`;
 * this is just the banner UI. Dismissing hides only the banner — the header
 * "install app" entry (also backed by the service) keeps working afterwards.
 */
@Component({
  selector: 'app-pwa-install',
  standalone: false,
  templateUrl: './pwa-install.html',
  styleUrl: './pwa-install.scss',
})
export class PwaInstall {
  readonly pwa = inject(PwaInstallService);
}
