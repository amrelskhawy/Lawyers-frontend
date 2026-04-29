import { AfterViewInit, Component, OnInit, ViewChild, signal } from '@angular/core';
import { Passcode } from '../../core/Servies/passcode';
import { PasscodeDialog } from '../../shared/passcode-dialog/passcode-dialog';

@Component({
  selector: 'app-content',
  standalone: false,
  templateUrl: './content.html',
  styleUrl: './content.scss',
})
export class Content implements OnInit, AfterViewInit {
  @ViewChild(PasscodeDialog) passcodeDialog!: PasscodeDialog;

  constructor(private passcode: Passcode) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.passcodeDialog) this.passcode.registerDialog(this.passcodeDialog);
  }

  toggel = signal<boolean>(false);

  onToggelMenue(event: boolean) {
    this.toggel.set(event);
  }
}
