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
      name: 'استشارات قانونية',
      description: 'نقدم استشارات قانونية شاملة ومتخصصة في جميع فروع القانون السعودي، بما يضمن حصولكم على الإرشاد القانوني الصحيح لاتخاذ القرارات المناسبة.',
      icon: 'pi-shield',
      inventoryStatus: 'INSTOCK'
    },
    {
      name: 'تعويض عن الخطأ الطبي',
      description: 'متخصصون في قضايا الأخطاء الطبية والحصول على التعويضات المستحقة للمرضى وذويهم، مع ضمان أفضل النتائج القانونية.',
      icon: 'pi-briefcase',
      inventoryStatus: 'INSTOCK'
    },
    {
      name: 'دراسة العقود والقضايا',
      description: 'مراجعة وإعداد وصياغة العقود بجميع أنواعها، مع ضمان حماية حقوق عملائنا والتأكد من سلامة البنود القانونية.',
      icon: 'pi-users',
      inventoryStatus: 'LOWSTOCK'
    },

    {
      name: 'الترافع أمام المحاكم',
      description: 'تمثيل قانوني متخصص أمام جميع درجات المحاكم والهيئات القضائية، مع ضمان أفضل دفاع قانوني لعملائنا.',
      icon: 'pi-home',
      inventoryStatus: 'INSTOCK'
    },

    {
      name: 'نقض الحكم',
      description: 'الطعن في الأحكام والقرارات القضائية أمام المحاكم العليا، مع دراسة دقيقة للأسباب القانونية للطعن.',
      icon: 'pi-home',
      inventoryStatus: 'INSTOCK'
    }
    ,

    {
      name: 'التحكيم التجاري وحل النزاعات',
      description: 'حل النزاعات التجارية والمدنية عن طريق التحكيم، مع ضمان سرعة الفصل وتوفير التكاليف على العملاء.',
      icon: 'pi-home',
      inventoryStatus: 'INSTOCK'
    }
    ,

    {
      name: 'جميع أنواع القضايا في القانون السعودي',
      description: 'خبرة شاملة في جميع فروع القانون السعودي، من القضايا المدنية والتجارية إلى الجزائية والإدارية.',
      icon: 'pi-home',
      inventoryStatus: 'INSTOCK'
    },
    {
      name: 'منصة التوثيق',
      description: 'خدمات التوثيق الرسمية للمستندات والعقود أمام الجهات المختصة، مع ضمان صحة الإجراءات وسرعة الإنجاز.',
      icon: 'pi-home',
      inventoryStatus: 'INSTOCK'
    },
    {
      name: 'الملكية الفكرية',
      description: 'حماية حقوق الملكية الفكرية والعلامات التجارية وبراءات الاختراع، مع تقديم الاستشارات المتخصصة في هذا المجال.',
      icon: 'pi-home',
      inventoryStatus: 'INSTOCK'
    },
  ];



  responsiveOptions: any[] | undefined;

  ngOnInit() {
    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 3,
        numScroll: 1
      },
      {
        breakpoint: '1200px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '991px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '768px',
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
