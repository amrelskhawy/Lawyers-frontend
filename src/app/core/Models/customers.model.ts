export interface ICustomers {
  success: boolean;
  message: string;
  data: IDataCustomer;
}

export interface IDataCustomer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
