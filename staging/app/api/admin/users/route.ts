import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { allowedOrigin, noStoreHeaders, validCsrf } from "@/lib/security";
import { databaseRole, listCompanyUsers, requireRemoteAdmin } from "@/lib/users";

const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStoreHeaders() });
const validText = (value: unknown, max = 160) => typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;

export async function GET() {
  const actor = await requireRemoteAdmin();
  if (!actor) return reply({ ok: false }, 403);
  return reply({ ok: true, users: await listCompanyUsers(actor.companyId) });
}

export async function POST(request: NextRequest) {
  if (!allowedOrigin(request) || !validCsrf(request) || !request.headers.get("content-type")?.startsWith("application/json")) {
    return reply({ ok: false }, 403);
  }
  const actor = await requireRemoteAdmin();
  if (!actor) return reply({ ok: false }, 403);

  let body: any;
  try { body = await request.json(); } catch { return reply({ ok: false, error: "invalid_request" }, 400); }
  if (!validText(body.name) || !validText(body.username, 80) || !validText(body.email, 254) || !validText(body.password, 256) || body.password.length < 8) {
    return reply({ ok: false, error: "invalid_request" }, 400);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email) || !["Admin","Worker","Client"].includes(body.role)) {
    return reply({ ok: false, error: "invalid_request" }, 400);
  }

  const idempotencyKey = request.headers.get("idempotency-key") || body.idempotencyKey;
  if (!/^[0-9a-f-]{36}$/i.test(String(idempotencyKey || ""))) return reply({ ok: false, error: "idempotency_key_required" }, 400);

  const admin = createAdminClient();
  const normalizedUsername = body.username.trim().toLowerCase();
  const normalizedEmail = body.email.trim().toLowerCase();
  const { data: existing } = await admin
    .from("vaak_user_provisioning")
    .select("id,state,auth_user_id")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  if (existing?.state === "completed") return reply({ ok: true, id: existing.auth_user_id, replayed: true });
  if (existing && !["pending","auth_created"].includes(existing.state)) return reply({ ok: false, error: existing.state }, 409);

  const { data: byUsername } = await admin.from("vaak_profiles").select("id").eq("username", normalizedUsername).limit(1);
  const { data: byEmail } = await admin.from("vaak_profiles").select("id").eq("login_email", normalizedEmail).limit(1);
  if (byUsername?.length || byEmail?.length) return reply({ ok: false, error: "identity_exists" }, 409);

  let requestId = existing?.id as string | undefined;
  if (!requestId) {
    const { data: createdRequest, error: requestError } = await admin
      .from("vaak_user_provisioning")
      .insert({ idempotency_key: idempotencyKey, company_id: actor.companyId, actor_user_id: actor.user.id, requested_username: normalizedUsername, requested_email: normalizedEmail })
      .select("id")
      .single();
    if (requestError) return reply({ ok: false, error: "provisioning_request_failed" }, 409);
    requestId = createdRequest.id;
  }

  let authUserId = existing?.auth_user_id as string | undefined;
  try {
    if (!authUserId) {
      const legacyId = validText(body.legacyId, 100) ? body.legacyId.trim() : `u-${randomUUID()}`;
      const { data: created, error: authError } = await admin.auth.admin.createUser({
        email: normalizedEmail,
        password: body.password,
        email_confirm: true,
        user_metadata: { display_name: body.name.trim(), username: normalizedUsername, legacy_id: legacyId, locale: "en" },
      });
      if (authError || !created.user) throw new Error("auth_create_failed");
      authUserId = created.user.id;
      await admin.from("vaak_user_provisioning").update({ auth_user_id: authUserId, state: "auth_created", updated_at: new Date().toISOString() }).eq("id", requestId);
    }

    const legacyId = validText(body.legacyId, 100) ? body.legacyId.trim() : String((await admin.auth.admin.getUserById(authUserId)).data.user?.user_metadata.legacy_id || `u-${randomUUID()}`);
    const { error: finishError } = await admin.rpc("vaak_complete_user_provisioning", {
      p_request_id: requestId,
      p_auth_user_id: authUserId,
      p_display_name: body.name.trim(),
      p_username: normalizedUsername,
      p_login_email: normalizedEmail,
      p_legacy_id: legacyId,
      p_role: databaseRole(body.role),
      p_access: body.access || { version: 2, grants: {} },
      p_project_scope: body.projectScope === "all" ? "all" : "selected",
      p_local_project_ids: Array.isArray(body.projectIds) ? body.projectIds.filter((item: unknown) => validText(item, 100)) : [],
      p_team: typeof body.team === "string" ? body.team : "",
      p_position: typeof body.position === "string" ? body.position : "",
      p_phone: typeof body.phone === "string" ? body.phone : "",
    });
    if (finishError) throw new Error("profile_finalize_failed");
    return reply({ ok: true, id: legacyId }, 201);
  } catch (error) {
    await admin.from("vaak_user_provisioning").update({ state: "provisioning_failed", error_code: error instanceof Error ? error.message : "unknown", updated_at: new Date().toISOString() }).eq("id", requestId);
    if (authUserId) {
      const { error: rollbackError } = await admin.auth.admin.deleteUser(authUserId);
      await admin.from("vaak_user_provisioning").update({ state: rollbackError ? "cleanup_required" : "rolled_back", error_code: rollbackError ? "auth_rollback_failed" : "profile_finalize_failed", updated_at: new Date().toISOString() }).eq("id", requestId);
      if (rollbackError) return reply({ ok: false, error: "cleanup_required" }, 500);
    }
    return reply({ ok: false, error: "provisioning_failed" }, 500);
  }
}
