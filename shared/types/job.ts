export enum JobStatus {
  PENDING = 'pending',
  EXTRACTING = 'extracting',
  TRANSLATING = 'translating',
  NORMALIZING = 'normalizing',
  REVIEW_PENDING = 'review_pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DEAD_LETTER = 'dead_letter',
}

export interface IIngestionJob {
  id: string;
  organizationId: string;
  attachmentId: string;
  status: JobStatus;
  currentStep?: string;
  retries: number;
  maxRetries: number;
  fileChecksum?: string;
  extractResult?: Record<string, any>;
  translateResult?: Record<string, any>;
  normalizeResult?: Record<string, any>;
  quotationId?: string;
  error?: string;
  correlationId?: string;
  customerId?: string;
  createdBy: string;
  processingTimeMs?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobRequest {
  attachmentId: string;
  customerId?: string;
}
