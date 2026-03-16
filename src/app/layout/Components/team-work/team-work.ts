import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-team-work',
  standalone: false,
  templateUrl: './team-work.html',
  styleUrl: './team-work.scss',
})
export class TeamWork{
  
  teamMembers = [
    {
      name: 'د سعد البقمي',
      image: '/assets/Img/المؤسس والرئيس التنفيذي دسعد البقمي.jpeg',
      role: 'المؤسس والرئيس التنفيذي',
    },
    {
      name: 'دكتور عبد الرحمن',
      image: '/assets/Img/دكتور عبد الرحمن.jpeg',
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
      role: 'محامية',
    },
    {
      name: 'عفاف الخشرمي',
      image: '/assets/Img/عفاف الخشرمي.jpeg',
      role: 'مستشارة قانونية',
    },
    {
      name: 'نور عز الدين',
      image: '/assets/Img/نور عز الدين.jpeg',
      role: 'محامية',
    },
    {
      name: 'انار',
      image: '/assets/Img/انار.jpeg',
      role: 'مساعد قانوني',
    },
    {
      name: 'جشيم',
      image: '/assets/Img/جشيم.jpeg',
      role: 'مساعد إداري',
    },
    {
      name: 'محمد الخربوش',
      image: '/assets/Img/محمد الخربوش.jpeg',
      role: 'محامي',
    },
    {
      name: 'عمران الباشا',
      image: '/assets/Img/عمران الباشا.jpeg',
      role: 'مترجم قانوني',
    },
    {
      name: 'محمد خليل',
      image: '/assets/Img/mohamed-khalil.png',
      role: 'مهندس برمجيات',
    },
  ];


}
