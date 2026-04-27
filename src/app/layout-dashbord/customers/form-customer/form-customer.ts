import { Data } from './../../../core/Servies/data';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface Country {
  name: string;
  code: string;
  flag: string;
  example: string;
}

export const COUNTRIES: Country[] = [
  { name: 'السعودية', code: '966', flag: '🇸🇦', example: '5XXXXXXXX' },
  { name: 'الإمارات', code: '971', flag: '🇦🇪', example: '5XXXXXXXX' },
  { name: 'الكويت', code: '965', flag: '🇰🇼', example: '5XXXXXXXX' },
  { name: 'قطر', code: '974', flag: '🇶🇦', example: '3XXXXXXX' },
  { name: 'البحرين', code: '973', flag: '🇧🇭', example: '3XXXXXXX' },
  { name: 'عُمان', code: '968', flag: '🇴🇲', example: '9XXXXXXX' },
  { name: 'الأردن', code: '962', flag: '🇯🇴', example: '7XXXXXXXX' },
  { name: 'مصر', code: '20', flag: '🇪🇬', example: '1XXXXXXXXX' },
  { name: 'العراق', code: '964', flag: '🇮🇶', example: '7XXXXXXXXX' },
  { name: 'سوريا', code: '963', flag: '🇸🇾', example: '9XXXXXXXX' },
  { name: 'لبنان', code: '961', flag: '🇱🇧', example: '7XXXXXXX' },
  { name: 'اليمن', code: '967', flag: '🇾🇪', example: '7XXXXXXXX' },
  { name: 'ليبيا', code: '218', flag: '🇱🇾', example: '9XXXXXXXX' },
  { name: 'تونس', code: '216', flag: '🇹🇳', example: '2XXXXXXX' },
  { name: 'الجزائر', code: '213', flag: '🇩🇿', example: '5XXXXXXXX' },
  { name: 'المغرب', code: '212', flag: '🇲🇦', example: '6XXXXXXXX' },
  { name: 'السودان', code: '249', flag: '🇸🇩', example: '9XXXXXXXX' },
  { name: 'الصومال', code: '252', flag: '🇸🇴', example: '6XXXXXXX' },
  { name: 'موريتانيا', code: '222', flag: '🇲🇷', example: '2XXXXXXX' },
  { name: 'تركيا', code: '90', flag: '🇹🇷', example: '5XXXXXXXXX' },
  { name: 'باكستان', code: '92', flag: '🇵🇰', example: '3XXXXXXXXX' },
  { name: 'الهند', code: '91', flag: '🇮🇳', example: '9XXXXXXXXX' },
  { name: 'بنغلاديش', code: '880', flag: '🇧🇩', example: '1XXXXXXXXX' },
  { name: 'إندونيسيا', code: '62', flag: '🇮🇩', example: '8XXXXXXXXX' },
  { name: 'ماليزيا', code: '60', flag: '🇲🇾', example: '1XXXXXXXX' },
  { name: 'الفلبين', code: '63', flag: '🇵🇭', example: '9XXXXXXXXX' },
  { name: 'إيران', code: '98', flag: '🇮🇷', example: '9XXXXXXXXX' },
  { name: 'أفغانستان', code: '93', flag: '🇦🇫', example: '7XXXXXXXX' },
  { name: 'المملكة المتحدة', code: '44', flag: '🇬🇧', example: '7XXXXXXXXX' },
  { name: 'فرنسا', code: '33', flag: '🇫🇷', example: '6XXXXXXXX' },
  { name: 'ألمانيا', code: '49', flag: '🇩🇪', example: '15XXXXXXXXX' },
  { name: 'الولايات المتحدة', code: '1', flag: '🇺🇸', example: 'XXXXXXXXXX' },
  { name: 'كندا', code: '1', flag: '🇨🇦', example: 'XXXXXXXXXX' },
  { name: 'أستراليا', code: '61', flag: '🇦🇺', example: '4XXXXXXXX' },
  { name: 'روسيا', code: '7', flag: '🇷🇺', example: '9XXXXXXXXX' },
  { name: 'الصين', code: '86', flag: '🇨🇳', example: '1XXXXXXXXXX' },
  { name: 'إيطاليا', code: '39', flag: '🇮🇹', example: '3XXXXXXXXX' },
  { name: 'إسبانيا', code: '34', flag: '🇪🇸', example: '6XXXXXXXX' },
  { name: 'هولندا', code: '31', flag: '🇳🇱', example: '6XXXXXXXX' },
  { name: 'بلجيكا', code: '32', flag: '🇧🇪', example: '4XXXXXXXX' },
  { name: 'السويد', code: '46', flag: '🇸🇪', example: '7XXXXXXXX' },
  { name: 'النرويج', code: '47', flag: '🇳🇴', example: '9XXXXXXX' },
  { name: 'الدنمارك', code: '45', flag: '🇩🇰', example: 'XXXXXXXX' },
  { name: 'سويسرا', code: '41', flag: '🇨🇭', example: '7XXXXXXXX' },
  { name: 'النمسا', code: '43', flag: '🇦🇹', example: '6XXXXXXXX' },
  { name: 'اليونان', code: '30', flag: '🇬🇷', example: '6XXXXXXXXX' },
  { name: 'البرتغال', code: '351', flag: '🇵🇹', example: '9XXXXXXXX' },
  { name: 'بولندا', code: '48', flag: '🇵🇱', example: '5XXXXXXXX' },
  { name: 'رومانيا', code: '40', flag: '🇷🇴', example: '7XXXXXXXX' },
  { name: 'أوكرانيا', code: '380', flag: '🇺🇦', example: '9XXXXXXXXX' },
  { name: 'البرازيل', code: '55', flag: '🇧🇷', example: '9XXXXXXXXX' },
  { name: 'المكسيك', code: '52', flag: '🇲🇽', example: '1XXXXXXXXXX' },
  { name: 'الأرجنتين', code: '54', flag: '🇦🇷', example: '9XXXXXXXXX' },
  { name: 'كولومبيا', code: '57', flag: '🇨🇴', example: '3XXXXXXXXX' },
  { name: 'جنوب أفريقيا', code: '27', flag: '🇿🇦', example: '6XXXXXXXX' },
  { name: 'نيجيريا', code: '234', flag: '🇳🇬', example: '8XXXXXXXXX' },
  { name: 'كينيا', code: '254', flag: '🇰🇪', example: '7XXXXXXXX' },
  { name: 'إثيوبيا', code: '251', flag: '🇪🇹', example: '9XXXXXXXX' },
  { name: 'غانا', code: '233', flag: '🇬🇭', example: '2XXXXXXXXX' },
  { name: 'اليابان', code: '81', flag: '🇯🇵', example: '9XXXXXXXXX' },
  { name: 'كوريا الجنوبية', code: '82', flag: '🇰🇷', example: '1XXXXXXXXX' },
];

