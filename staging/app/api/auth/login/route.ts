import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { allowedOrigin, issueCsrf, loginAttemptKey, noStoreHeaders, validCsrf } from "@/lib/security";

const genericFailure = () => NextResponse.json(
  { ok: false, error: "invalid_credentials" },
  { status: 401, headers: noStoreHeaders() },
);

export async function POST(request: NextRequest) {
  if (!allowedOrigin(request) || !validCsrf(request) || !request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders() });
  }

  let payload: { username?: string; email?: string; password?: string };
  try { payload = await request.json(); } catch { return genericFailure(); }
  const identifier = String(payload.username || payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");
  if (!identifier || !password) return genericFailure();

  const admin = createAdminClient();
  const attemptKey = loginAttemptKey(request, identifier);
  const { data: rateRows, error: rateError } = await admin.rpc("vaak_check_login_rate_limit", {
    p_attempt_key: attemptKey,
    p_success: false,
  });
  if (rateError || rateRows?.[0]?.allowed === false) {
    return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 429, headers: noStoreHeaders() });
  }

  const profileQuery = admin.from("vaak_profiles").select("id,login_email,active").limit(1);
  const { data: profile } = identifier.includes("@")
    ? await profileQuery.eq("login_email", identifier).maybeSingle()
    : await profileQuery.eq("username", identifier).maybeSingle();
  if (!profile?.login_email || profile.active === false) {
    await new Promise((resolve) => setTimeout(resolve, 220));
    return genericFailure();
  }

  const supabase = await createClient();
  const { data: signIn, error } = await supabase.auth.signInWithPassword({ email: profile.login_email, password });
  if (error || !signIn.user) return genericFailure();

  const { data: membership } = await admin
    .from("vaak_user_company_memberships")
    .select("id")
    .eq("user_id", signIn.user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  if (!membership) {
    await supabase.auth.signOut();
    return genericFailure();
  }

  await admin.rpc("vaak_check_login_rate_limit", { p_attempt_key: attemptKey, p_success: true });
  const response = NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
  response.headers.set("x-vaak-csrf", issueCsrf(response));
  return response;
}
