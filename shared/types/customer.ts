export interface ICustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  contactPerson?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
