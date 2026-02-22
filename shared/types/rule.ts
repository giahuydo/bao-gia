export enum RuleCategory {
  LAB = 'lab',
  BIOTECH = 'biotech',
  ICU = 'icu',
  ANALYTICAL = 'analytical',
  GENERAL = 'general',
}

export interface IRule {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith';
  value: any;
  action: 'flag' | 'reject' | 'modify';
  actionValue?: any;
  priority: number;
  message?: string;
}

export interface IRuleSet {
  id: string;
  organizationId: string;
  category: RuleCategory;
  name: string;
  description?: string;
  rules: IRule[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRuleSetRequest {
  category: RuleCategory;
  name: string;
  description?: string;
  rules: IRule[];
}

export interface EvaluateRulesRequest {
  category: RuleCategory;
  items: Array<Record<string, any>>;
}

export interface RuleEvaluationResult {
  passed: boolean;
  flagged: Array<{ item: any; rule: IRule; message: string }>;
  rejected: Array<{ item: any; rule: IRule; message: string }>;
}
