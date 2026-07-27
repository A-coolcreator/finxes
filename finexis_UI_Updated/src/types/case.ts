export interface CaseRecord {
  id: string;
  caseNumber: string;
  title: string;
  subtitle?: string | null;
  status: string;
  triggerCount: number;
  createdAt: string;
  updatedAt?: string;
  archivedAt?: string | null;
}

export interface CreateCasePayload {
  caseNumber: string;
  title: string;
  subtitle?: string;
  status?: string;
  files?: Array<{ filename: string; content: string }>;
  personData?: Array<{ personName: string; files: Array<{ filename: string; content: string }> }>;
}
