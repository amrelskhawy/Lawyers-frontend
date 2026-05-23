import { AfterViewInit, Component, signal, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { PasscodeDialog } from './shared/passcode-dialog/passcode-dialog';
import { Passcode } from './core/Servies/passcode';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
})
export class App implements OnInit, AfterViewInit {
  @ViewChild(PasscodeDialog) passcodeDialog!: PasscodeDialog;

  protected readonly title = signal('LawyeringFrelancer');
  constructor(
    private router: Router,
    private meta: Meta,
    private translate: TranslateService,
    private gtmService: GoogleTagManagerService,
    private passcode: Passcode,
  ) {
    this.router.events.forEach(item => {
      if (item instanceof NavigationEnd) {
        const gtmTag = {
          event: 'page',
          pageName: item.url
        };

        this.gtmService.pushTag(gtmTag);
      }
    });
  }


  ngAfterViewInit(): void {
    if (this.passcodeDialog) this.passcode.registerDialog(this.passcodeDialog);
  }

  ngOnInit(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      setTimeout(() => {
        this.scrollToTop();
        this.IntialContentPage();
      }, 0);
    });
    this.IntialContentPage();
  }

  scrollToTop() {
    // window.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  IntialContentPage() {
    this.translate.get('HOME_META_DESCRIPTION').subscribe((translatedText: string) => {
      this.meta.removeTag("name='description'");
      this.meta.updateTag({
        name: 'description',
        content: translatedText,
      });
    });
  }
}
