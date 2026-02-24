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



formatClosuresToHtml(text: string) {
  // return text
  //   .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  //   .replace(/`(.+?)`/g, "<code>$1</code>")
  //   .replace(/^\s*\*\s+(.+)$/gm, "<li>$1</li>")
  //   .replace(/(<li>[\s\S]+?<\/li>)/g, "<ul>$1</ul>")
  //   .replace(/\n/g, "<br />");

    return text
    // Convert headings *text*
    .replace(/\\(.?)\\*/g, "<strong>$1</strong>")
    // Convert list items *
    .replace(/^\\s+(.)$/gm, "<li>$1</li>")
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    // Convert line breaks
    .replace(/\n/g, "<br />");
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
