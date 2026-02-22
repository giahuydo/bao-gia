import { QuotationStatus } from '../types/quotation';

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  [QuotationStatus.DRAFT]: 'Draft',
  [QuotationStatus.SENT]: 'Sent',
  [QuotationStatus.ACCEPTED]: 'Accepted',
  [QuotationStatus.REJECTED]: 'Rejected',
  [QuotationStatus.EXPIRED]: 'Expired',
};

export const QUOTATION_STATUS_OPTIONS = Object.entries(QUOTATION_STATUS_LABELS).map(
  ([value, label]) => ({ value: value as QuotationStatus, label }),
);
