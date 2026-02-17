import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { Auth } from './../../core/Servies/auth';

@Component({
  selector: 'app-top-grid',
  standalone: false,
  templateUrl: './top-grid.html',
  styleUrl: './top-grid.scss',
})
export class TopGrid implements OnInit {
  constructor(private auth: Auth) {}

  ngOnInit(): void {
    const user = this.auth.getDecodedToken();
    if (user) {
      this.userData.set(this.processUser(user));
    }
  }

  @Output() visibelformadd = new EventEmitter<boolean>();
  @Output() search = new EventEmitter<string>();

  userData = signal<any>(null);
  pages = signal<string>('');
  @Input()
  set page(value: string) {
    this.pages.set(value);
  }

  processUser(user: any) {
    let name = user.name || user.username;
    if (!name && user.email) {
      name = user.email.split('@')[0];
    }
    return {
      ...user,
      displayName: name,
      isDerivedName: !user.name && !user.username,
    };
  }

  visibelform() {
    this.visibelformadd.emit(true);
  }

  onSearch(event: any) {
    this.search.emit(event.target.value);
  }
}
