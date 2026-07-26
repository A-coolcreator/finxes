export interface PersonRecord {
  id: string;
  caseId: string;
  name: string;
  createdAt?: string;
}

export interface PersonMetadata {
  personId?: string;
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountType?: string;
  rawJson?: string;
}
