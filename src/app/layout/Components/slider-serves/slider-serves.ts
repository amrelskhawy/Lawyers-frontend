import { Data } from './../../../core/Servies/data';
import { Component, signal, effect } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-slider-serves',
  standalone: false,
  templateUrl: './slider-serves.html',
  styleUrl: './slider-serves.scss',
})
export class SliderServes {
  constructor(private Data: Data, private router: Router) {
    effect(() => {
      const publicData = this.Data.publicData();
      if (publicData && publicData.services) {
        this.data.set(publicData.services);
      }
    });
  }

  ngOnInit() {
    this.ResponsiveCursol();
  }

  responsiveOptions: any[] | undefined;
  data = signal<any[]>([]);
  objData = signal<any>({});
  visibelData = signal<boolean>(false);

  getcuurentLangauage() {
    let lang = localStorage.getItem('Language');
    return lang;
  }

  getServiceDescription(service: any): string {
    const lang = this.getcuurentLangauage();
    const description = service[`description_${lang}`];
    return description && description.length > 110
      ? description.substring(0, 110) + '...'
      : description;
  }

  ResponsiveCursol() {
    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 3,
        numScroll: 1,
      },
      {
        breakpoint: '1200px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '991px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '768px',
        numVisible: 1,
        numScroll: 1,
      },
    ];
  }

  getSeverity(status: string) {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warn';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return 'info';
    }
  }


  showData(item: any) {
    this.visibelData.set(true)
    this.objData.set(item)
  }

  bookService(event: Event, service: any) {
    event.stopPropagation();
    this.router.navigate(['/booking'], { queryParams: { serviceId: service.id } });
  }
}
