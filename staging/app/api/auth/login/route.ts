import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { allowedOrigin, issueCsrf, loginAttemptKey, noStoreHeaders, validCsrf } from "@/lib/security";

type LoginError =
  | "session_expired"
  | "missing_fields"
  | "user_not_found"
  | "user_inactive"
  | "invalid_password"
  | "no_membership"
  | "too_many_attempts"
  | "auth_rate_limited"
  | "service_unavailable";

const fail = (error: LoginError, status: number, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ ok: false, error, ...extra }, { status, headers: noStoreHeaders() });

const secondsUntil = (value: string | null | undefined) => {
  if (!value) return 0;
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 1000));
};

export async function POST(request: NextRequest) {
  if (!allowedOrigin(request) || !validCsrf(request) || !request.headers.get("content-type")?.startsWith("application/json")) {
    return fail("session_expired", 403);
  }

  let payload: { username?: string; email?: string; password?: string };
  try { payload = await request.json(); } catch { return fail("missing_fields", 400); }
  const identifier = String(payload.username || payload.email || "").trim().normalize("NFC").toLowerCase();
  const password = String(payload.password || "");
  if (!identifier || !password) return fail("missing_fields", 400);

  const admin = createAdminClient();
  const attemptKey = loginAttemptKey(request, identifier);

  // Check an existing lock first, without counting this request as another attempt.
  const { data: lock, error: lockError } = await admin
    .from("vaak_auth_rate_limits")
    .select("blocked_until")
    .eq("attempt_key", attemptKey)
    .maybeSingle();
  if (lockError) return fail("service_unavailable", 503);
  const lockedFor = secondsUntil(lock?.blocked_until);
  if (lockedFor > 0) return fail("too_many_attempts", 429, { retryAfterSeconds: lockedFor });

  // Only genuine failures (unknown user or wrong password) count toward the lock.
  const recordFailure = async () => {
    const { data: rows, error } = await admin.rpc("vaak_check_login_rate_limit", { p_attempt_key: attemptKey, p_success: false });
    if (error) return null;
    const row = Array.isArray(rows) ? rows[0] : rows;
    return row?.allowed === false ? Number(row.retry_after_seconds) || 900 : 0;
  };

  const profileQuery = admin.from("vaak_profiles").select("id,login_email,active").limit(1);
  const { data: profile, error: profileError } = identifier.includes("@")
    ? await profileQuery.eq("login_email", identifier).maybeSingle()
    : await profileQuery.eq("username", identifier).maybeSingle();
  if (profileError) return fail("service_unavailable", 503);
  if (!profile?.login_email) {
    const retry = await recordFailure();
    if (retry) return fail("too_many_attempts", 429, { retryAfterSeconds: retry });
    return fail("user_not_found", 401);
  }
  if (profile.active === false) return fail("user_inactive", 403);

  const supabase = await createClient();
  const { data: signIn, error } = await supabase.auth.signInWithPassword({ email: profile.login_email, password });
  if (error || !signIn.user) {
    if (error?.status === 429 || error?.code === "over_request_rate_limit") return fail("auth_rate_limited", 429, { retryAfterSeconds: 60 });
    if (!error || error.code === "invalid_credentials" || error.status === 400) {
      const retry = await recordFailure();
      if (retry) return fail("too_many_attempts", 429, { retryAfterSeconds: retry });
      return fail("invalid_password", 401);
    }
    return fail("service_unavailable", 503);
  }

  const { data: membership } = await admin
    .from("vaak_user_company_memberships")
    .select("id")
    .eq("user_id", signIn.user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  if (!membership) {
    await supabase.auth.signOut();
    return fail("no_membership", 403);
  }

  await admin.rpc("vaak_check_login_rate_limit", { p_attempt_key: attemptKey, p_success: true });
  const response = NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
  response.headers.set("x-vaak-csrf", issueCsrf(response));
  return response;
}
