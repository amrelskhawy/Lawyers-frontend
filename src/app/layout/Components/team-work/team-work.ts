import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TEAM_MEMBERS } from '../../../core/Models/team-members';

@Component({
  selector: 'app-team-work',
  standalone: false,
  templateUrl: './team-work.html',
  styleUrl: './team-work.scss',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class TeamWork implements OnInit {
  currentLang: string = 'en';

  constructor(private translate: TranslateService) { }

  ngOnInit() {
    this.currentLang = this.translate.currentLang || this.translate.defaultLang || 'en';
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
    });
  }

  teamMembers = TEAM_MEMBERS;

  responsiveOptions = [
    {
      breakpoint: '2000px',
      numVisible: 6,
      numScroll: 1,
    },
    {
      breakpoint: '1600px',
      numVisible: 5,
      numScroll: 1,
    },
    {
      breakpoint: '1300px',
      numVisible: 4,
      numScroll: 1,
    },
    {
      breakpoint: '992px',
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1,
    },
  ];
}
