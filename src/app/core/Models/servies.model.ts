export interface Iserves {
  success: boolean;
  message: string;
  data:IDataServies;
}

export interface IDataServies {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: string;
  isFree: boolean;
}
