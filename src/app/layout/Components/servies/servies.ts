import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-servies',
  standalone: false,
  templateUrl: './servies.html',
  styleUrl: './servies.scss',
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class Servies {

}
