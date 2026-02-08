import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  hiddenCols = ['', '', '', ''];
lawyerin = signal<any[]>([
  { id: 1, name: 'أحمد محمد علي', specialty: 'قانون جنائي', license: '12345', status: 'نشط', joinDate: '2020-05-15' },
  { id: 2, name: 'سارة محمود حسن', specialty: 'قضايا أسرة', license: '67890', status: 'نشط', joinDate: '2021-02-10' },
  { id: 3, name: 'ياسين إبراهيم خليل', specialty: 'قانون تجاري', license: '11223', status: 'إجازة', joinDate: '2019-11-20' },
  { id: 4, name: 'ليلى يوسف القاضي', specialty: 'قضايا مدنية', license: '44556', status: 'نشط', joinDate: '2022-01-05' },
  { id: 4, name: 'ليلى يوسف القاضي', specialty: 'قضايا مدنية', license: '44556', status: 'نشط', joinDate: '2022-01-05' },
  { id: 4, name: 'ليلى يوسف القاضي', specialty: 'قضايا مدنية', license: '44556', status: 'نشط', joinDate: '2022-01-05' },
  { id: 5, name: 'عمر خالد المنشاوي', specialty: 'تحكيم دولي', license: '77889', status: 'موقوف مؤقتاً', joinDate: '2018-08-30' }
]);

}
