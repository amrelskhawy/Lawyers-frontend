import { Component, inject } from '@angular/core';
import { Core } from '../../core/Servies/core';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-error',
  standalone: false,
  templateUrl: './error.html',
  styleUrl: './error.scss',
})
export class Error {
  private core = inject(Core);
  private messageService = inject(MessageService);
  ngOnInit() {
    this.core._Error.asObservable().subscribe((res: any) => {
      if (res) {
         this.showError(res);
      }
    });
  }

  showError(message: string) {
    this.messageService.add({
       severity: 'error',
      summary: message,
       life: 3000,
    });
  }





}
