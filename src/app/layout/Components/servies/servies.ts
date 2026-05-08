import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-servies',
  standalone: false,
  templateUrl: './servies.html',
  styleUrl: './servies.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Servies {
  activeTab = signal<'normal' | 'installment'>('normal');
}
