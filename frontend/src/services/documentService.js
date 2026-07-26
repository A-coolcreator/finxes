import { apiClient } from "./api.js";

export const documentService = {
  listDocuments: (caseId) => apiClient.get(`/cases/${caseId}/documents`),
  getExtractedRows: (caseId) => apiClient.get(`/cases/${caseId}/rows`),
  getGeneratedCsv: (caseId) => apiClient.get(`/cases/${caseId}/csv`),
};
