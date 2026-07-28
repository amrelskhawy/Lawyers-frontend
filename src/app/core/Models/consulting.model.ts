export interface IConsultingRecord {
  id: string;
  customerId: string | null;
  clientName: string;
  date: string;
  value: string | number;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface IConsultingSummary {
  count: number;
  total: number;
}
