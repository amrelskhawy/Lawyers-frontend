import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Data } from '../../../core/Servies/data';

@Component({
  selector: 'app-main-page',
  standalone: false,
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPage implements OnInit {
  constructor(private dataService: Data) { }

  ngOnInit() {
    this.dataService.getPublicData().subscribe();
  }

  navigation: string = '';

  onEventRoute(event: string) {
    this.navigation = event;
    const el = document.getElementById(this.navigation);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

}
