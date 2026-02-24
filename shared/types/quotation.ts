import type { ICustomer } from './customer';

export enum QuotationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum HistoryAction {
  CREATED = 'created',
  UPDATED = 'updated',
  STATUS_CHANGED = 'status_changed',
  DUPLICATED = 'duplicated',
  PDF_EXPORTED = 'pdf_exported',
  AI_EXTRACTED = 'ai_extracted',
  AI_TRANSLATED = 'ai_translated',
  NORMALIZED = 'normalized',
  EMAIL_SENT = 'email_sent',
  INGESTION_FAILED = 'ingestion_failed',
  VERSION_CREATED = 'version_created',
  REVIEW_REQUESTED = 'review_requested',
  REVIEW_APPROVED = 'review_approved',
  REVIEW_REJECTED = 'review_rejected',
  COMPARISON_RUN = 'comparison_run',
}

export interface IQuotationItem {
  id: string;
  quotationId: string;
  productId?: string;
  name: string;
  description?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  sortOrder: number;
}

export interface IQuotation {
  id: string;
  quotationNumber: string;
  title: string;
  customerId: string;
  customer?: ICustomer;
  status: QuotationStatus;
  validUntil?: string;
  notes?: string;
  terms?: string;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
  currencyId?: string;
  templateId?: string;
  createdBy: string;
  organizationId?: string;
  items: IQuotationItem[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface IQuotationHistory {
  id: string;
  quotationId: string;
  action: HistoryAction;
  changes?: Record<string, unknown>;
  note?: string;
  performedBy: string;
  createdAt: string;
}

export interface IAttachment {
  id: string;
  quotationId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  uploadedBy: string;
  createdAt: string;
}
