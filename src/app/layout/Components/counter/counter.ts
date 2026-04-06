
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: false,
  templateUrl: './counter.html',
  styleUrl: './counter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Counter implements OnInit {
  displayValue = 0;
  ticks: boolean[] = Array(60).fill(false);
  readonly target = 4260;
  readonly duration = 4000;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.startCounter();
  }

  startCounter() {
    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      this.displayValue = Math.floor(progress * this.target);
      const activeTicks = Math.floor(progress * 60);
      this.ticks = this.ticks.map((_, i) => i < activeTicks);

      if (progress < 1) {
        this.cdr.markForCheck();
        requestAnimationFrame(update);
      } else {
        this.displayValue = this.target;
        this.ticks = this.ticks.map(() => true);
        this.cdr.markForCheck();
      }
    };

    requestAnimationFrame(update);
  }
}
