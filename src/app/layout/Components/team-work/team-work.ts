import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-team-work',
  standalone: false,
  templateUrl: './team-work.html',
  styleUrl: './team-work.scss',
})
export class TeamWork implements OnInit {
  currentLang: string = 'en';

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.currentLang = this.translate.currentLang || this.translate.defaultLang || 'en';
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
    });
  }

  teamMembers = [
    {
      name_ar: 'دكتور سعد البقمي',
      name_en: 'Dr. Saad Al-Baqami',
      image: '/assets/Img/founder-ceo-dr-saad-albaqami.avif',
      role_ar: 'المؤسس والرئيس التنفيذي',
      role_en: 'Founder & CEO',
    },
    {
      name_ar: 'دكتور ناصر البقمي',
      name_en: 'Dr. Nasser Al-Baqami',
      image: '',
      role_ar: 'المدير العام',
      role_en: 'General Manager',
    },
    {
      name_ar: 'دكتور عبد الرحمن المرلى',
      name_en: 'Dr. Abdulrahman Al-Morla',
      image: '/assets/Img/dr-abdulrahman.avif',
      role_ar: 'مستشار قانوني',
      role_en: 'Legal Consultant',
    },
    {
      name_ar: 'فتحي عبد الجليل',
      name_en: 'Fathi Abduljalil',
      image: '',
      role_ar: 'مستشار قانوني',
      role_en: 'Legal Consultant',
    },
    {
      name_ar: 'سعد الحارثي',
      name_en: 'Saad Al-Harthi',
      image: '/assets/Img/saad-alharthi.avif',
      role_ar: 'محامي',
      role_en: 'Lawyer',
    },
    {
      name_ar: 'حلا البلبيسي',
      name_en: 'Hala Al-Bulbaisi',
      image: '/assets/Img/hala-albulbaisi.avif',
      role_ar: 'مستشارة قانونية',
      role_en: 'Legal Consultant',
    },
    {
      name_ar: 'عفاف الخشرمي',
      name_en: 'Afaf Al-Khashrami',
      image: '/assets/Img/afaf-alkhashrami.avif',
      role_ar: 'محامية',
      role_en: 'Lawyer',
    },
    {
      name_ar: 'نور عز الدين',
      name_en: 'Nour Ezz El-Din',
      image: '/assets/Img/nour-ezzeldine.avif',
      role_ar: 'مستشارة قانونية',
      role_en: 'Legal Consultant',
    },
    {
      name_ar: 'انار اجهوري',
      name_en: 'Anar Ajhouri',
      image: '/assets/Img/anar.avif',
      role_ar: 'محامية',
      role_en: 'Lawyer',
    },
    {
      name_ar: 'محمد الخربوش',
      name_en: 'Mohammed Al-Kharboush',
      image: '/assets/Img/mohammed-alkharboush.avif',
      role_ar: 'محامي',
      role_en: 'Lawyer',
    },
    {
      name_ar: 'عمران الباشا',
      name_en: 'Imran Al-Basha',
      image: '/assets/Img/imran-albasha.avif',
      role_ar: 'محامي',
      role_en: 'Lawyer',
    },
    {
      name_ar: 'محمد خليل',
      name_en: 'Mohammed Khalil',
      image: '/assets/Img/mohamed-khalil.avif',
      role_ar: 'مدير التسويق',
      role_en: 'Marketing Director',
    },
    {
      name_ar: 'ريناد الفايز',
      name_en: 'Rinad Al-Fayez',
      image: '',
      role_ar: 'محامية',
      role_en: 'Lawyer',
    },
    {
      name_ar: 'لجين عبدالصمد',
      name_en: 'Lujain Abdulsamad',
      image: '',
      role_ar: 'محامية',
      role_en: 'Lawyer',
    },
    {
      name_ar: 'شاهر البقمي',
      name_en: 'Shaher Al-Baqami',
      image: '',
      role_ar: 'محامي',
      role_en: 'Lawyer',
    },
    {
      name_ar: 'سعد البقمي',
      name_en: 'Saad Al-Baqami',
      image: '',
      role_ar: 'محامي',
      role_en: 'Lawyer',
    },
    {
      name_ar: 'المها الزهراني',
      name_en: 'Al-Maha Al-Zahrani',
      image: '',
      role_ar: 'محامية',
      role_en: 'Lawyer',
    },
    {
      name_ar: 'الجازي المطلق',
      name_en: 'Al-Jazi Al-Mutlaq',
      image: '',
      role_ar: 'محامي',
      role_en: 'Lawyer',
    },
    {
      name_ar: 'جشيم ادين محمد',
      name_en: 'Jashim Uddin Mohammed',
      image: '/assets/Img/jashim.avif',
      role_ar: 'Tea Boy',
      role_en: 'Tea Boy',
    }
  ];

  responsiveOptions = [
    {
      breakpoint: '2000px',
      numVisible: 6,
      numScroll: 1,
    },
    {
      breakpoint: '1600px',
      numVisible: 5,
      numScroll: 1,
    },
    {
      breakpoint: '1300px',
      numVisible: 4,
      numScroll: 1,
    },
    {
      breakpoint: '992px',
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1,
    },
  ];
}
