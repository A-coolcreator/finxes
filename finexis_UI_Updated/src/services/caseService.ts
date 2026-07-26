import { APP_CONFIG } from "../config/app.config";
import type { CaseRecord, CreateCasePayload } from "../types/case";
import type { PersonMetadata } from "../types/person";
import { apiClient } from "./api";

export const caseService = {
  listCases: () => apiClient.get<CaseRecord[]>("/cases"),
  listArchivedCases: () => apiClient.get<CaseRecord[]>("/archives"),
  getCaseById: (caseId: string) => apiClient.get<CaseRecord>(`/cases/${caseId}`),
  createCase: (payload: CreateCasePayload) => apiClient.post<CaseRecord>("/cases", payload),
  updateCase: (caseId: string, payload: Partial<CreateCasePayload>) =>
    apiClient.put<CaseRecord>(`/cases/${caseId}`, payload),
  archiveCase: (caseId: string) => apiClient.post<CaseRecord>(`/cases/${caseId}/archive`, {}),
  unarchiveCase: (caseId: string) => apiClient.post<CaseRecord>(`/cases/${caseId}/unarchive`, {}),
  uploadCaseDocumentsJson: (caseId: string, payload: unknown) =>
    apiClient.post(`/cases/${caseId}/documents`, payload),
  getTransactions: (caseId: string) => apiClient.get(`/cases/${caseId}/transactions`),
  getPersons: (caseId: string) => apiClient.get(`/cases/${caseId}/persons`),
  getPersonMetadata: (personId: string) => apiClient.get<PersonMetadata>(`/persons/${personId}/metadata`),
  deleteCase: (caseId: string) => apiClient.delete(`/cases/${caseId}`),
  toggleTransactionFlag: (txId: string) => apiClient.post(`/transactions/${txId}/toggle-flag`, {}),
  uploadCaseDocuments: (caseId: string, formData: FormData) =>
    fetch(`${APP_CONFIG.apiBaseUrl}/cases/${caseId}/documents`, {
      method: "POST",
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    }),
};
