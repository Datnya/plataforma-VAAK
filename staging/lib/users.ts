import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type RemoteRole = "Admin" | "Worker" | "Client";

export async function requireRemoteAdmin() {
  const sessionClient = await createClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data: membership } = await admin
    .from("vaak_user_company_memberships")
    .select("company_id,role,status")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  return membership ? { user, companyId: membership.company_id as string } : null;
}

export function appRole(role: string): RemoteRole {
  return role === "admin" ? "Admin" : role === "client" ? "Client" : "Worker";
}

export function databaseRole(role: string) {
  return role === "Admin" ? "admin" : role === "Client" ? "client" : "worker";
}

export async function listCompanyUsers(companyId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("vaak_user_company_memberships")
    .select("user_id,role,status,access,project_scope,local_project_ids,profiles:vaak_profiles!inner(display_name,username,login_email,legacy_id,active,team,position,phone)")
    .eq("company_id", companyId)
    .order("created_at");
  if (error) throw error;
  return (data || []).map((row: any) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: profile.legacy_id || `remote-${row.user_id}`,
      authId: row.user_id,
      name: profile.display_name,
      username: profile.username,
      email: profile.login_email,
      role: appRole(row.role),
      active: row.status === "active" && profile.active !== false,
      access: row.role === "admin" ? undefined : row.access,
      projectScope: row.project_scope,
      projectIds: row.local_project_ids || [],
      team: profile.team || undefined,
      position: profile.position || undefined,
      phone: profile.phone || undefined,
    };
  });
}
