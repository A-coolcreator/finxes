export function createReportModel(data = {}) {
  return {
    id: data.id ?? "",
    caseId: data.caseId ?? "",
    name: data.name ?? "",
    generatedAt: data.generatedAt ?? null,
    rows: Array.isArray(data.rows) ? data.rows : [],
    ...data,
  };
}
