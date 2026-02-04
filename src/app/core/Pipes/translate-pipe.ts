import { Pipe, PipeTransform } from '@angular/core';
import { Translation } from '../Servies/translation';

@Pipe({
  name: 'translate',
  standalone: false,
  pure: true
})
export class TranslatePipe implements PipeTransform {
constructor(private translationService: Translation) {}

transform(key: string, lang: string): string {
    return this.translationService.translate(key);
  }

}
