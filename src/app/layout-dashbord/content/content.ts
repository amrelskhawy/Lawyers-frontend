import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Passcode } from '../../core/Servies/passcode';

@Component({
  selector: 'app-content',
  standalone: false,
  templateUrl: './content.html',
  styleUrl: './content.scss',
})

export class Content implements OnInit {


  constructor(private passcode: Passcode, private router: Router) { }

  ngOnInit(): void {
  }

  toggel = signal<boolean>(false);

  onToggelMenue(event: boolean) {
    this.toggel.set(event);
  }
}
