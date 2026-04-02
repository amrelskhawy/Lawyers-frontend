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
      name: 'د سعد البقمي',
      image: '/assets/Img/المؤسس والرئيس التنفيذي دسعد البقمي.avif',
      role: 'المؤسس والرئيس التنفيذي',
    },
    {
      name: 'دكتور عبد الرحمن',
      image: '/assets/Img/دكتور عبد الرحمن.avif',
      role: 'مستشار قانوني',
    },
    {
      name: 'سعد الحارثي',
      image: '/assets/Img/سعد الحارثي.avif',
      role: 'محامي',
    },
    {
      name: 'حلا البلبيسي',
      image: '/assets/Img/حلا البلبيسي.avif',
      role: 'محامية',
    },
    {
      name: 'عفاف الخشرمي',
      image: '/assets/Img/عفاف الخشرمي.avif',
      role: 'مستشارة قانونية',
    },
    {
      name: 'نور عز الدين',
      image: '/assets/Img/نور عز الدين.avif',
      role: 'محامية',
    },
    {
      name: 'انار',
      image: '/assets/Img/انار.avif',
      role: 'مساعد قانوني',
    },
    {
      name: 'جشيم',
      image: '/assets/Img/جشيم.avif',
      role: 'مساعد إداري',
    },
    {
      name: 'محمد الخربوش',
      image: '/assets/Img/محمد الخربوش.avif',
      role: 'محامي',
    },
    {
      name: 'عمران الباشا',
      image: '/assets/Img/عمران الباشا.avif',
      role: 'مترجم قانوني',
    },
    {
      name: 'محمد خليل',
      image: '/assets/Img/mohamed-khalil.avif',
      role: 'مهندس برمجيات',
    },
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
