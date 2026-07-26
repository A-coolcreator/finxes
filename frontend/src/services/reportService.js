import { apiClient } from "./api.js";

export const reportService = {
  getDashboardSummary: () => apiClient.get("/dashboard/summary"),
  getCaseAnalytics: (caseId) => apiClient.get(`/cases/${caseId}/analytics`),
  getCaseTimeline: (caseId) => apiClient.get(`/cases/${caseId}/timeline`),
};
