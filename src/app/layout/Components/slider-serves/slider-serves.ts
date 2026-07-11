import { Data } from './../../../core/Servies/data';
import { Router } from '@angular/router';
import { Component, input, signal, computed, effect, ChangeDetectionStrategy, OnInit } from '@angular/core';

@Component({
  selector: 'app-slider-serves',
  standalone: false,
  templateUrl: './slider-serves.html',
  styleUrl: './slider-serves.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderServes implements OnInit {
  serviceType = input<'all' | 'normal' | 'installment'>('all');

  constructor(private Data: Data, private router: Router) {
    effect(() => {
      const publicData = this.Data.publicData();
      if (publicData && publicData.services) {
        this._allServices.set(publicData.services);
      }
    });

  }

  ngOnInit() {
    this.ResponsiveCursol();
  }

  responsiveOptions: any[] | undefined;
  _allServices = signal<any[]>([]);
  data = computed(() => {
    const all = this._allServices();
    const type = this.serviceType();
    if (type === 'normal') return all.filter((s: any) => !s.isInstallmentPlans);
    if (type === 'installment') return all.filter((s: any) => s.isInstallmentPlans);
    return all;
  });
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

  showData(item: any) {
    this.visibelData.set(true);
    this.objData.set(item);
  }

  bookService(event: Event, service: any) {
    event.stopPropagation();
    this.router.navigate(['/booking'], { queryParams: { serviceId: service.id } });
  }
}
