import { QuotationStatus } from './quotation';

export interface IDashboardStats {
  totalQuotations: number;
  statusBreakdown: Record<QuotationStatus, number>;
  totalRevenue: number;
  acceptedRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  recentQuotations: IDashboardQuotation[];
  monthlyTrend: IMonthlyTrend[];
  acceptanceRate: number;
  conversionRate: number;
}

export interface IDashboardQuotation {
  id: string;
  quotationNumber: string;
  title: string;
  customerName: string;
  status: QuotationStatus;
  total: number;
  createdAt: string;
}

export interface IMonthlyTrend {
  month: string;
  count: number;
  total: number;
}
