export interface IGlossaryTerm {
  id: string;
  organizationId: string;
  sourceTerm: string;
  targetTerm: string;
  sourceLanguage: string;
  targetLanguage: string;
  category?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGlossaryTermRequest {
  sourceTerm: string;
  targetTerm: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  category?: string;
}

export interface ImportGlossaryRequest {
  terms: Array<{
    sourceTerm: string;
    targetTerm: string;
    category?: string;
  }>;
}
