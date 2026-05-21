import { Component, Input, computed, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const PAGE2_DEFAULT = `<p>2 . جميع الأتعاب المدفوعة تعتبر مقابل الأعمال المنجزة وغير قابلة للاسترداد.</p><p>3 . يتحمل الطرف الثاني الرسوم القضائية، والمصاريف الحكومية، ورسوم الغرف التجارية، وأي مصاريف إدارية لازمة لسير الإجراءات.</p><p>4 . في حال كانت القضية خارج المنطقة الغربية، يتحمل الطرف الثاني تكاليف الإقامة والمعيشة والانتقالات الخاصة بالمحامي أو فريق العمل الميداني، على أن يتم إخطار الطرف الثاني بالمبالغ التقديرية قبل الانتقال وذلك وفق اتفاق منفصل.</p><p>5 . يتحمل الطرف الثاني رسوم الترجمة المعتمدة لأي مستندات أو مراسلات تستلزم ذلك.</p><p>6 . في حال إحالة القضية إلى الخبراء من قبل الجهة القضائية أو بناءً على مقتضى الإجراءات النظامية، يلتزم الطرف الثاني، بدفع كامل تكاليف ومصاريف الخبراء المعتمدين فور طلبها، ويشمل ذلك أتعاب الخبرة، وتكاليف الانتقال إن وجدت، وأي رسوم إدارية ذات صلة، دون أن يتحمل الطرف الأول أي مسؤولية مالية عنها.</p><p><strong>البند الثالث - التزامات الطرف الأول -:</strong></p><p>.1 تقديم الخدمات القانونية المتفق عليها بكفاءة واحترافية.</p><p>.2 اطلاع الطرف الثاني على أهم المستجدات القانونية.</p><p>.3 الحفاظ على سرية جميع المعلومات.</p><p>.4 العمل لمصلحة الطرف الثاني في كافة أنواع الدعاوى المتفق عليها، وكذلك مراجعة الجهات الحكومية والشرطية والنيابة العامة والجهات التي تستلزم الأعمال مراجعتها كافة.</p><p>.5 بذل عناية الرجل الحريص لتحقيق مصلحة الطرف الثاني، كذلك مطالب ببذل عناية وليس تحقيق غاية وله في ذلك أن يسلك الطرق النظامية من إقامة دعاوى وتقديم بلاغات أو تواصل مع الخصم ... الخ.</p>`;

const PAGE3_DEFAULT = `<p><strong>البند الرابع – التزامات الطرف الثاني-:</strong></p><p>.1 تزويد الطرف الأول بجميع المستندات والبيانات المطلوبة بدقة وفي الوقت المحدد.</p><p>أ- يقر الطرف الثاني الموكل بأن المعلومات التي قدمها للطرف الأول صحيحة ويتحمل كافة مسؤوليتها القانونية بما في ذلك العناوين والأرقام والأسماء والموقع ويتحمل ما يترتب على عدم دقة البيانات من تأخير لسير العمل وهدر الجهد والوقت.</p><p>ب- يقر الطرف الثاني بأن كافة الأوراق والمستندات التي يقدمها عبارة عن صور لا يطالب الطرف الأول بردها للموكل وأن اية صورة للمستندات والوثائق التي يلزم تقديمها للجهات المختصة سيقوم بإحضارها ولا يتحمل الطرف الأول مسؤوليتها.</p><p>.2 التعاون التام مع الطرف الأول، وعدم تعيين أي محامٍ آخر في نفس القضية دون موافقة خطية منه.</p><p>.3 في حالة قيام الطرف الثاني بالغاء الوكالة الممنوحة لطرف الأول في أي مرحلة من مراحل الدعوى بالإرادة المنفردة تعتبر جميع اتعاب الطرف الأول المالية حاله وواجبة السداد في حينه.</p><p><strong>البند الخامس</strong></p><p>يتكون هذا العقد من ورقتين، يتضمن خمسة بنود رئيسية بالإضافة إلى التمهيد، ويُعتبر كل منها مكملاً ومفسراً للآخر، وقع من نسختين أصليتين، ولا يُعتد بأي تعديل أو إضافة ما لم يكن مكتوباً وموقعاً من الطرفين.</p>`;

function isEffectivelyEmptyHtml(html: string | null | undefined): boolean {
  if (!html) return true;
  const stripped = html
    .replace(/<\s*br\s*\/?\s*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, '')
    .replace(/\s+/g, '');
  return stripped.length === 0;
}

export interface LawyerFeesContractPreviewData {
  contractNumber?:    string | null;
  contractDay?:       string | null;
  contractDate?:      string | Date | null;
  hijriDate?:         string | null;

  clientName?:        string | null;
  clientIdNumber?:    string | null;
  clientPhone?:       string | null;

  serviceDescription?: string | null;

  totalFees?:              string | number | null;
  firstInstallment?:       string | number | null;
  firstInstallmentNote?:   string | null;
  secondInstallment?:      string | number | null;
  otherFees?:         string | null;
  currency?:          string | null;
  page2Content?:      string | null;
  page3Content?:      string | null;

  firstPartySignature?:  string | null;
  secondPartySignature?: string | null;
  secondPartySignedAt?:  string | Date | null;
}

@Component({
  selector: 'app-lawyer-fees-contract-preview',
  standalone: false,
  templateUrl: './lawyer-fees-contract-preview.html',
  styleUrl: './lawyer-fees-contract-preview.scss',
})
export class LawyerFeesContractPreview {
  constructor(private sanitizer: DomSanitizer) {}

  data = signal<LawyerFeesContractPreviewData>({});

  @Input() set value(v: LawyerFeesContractPreviewData | null | undefined) {
    this.data.set(v ?? {});
  }

  page2Html = computed<SafeHtml>(() => {
    const v = this.data().page2Content;
    const html = isEffectivelyEmptyHtml(v) ? PAGE2_DEFAULT : (v as string);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  page3Html = computed<SafeHtml>(() => {
    const v = this.data().page3Content;
    const html = isEffectivelyEmptyHtml(v) ? PAGE3_DEFAULT : (v as string);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  formattedDate(value: string | Date | null | undefined): string {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}/${month}/${day}`;
  }

  amount(v: string | number | null | undefined): string {
    if (v === null || v === undefined || v === '') return '';
    const n = Number(v);
    return isNaN(n) ? String(v) : n.toLocaleString('en-US');
  }
}
