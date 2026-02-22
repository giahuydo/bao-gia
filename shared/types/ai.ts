export enum AiOperation {
  GENERATE = 'generate',
  SUGGEST = 'suggest',
  IMPROVE = 'improve',
  EXTRACT = 'extract',
  TRANSLATE = 'translate',
  COMPARE = 'compare',
}

export enum PromptType {
  EXTRACT = 'extract',
  TRANSLATE = 'translate',
  GENERATE = 'generate',
  SUGGEST = 'suggest',
  IMPROVE = 'improve',
  COMPARE = 'compare',
}

export interface IAiPromptVersion {
  id: string;
  type: PromptType;
  versionNumber: number;
  systemPrompt: string;
  userPromptTemplate: string;
  model: string;
  maxTokens: number;
  isActive: boolean;
  changeNotes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface CompareSpecsRequest {
  vendorSpec: { items: ISpecItem[] };
  customerRequirement: { items: ISpecItem[]; budget?: number };
  quotationId?: string;
}

export interface ISpecItem {
  name: string;
  description?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  category?: string;
}

export interface CompareResult {
  matches: Array<{
    vendorItemIndex: number;
    requirementItemIndex: number;
    matchScore: number;
    matchReason: string;
    priceAssessment: string;
    specComparison: {
      met: string[];
      unmet: string[];
      exceeded: string[];
    };
    gaps: string[];
    suggestions: string[];
  }>;
  unmatchedVendorItems: number[];
  unmatchedRequirements: number[];
  overallScore: number;
  summary: string;
  budgetAnalysis?: {
    totalVendorCost: number;
    budget: number;
    withinBudget: boolean;
    savings: number;
  };
}

export interface DashboardResponse {
  summary: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
  };
  timeSeries: Array<{
    date: string;
    tokens: number;
    cost: number;
    requests: number;
  }>;
  byOperation: Record<string, { requests: number; tokens: number; cost: number }>;
  byUser: Array<{ userId: string; requests: number; tokens: number; cost: number }>;
  budgetAlert?: {
    limit: number;
    used: number;
    remaining: number;
    percentUsed: number;
  };
}
