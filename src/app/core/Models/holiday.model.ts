export interface IresHoliday {
  success: true;
  message: 'Holidays retrieved';
  data: IHoliday[];
}

export interface IHoliday {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  isFullDay: boolean;
}
