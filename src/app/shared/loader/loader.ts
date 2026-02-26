import { Component, OnInit, inject } from '@angular/core';
import { Core } from '../../core/Servies/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-loader',
  standalone: false,
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader implements OnInit {
  private core = inject(Core);

  loading = toSignal(this.core._loading, { initialValue: false });
  currentLang = 'en';

  ngOnInit() {
    this.currentLang = localStorage.getItem('Language') || 'en';
  }
}
