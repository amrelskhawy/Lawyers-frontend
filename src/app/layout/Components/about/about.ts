import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: false,
  templateUrl: './about.html',
  styleUrl: './about.scss',
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class About {

}
