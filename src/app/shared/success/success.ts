import { Component, inject } from '@angular/core';
import { Core } from '../../core/Servies/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-success',
  standalone: false,
  templateUrl: './success.html',
  styleUrl: './success.scss',
})
export class Success {
  private core = inject(Core);
  private messageService = inject(MessageService);
  ngOnInit() {
    this.core._Sussess.asObservable().subscribe((res: any) => {
      if (res) {
        this.showSuccess(res);
      }
    });
  }

  showSuccess(message: string) {
    this.messageService.add({
       severity: "success",
      summary: message,
       life: 3000,
    });
  }

}
