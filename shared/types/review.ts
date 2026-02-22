export enum ReviewType {
  INGESTION = 'ingestion',
  STATUS_CHANGE = 'status_change',
  PRICE_OVERRIDE = 'price_override',
  COMPARISON = 'comparison',
}

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVISION_REQUESTED = 'revision_requested',
}

export interface IReviewRequest {
  id: string;
  organizationId: string;
  type: ReviewType;
  status: ReviewStatus;
  quotationId?: string;
  jobId?: string;
  payload: Record<string, any>;
  proposedData?: Record<string, any>;
  reviewerNotes?: string;
  reviewerChanges?: Record<string, any>;
  requestedBy: string;
  assignedTo?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  type: ReviewType;
  quotationId?: string;
  jobId?: string;
  payload: Record<string, any>;
  proposedData?: Record<string, any>;
  assignedTo?: string;
}

export interface ApproveReviewRequest {
  reviewerNotes?: string;
  reviewerChanges?: Record<string, any>;
}

export interface RejectReviewRequest {
  reviewerNotes: string;
}
