export enum PriceMonitoringJobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIAL = 'partial',
}

export enum PriceAlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum PriceMonitoringTriggerType {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
}

export interface IPriceMonitoringJob {
  id: string;
  organizationId: string;
  status: PriceMonitoringJobStatus;
  triggerType: PriceMonitoringTriggerType;
  triggeredBy?: string;
  totalProducts: number;
  processedProducts: number;
  alertCount: number;
  n8nExecutionId?: string;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPriceRecord {
  id: string;
  jobId: string;
  productId: string;
  productName: string;
  previousPrice: number;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  currencyCode: string;
  source?: string;
  fetchedAt: string;
}

export interface IPriceAlert {
  id: string;
  organizationId: string;
  jobId: string;
  productId: string;
  productName?: string;
  severity: PriceAlertSeverity;
  previousPrice: number;
  currentPrice: number;
  priceChangePercent: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface TriggerMonitoringRequest {
  productIds?: string[];
}

export interface PriceMonitoringCallbackPayload {
  jobId: string;
  executionId: string;
  status: 'completed' | 'failed' | 'partial';
  results?: Array<{
    productId: string;
    productName: string;
    previousPrice: number;
    currentPrice: number;
    currencyCode: string;
    source?: string;
    fetchedAt: string;
  }>;
  error?: string;
  processingTimeMs?: number;
}
