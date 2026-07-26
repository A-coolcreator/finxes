export function createCaseModel(data = {}) {
  return {
    id: data.id ?? "",
    referenceNumber: data.referenceNumber ?? "",
    title: data.title ?? "",
    status: data.status ?? "draft",
    officerName: data.officerName ?? "",
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
    ...data,
  };
}
