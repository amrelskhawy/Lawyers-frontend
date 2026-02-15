import { Component, inject } from '@angular/core';
import { Core } from '../../core/Servies/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-success',
  standalone: false,
  templateUrl: './success.html',
  styleUrl: './success.scss',
})
export class Success {
  private core = inject(Core);
  private messageService = inject(MessageService);
constructor(private translate: TranslateService){}
  ngOnInit() {
    this.core._Sussess.asObservable().subscribe((res: any) => {
      if (res) {
        this.showSuccess(res);
      }
    });
  }

  showSuccess(message: string) {
    this.messageService.add({
      severity:message,
      summary:message,
      life: 3000,
    });
  }
}
