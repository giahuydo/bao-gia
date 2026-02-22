export interface IProduct {
  id: string;
  name: string;
  description?: string;
  unit: string;
  defaultPrice: number;
  category?: string;
  isActive: boolean;
  currencyId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
