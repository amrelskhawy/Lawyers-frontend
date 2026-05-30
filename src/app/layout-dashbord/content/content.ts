import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-content',
  standalone: false,
  templateUrl: './content.html',
  styleUrl: './content.scss',
})

export class Content implements OnInit {


  constructor() { }

  ngOnInit(): void {
  }

  toggel = signal<boolean>(false);

  onToggelMenue(event: boolean) {
    this.toggel.set(event);
  }
}
