import { APP_CONFIG } from "../config/app.config.js";
import { apiClient } from "./api.js";

export const caseService = {
  listCases: () => apiClient.get("/cases"),
  listArchivedCases: () => apiClient.get("/archives"),
  getCaseById: (caseId) => apiClient.get(`/cases/${caseId}`),
  createCase: (payload) => apiClient.post("/cases", payload),
  updateCase: (caseId, payload) => apiClient.put(`/cases/${caseId}`, payload),
  archiveCase: (caseId) => apiClient.post(`/cases/${caseId}/archive`),
  unarchiveCase: (caseId) => apiClient.post(`/cases/${caseId}/unarchive`),
  uploadCaseDocuments: (caseId, formData) =>
    fetch(`${APP_CONFIG.apiBaseUrl}/cases/${caseId}/documents`, {
      method: "POST",
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    }),
  uploadCaseDocumentsJson: (caseId, payload) => apiClient.post(`/cases/${caseId}/documents`, payload),
  getTransactions: (caseId) => apiClient.get(`/cases/${caseId}/transactions`),
  getPersons: (caseId) => apiClient.get(`/cases/${caseId}/persons`),
  deleteCase: (caseId) => apiClient.delete(`/cases/${caseId}`),
  toggleTransactionFlag: (txId) => apiClient.post(`/transactions/${txId}/toggle-flag`),
};

