import { Component } from '@angular/core';
import { Translation } from '../../core/Servies/translation';

@Component({
  selector: 'app-change-langauage',
  standalone: false,
  templateUrl: './change-langauage.html',
  styleUrl: './change-langauage.scss',
})
export class ChangeLangauage {

  constructor(
    public translationService:Translation
  ) {}
  changeLang(lang: string) {
  this.translationService.setLanguage(lang);
}
}
