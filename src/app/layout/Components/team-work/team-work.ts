import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-team-work',
  standalone: false,
  templateUrl: './team-work.html',
  styleUrl: './team-work.scss',
})
export class TeamWork implements OnInit {
  teamMembers = [
    {
      name: 'دكتور سعد البقمي',
      image: '/assets/Img/المؤسس والرئيس التنفيذي دسعد البقمي.jpeg',
      role: 'المؤسس والرئيس التنفيذي',
    },
    {
      name: 'دكتور ناصر البقمي',
      image: '',
      role: 'المدير العام',
    },
    {
      name: 'دكتور عبد الرحمن المرلى',
      image: '/assets/Img/دكتور عبد الرحمن.jpeg',
      role: 'مستشار قانوني',
    },
    {
      name: 'فتحي عبد الجليل',
      image: '',
      role: 'مستشار قانوني',
    },
    {
      name: 'سعد الحارثي',
      image: '/assets/Img/سعد الحارثي.jpeg',
      role: 'محامي',
    },
    {
      name: 'حلا البلبيسي',
      image: '/assets/Img/حلا البلبيسي.jpeg',
      role: 'مستشارة قانونية',
    },
    {
      name: 'عفاف الخشرمي',
      image: '/assets/Img/عفاف الخشرمي.jpeg',
      role: 'محامية',
    },
    {
      name: 'نور عز الدين',
      image: '/assets/Img/نور عز الدين.jpeg',
      role: 'مستشارة قانونية',
    },
    {
      name: 'انار اجهوري',
      image: '/assets/Img/انار.jpeg',
      role: 'محامية',
    },
    {
      name: 'محمد الخربوش',
      image: '/assets/Img/محمد الخربوش.jpeg',
      role: 'محامي',
    },
    {
      name: 'عمران الباشا',
      image: '/assets/Img/عمران الباشا.jpeg',
      role: 'محامي',
    },
    {
      name: 'محمد خليل',
      image: '/assets/Img/mohamed-khalil.png',
      role: 'مدير التسويق',
    },
    {
      name: 'ريناد الفايز',
      image: '',
      role: 'محامية',
    },
    {
      name: 'لجين عبدالصمد',
      image: '',
      role: 'محامية',
    },
    {
      name: 'شاهر البقمي',
      image: '',
      role: 'محامي',
    },
    {
      name: 'سعد البقمي',
      image: '',
      role: 'محامي',
    },
    {
      name: 'المها الزهراني',
      image: '',
      role: 'محامية',
    },
    {
      name: 'الجازي المطلق',
      image: '',
      role: 'محامي',
    },
    {
      name: "جشيم ادين محمد",
      image: '/assets/Img/جشيم.jpeg',
      role: 'Tea Boy',
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

  ngOnInit() { }
}
