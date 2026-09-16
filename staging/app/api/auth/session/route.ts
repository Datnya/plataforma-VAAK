import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { issueCsrf, noStoreHeaders } from "@/lib/security";
import { appRole, listCompanyUsers } from "@/lib/users";

export async function GET() {
  const responseBody: Record<string, unknown> = { authenticated: false };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  if (user) {
    const { data: membership } = await admin
      .from("vaak_user_company_memberships")
      .select("company_id,role,status,access,project_scope,local_project_ids")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    const { data: profile } = await admin
      .from("vaak_profiles")
      .select("display_name,username,login_email,legacy_id,active,team,position,phone,avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (membership && profile?.active !== false) {
      responseBody.authenticated = true;
      responseBody.user = {
        id: profile?.legacy_id || `remote-${user.id}`,
        authId: user.id,
        name: profile?.display_name || profile?.login_email || "VAAK user",
        username: profile?.username,
        email: profile?.login_email,
        role: appRole(membership.role),
        active: true,
        access: membership.role === "admin" ? undefined : membership.access,
        projectScope: membership.project_scope,
        projectIds: membership.local_project_ids || [],
        team: profile?.team || undefined,
        position: profile?.position || undefined,
        phone: profile?.phone || undefined,
        profilePhoto: profile?.avatar_url || undefined,
      };
      if (membership.role === "admin") responseBody.users = await listCompanyUsers(membership.company_id);
    }
  }

  const response = NextResponse.json(responseBody, {
    status: responseBody.authenticated ? 200 : 401,
    headers: noStoreHeaders(),
  });
  responseBody.csrfToken = issueCsrf(response);
  const finalResponse = NextResponse.json(responseBody, {
    status: responseBody.authenticated ? 200 : 401,
    headers: noStoreHeaders(),
  });
  const cookie = response.headers.get("set-cookie");
  if (cookie) finalResponse.headers.set("set-cookie", cookie);
  return finalResponse;
}
