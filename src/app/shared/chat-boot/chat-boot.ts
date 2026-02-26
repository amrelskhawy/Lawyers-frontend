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
  messages: { role: 'user' | 'bot', text: string }[] = [];
  isLoading = signal<boolean>(false);

  constructor(
    private Data: Data,
  ) { }
  toggleChat() {
    this.isOpen = !this.isOpen;
  }



  formatClosuresToHtml(text: string) {
    if (!text) return '';

    let html = text;
    // 1. Convert bold syntax **text** 
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // 2. Convert italic syntax *text*
    html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");

    // 3. Convert inline code `text`
    html = html.replace(/`(.*?)`/g, "<span class='chat-code'>$1</span>");

    // 4. Convert List Items (* item)
    html = html.replace(/^\s*\*\s+(.+)$/gm, "<li>$1</li>");

    // 5. Wrap consecutive <li> in <ul>
    html = html.replace(/(<li>[\s\S]*?<\/li>(?:\s*<li>[\s\S]*?<\/li>)*)/g, "<ul>\n$1\n</ul>");

    // 6. Convert line breaks to <br />
    html = html.replace(/\n/g, "<br />");

    // 7. Clean up unwanted <br /> tags around HTML list elements so it renders nicely
    html = html.replace(/<\/li><br \/>/g, "</li>");
    html = html.replace(/<br \/><li>/g, "<li>");
    html = html.replace(/<ul><br \/>/g, "<ul>");
    html = html.replace(/<br \/><\/ul>/g, "</ul>");
    html = html.replace(/<br \/><br \/><ul>/g, "<ul>");
    html = html.replace(/<br \/><ul>/g, "<ul>");
    html = html.replace(/<\/ul><br \/><br \/>/g, "</ul><br />");

    return html;
  }



  sendMessage(input: HTMLInputElement) {
    if (this.isLoading()) return;

    const text = input.value.trim();
    if (!text) return;

    // Push User message
    this.messages.push({ role: 'user', text: text });

    // Empty input immediately and trigger load block
    input.value = '';
    this.isLoading.set(true);

    const body = { question: text };
    this.Data.post('chat', body).subscribe({
      next: (res: any) => {
        this.messages.push({ role: 'bot', text: res.data.answer });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }
}
