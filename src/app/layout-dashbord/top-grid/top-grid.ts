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
    // const user = this.auth.getDecodedToken();
    // if (user) {
    //   this.userData.set(this.processUser(user));
    // }

    this.processUser()
  }

  @Input() showAddButton = true;
  @Output() visibelformadd = new EventEmitter<boolean>();
  @Output() search = new EventEmitter<string>();

  userData = signal<any>(null);

  pages = signal<string>('');
  @Input()
  set page(value: string) {
    this.pages.set(value);
  }

  processUser() {
    // let name = user.name || user.username;
    // if (!name && user.email) {
    //   name = user.email.split('@')[0];
    // }
    // return {
    //   ...user,
    //   displayName: name,
    //   isDerivedName: !user.name && !user.username,
    // };

 let get_usre = sessionStorage.getItem('user');
    let parseUser: any = null;
    if (get_usre) {
      parseUser = JSON.parse(get_usre);
      this.userData.set(parseUser)
    }
  }

  visibelform() {
    this.visibelformadd.emit(true);
  }

  /** Emits only on an explicit search (icon click or Enter), not on each keystroke. */
  onSearch(value: string) {
    this.search.emit(value ?? '');
  }
}
