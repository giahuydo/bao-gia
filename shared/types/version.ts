export interface IQuotationVersion {
  id: string;
  quotationId: string;
  versionNumber: number;
  label?: string;
  snapshot: Record<string, any>;
  changeSummary?: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateVersionRequest {
  label?: string;
  changeSummary?: string;
}

export interface VersionDiff {
  items: {
    added: Array<{ index: number; item: any }>;
    removed: Array<{ index: number; item: any }>;
    modified: Array<{ index: number; changes: Array<{ field: string; from: any; to: any }> }>;
  };
  totals: {
    subtotal?: { from: number; to: number };
    discount?: { from: number; to: number };
    tax?: { from: number; to: number };
    total?: { from: number; to: number };
  };
  metadata: Record<string, { from: any; to: any }>;
}
