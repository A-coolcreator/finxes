export function createDocumentModel(data = {}) {
  return {
    id: data.id ?? "",
    caseId: data.caseId ?? "",
    fileName: data.fileName ?? "",
    fileType: data.fileType ?? "pdf",
    status: data.status ?? "pending",
    uploadedAt: data.uploadedAt ?? null,
    ...data,
  };
}
