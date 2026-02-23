import { Component, signal } from '@angular/core';
import { Data } from '../../core/Servies/data';
import { Core } from '../../core/Servies/core';

@Component({
  selector: 'app-chat-boot',
  standalone: false,
  templateUrl: './chat-boot.html',
  styleUrl: './chat-boot.scss',
})
export class ChatBoot {
  isOpen = false;
  messages:string='';
  isLoading = signal<boolean>(false);

  constructor(
    private Data: Data,
  ) {}
  toggleChat() {
    this.isOpen = !this.isOpen;
    this.messages=''
  }

  sendMessage(input: HTMLInputElement) {
    this.isLoading.set(true);
    const text = input.value.trim();
    if (!text) return;
    const body = { question: text };
     this.Data.post('chat', body).subscribe({
    next: (res: any) => {
      this.messages = res.data.answer;
      input.value = '';
      this.isLoading.set(false);
    },
    error: (err) => {
      console.error(err);
      this.isLoading.set(false);  
    }
  });
  }
}
