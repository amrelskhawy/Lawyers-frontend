import { Component } from '@angular/core';

@Component({
  selector: 'app-slider-serves',
  standalone: false,
  templateUrl: './slider-serves.html',
  styleUrl: './slider-serves.scss',
})
export class SliderServes {

 products: any[] = [
    {
      name: 'Criminal Law',
      description: 'Defense representations for many various criminal charges investigations.',
      icon: 'pi-shield', // يمكنك استخدام أيقونات PrimeIcons
      inventoryStatus: 'INSTOCK' // سنستخدمها للتحكم في حالة الخدمة (متاحة مثلاً)
    },
    {
      name: 'Corporate Law',
      description: 'Legal advocacy for diverse and fine of conducting in-depth think and reviewing.',
      icon: 'pi-briefcase',
      inventoryStatus: 'INSTOCK'
    },
    {
      name: 'Family Law',
      description: 'Expert defense strategies for variety of criminal cases comprehensive evidence.',
      icon: 'pi-users',
      inventoryStatus: 'LOWSTOCK'
    },
    {
      name: 'Real Estate Law',
      description: 'Representation in numerous criminal matters, including detailed invest.',
      icon: 'pi-home',
      inventoryStatus: 'INSTOCK'
    }
  ];
  responsiveOptions: any[] | undefined;

  ngOnInit() {
    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '1199px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
      }
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
}
