import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { allowedOrigin, noStoreHeaders, validCsrf } from "@/lib/security";
import { databaseRole, requireRemoteAdmin } from "@/lib/users";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStoreHeaders() });

async function targetByLegacyId(legacyId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("vaak_profiles").select("id,login_email").eq("legacy_id", legacyId).maybeSingle();
  return data;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!allowedOrigin(request) || !validCsrf(request)) return json({ ok: false }, 403);
  const actor = await requireRemoteAdmin();
  if (!actor) return json({ ok: false }, 403);
  const { id } = await context.params;
  const target = await targetByLegacyId(decodeURIComponent(id));
  if (!target) return json({ ok: false }, 404);
  let body: any;
  try { body = await request.json(); } catch { return json({ ok: false }, 400); }
  if (target.id === actor.user.id && body.active === false) return json({ ok: false, error: "cannot_disable_self" }, 409);

  const admin = createAdminClient();
  const profilePatch: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) profilePatch.display_name = body.name.trim();
  if (typeof body.username === "string" && body.username.trim()) profilePatch.username = body.username.trim().toLowerCase();
  if (typeof body.email === "string" && body.email.trim()) profilePatch.login_email = body.email.trim().toLowerCase();
  for (const key of ["team","position","phone"] as const) if (typeof body[key] === "string") profilePatch[key] = body[key].trim() || null;
  if (typeof body.active === "boolean") profilePatch.active = body.active;

  if (Object.keys(profilePatch).length) {
    const { error } = await admin.from("vaak_profiles").update(profilePatch).eq("id", target.id);
    if (error) return json({ ok: false, error: "identity_conflict" }, 409);
  }
  if (typeof body.email === "string" || (typeof body.password === "string" && body.password.length >= 8)) {
    const { error } = await admin.auth.admin.updateUserById(target.id, {
      ...(typeof body.email === "string" ? { email: body.email.trim().toLowerCase(), email_confirm: true } : {}),
      ...(typeof body.password === "string" && body.password.length >= 8 ? { password: body.password } : {}),
    });
    if (error) return json({ ok: false, error: "auth_update_failed" }, 409);
  }
  const membershipPatch: Record<string, unknown> = {};
  if (["Admin","Worker","Client"].includes(body.role)) membershipPatch.role = databaseRole(body.role);
  if (typeof body.active === "boolean") membershipPatch.status = body.active ? "active" : "disabled";
  if (body.access) membershipPatch.access = body.access;
  if (body.projectScope) membershipPatch.project_scope = body.projectScope === "all" ? "all" : "selected";
  if (Array.isArray(body.projectIds)) membershipPatch.local_project_ids = body.projectIds;
  if (Object.keys(membershipPatch).length) {
    const { error } = await admin.from("vaak_user_company_memberships").update(membershipPatch).eq("user_id", target.id).eq("company_id", actor.companyId);
    if (error) return json({ ok: false, error: error.message.includes("last_active_admin") ? "last_active_admin" : "membership_update_failed" }, 409);
  }
  await admin.from("vaak_audit_events").insert({ company_id: actor.companyId, actor_user_id: actor.user.id, action: "user.updated", resource_type: "user", resource_id: target.id });
  return json({ ok: true });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!allowedOrigin(request) || !validCsrf(request)) return json({ ok: false }, 403);
  const actor = await requireRemoteAdmin();
  if (!actor) return json({ ok: false }, 403);
  const { id } = await context.params;
  const target = await targetByLegacyId(decodeURIComponent(id));
  if (!target) return json({ ok: false }, 404);
  if (target.id === actor.user.id) return json({ ok: false, error: "cannot_delete_self" }, 409);
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(target.id);
  if (error) return json({ ok: false, error: error.message.includes("last_active_admin") ? "last_active_admin" : "delete_failed" }, 409);
  return json({ ok: true });
}
