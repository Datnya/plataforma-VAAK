export type AppRole = "admin" | "worker" | "client";

export type AuthorizationContext = {
  role: AppRole;
  companyId: string;
  projectIds: string[];
  grantedDocumentIds?: string[];
};

export function canReadProject(context: AuthorizationContext, companyId: string, projectId: string) {
  if (context.companyId !== companyId) return false;
  if (context.role === "admin") return true;
  return context.projectIds.includes(projectId);
}

export function canWriteProject(context: AuthorizationContext, companyId: string, projectId: string) {
  if (context.role === "client") return false;
  return canReadProject(context, companyId, projectId);
}

export function canReadClientDocument(context: AuthorizationContext, companyId: string, documentId: string) {
  if (context.companyId !== companyId) return false;
  if (context.role !== "client") return true;
  return Boolean(context.grantedDocumentIds?.includes(documentId));
}
