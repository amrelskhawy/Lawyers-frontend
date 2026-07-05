import { Component, OnInit, signal } from '@angular/core';
import { Data } from '../../core/Servies/data';
import { Auth } from '../../core/Servies/auth';

@Component({
  selector: 'app-content',
  standalone: false,
  templateUrl: './content.html',
  styleUrl: './content.scss',
})

export class Content implements OnInit {


  constructor(private data: Data, private auth: Auth) { }

  ngOnInit(): void {
    // Refresh the signed-in user (incl. the latest profile picture) on dashboard
    // load, so the avatar updates without requiring a re-login.
    this.data.get<{ data: any }>('auth/user').subscribe({
      next: (res) => { if (res?.data) this.auth.setCurrentUser(res.data); },
      error: () => { /* stale session already handled by the error interceptor */ },
    });
  }

  toggel = signal<boolean>(false);

  onToggelMenue(event: boolean) {
    this.toggel.set(event);
  }
}