@Component({
  selector: 'app-form-customer',
  standalone: false,
  templateUrl: './form-customer.html',
  styleUrl: './form-customer.scss',
})
export class FormCustomer {
  constructor(
    private FB: FormBuilder,
    private Data: Data,
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() ResSuccess = new EventEmitter<boolean>();
  Form = signal<FormGroup>(new FormGroup({}));
  objData = signal<any>(null);

  countries = COUNTRIES;
  selectedCountry: Country = COUNTRIES[0];

  @Input()
  set objdata(value: any) {
    if (!value) {
      this.Form().reset();
      this.selectedCountry = COUNTRIES[0];
      return;
    }
    this.objData.set(value);
    const detected = this.detectCountry(value.phone);
    this.selectedCountry = detected.country;
    this.Form().patchValue({
      fullName: value.fullName,
      email: value.email,
      phone: detected.localNumber,
      location: value.location,
    });
  }

  private detectCountry(phone: string): { country: Country; localNumber: string } {
    if (!phone) return { country: COUNTRIES[0], localNumber: phone };
    const sorted = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);
    for (const c of sorted) {
      if (phone.startsWith(c.code)) {
        return { country: c, localNumber: phone.slice(c.code.length) };
      }
    }
    return { country: COUNTRIES[0], localNumber: phone };
  }

  onClose() {
    this.visible = false;
    this.Form().reset();
    this.objData.set(null);
    this.selectedCountry = COUNTRIES[0];
    this.visibleChange.emit(false);
  }

  closeDialog() {
    this.visible = false;
    this.objData.set(null);
    this.Form().reset();
    this.selectedCountry = COUNTRIES[0];
  }

  createForm() {
    this.Form.set(
      this.FB.group({
        fullName: ['', Validators.required],
        email: ['', [Validators.email]],
        phone: ['', Validators.required],
        location: [''],
      }),
    );
  }

  onSubmitData() {
    if (this.Form().invalid) {
      this.Form().markAllAsTouched();
      return;
    }
    const formValue = { ...this.Form().value };
    formValue.phone = this.selectedCountry.code + formValue.phone;
    if (!formValue.email) {
      delete formValue.email;
    }
    if (!this.objData()?.id) {
      this.Data.post('customers', formValue).subscribe((res) => {
        this.HandelResponseSuccess();
      });
    } else {
      this.Data.put(`customers/${this.objData().id}`, formValue).subscribe((res) => {
        this.HandelResponseSuccess();
      });
    }
  }

  HandelResponseSuccess() {
    this.Form().reset();
    this.selectedCountry = COUNTRIES[0];
    this.ResSuccess.emit(true);
  }

  getControlName(controlName: string) {
    return this.Form().get(controlName);
  }
}
