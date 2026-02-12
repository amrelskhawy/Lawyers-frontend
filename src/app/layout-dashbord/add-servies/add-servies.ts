import { Component, OnInit, signal } from '@angular/core';
import { Data } from '../../core/Servies/data';

@Component({
  selector: 'app-add-servies',
  standalone: false,
  templateUrl: './add-servies.html',
  styleUrl: './add-servies.scss',
})
export class AddServies implements OnInit {
  ngOnInit(): void {
    this.GetAllData();
  }

  constructor(private Data: Data) {}

  data = signal<any[]>([]);
  objdata = signal<any>({});
  visibelform = signal<boolean>(false);
  visibelConfirme = signal<boolean>(false);
  GetAllData() {
    this.Data.get('services').subscribe((res: any) => {
      this.data.set(res.data);
    });
  }

  onEditData(item: any) {
    this.visibelform.set(true);
    this.objdata.set(item);
  }

  onHandelRespnseProccing() {
    this.visibelform.set(false);
    this.objdata.set({});
    this.GetAllData();
  }

  onDelete(item: any) {
    this.objdata.set(item);
    this.visibelConfirme.set(true);
  }

  onHandelStatusConfirmation(event: string) {
    this.visibelConfirme.set(false);
    if (event == 'delete') {
      this.Data.delete(`services/${this.objdata().id}`).subscribe((res) => {
        this.GetAllData();
      });
    }
  }
}
