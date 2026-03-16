import { Component, NgZone, OnInit } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: false,
  templateUrl: './counter.html',
  styleUrl: './counter.scss',
})
export class Counter implements OnInit {
  ngOnInit(): void {
    this.intervalNumberCounter();
  }

displayValue = 0;
ticks: boolean[] = Array(60).fill(false);
readonly target = 4260;

intervalNumberCounter() {
  const interval = setInterval(() => {
    if (this.displayValue < this.target) {
      this.displayValue += 1;

      const activeTicks = Math.floor((this.displayValue / this.target) * 60);
      this.ticks = this.ticks.map((_, i) => i < activeTicks);

    } else {
      this.ticks = this.ticks.map(() => true);
      clearInterval(interval);
    }
  }, 1);
}
}
