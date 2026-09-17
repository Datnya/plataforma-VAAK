import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type CompanyMember = {
  userId: string;
  companyId: string;
  role: "admin" | "worker" | "client";
  projectScope: string | null;
  projectIds: string[];
};

// Active member of a company (any role). Returns null when signed out or without membership.
export async function requireMember(): Promise<CompanyMember | null> {
  const sessionClient = await createClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return null;
  const { data } = await createAdminClient()
    .from("vaak_user_company_memberships")
    .select("company_id,role,status,project_scope,local_project_ids")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    userId: user.id,
    companyId: data.company_id as string,
    role: data.role as CompanyMember["role"],
    projectScope: (data.project_scope as string) || null,
    projectIds: Array.isArray(data.local_project_ids) ? (data.local_project_ids as string[]) : [],
  };
}

const list = (value: unknown) => (Array.isArray(value) ? value : []);

// Clients only receive the projects linked to them and the records that belong to those projects.
export function stateForMember(state: any, member: CompanyMember) {
  if (!state || member.role !== "client") return state;
  const store = state.store || {};
  const allowed = new Set(member.projectScope === "all" ? list(store.projects).map((p: any) => p?.id) : member.projectIds);
  const inProject = (item: any) => allowed.has(item?.projectId);
  return {
    version: state.version,
    store: {
      projects: list(store.projects).filter((p: any) => allowed.has(p?.id)),
      orders: list(store.orders).filter(inProject),
      specs: list(store.specs).filter(inProject),
      projectCompanies: list(store.projectCompanies).filter(inProject),
      suppliers: [],
      tasks: [],
      supplierProjectLinks: [],
    },
    extras: {},
    partial: true,
  };
}
