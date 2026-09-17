import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { allowedOrigin, noStoreHeaders, validCsrf } from "@/lib/security";
import { requireMember, stateForMember } from "@/lib/company-data";

const MAX_STATE_BYTES = 4_000_000;

// Current shared workspace. `since` lets clients skip the payload when nothing changed.
export async function GET(request: NextRequest) {
  const member = await requireMember();
  if (!member) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401, headers: noStoreHeaders() });
  const { data, error } = await createAdminClient()
    .from("vaak_company_data")
    .select("state,revision,updated_at")
    .eq("company_id", member.companyId)
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: "service_unavailable" }, { status: 503, headers: noStoreHeaders() });
  const revision = Number(data?.revision || 0);
  const since = Number(request.nextUrl.searchParams.get("since") || -1);
  if (data && since === revision) {
    return NextResponse.json({ ok: true, role: member.role, revision, unchanged: true }, { headers: noStoreHeaders() });
  }
  return NextResponse.json(
    { ok: true, role: member.role, revision, updatedAt: data?.updated_at || null, state: data ? stateForMember(data.state, member) : null },
    { headers: noStoreHeaders() },
  );
}

// Save with optimistic concurrency: the write only applies on top of `baseRevision`.
export async function PUT(request: NextRequest) {
  if (!allowedOrigin(request) || !validCsrf(request)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403, headers: noStoreHeaders() });
  }
  const member = await requireMember();
  if (!member) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401, headers: noStoreHeaders() });
  if (member.role === "client") return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403, headers: noStoreHeaders() });

  const raw = await request.text();
  if (raw.length > MAX_STATE_BYTES) return NextResponse.json({ ok: false, error: "too_large" }, { status: 413, headers: noStoreHeaders() });
  let body: any;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400, headers: noStoreHeaders() }); }
  const baseRevision = Number(body?.baseRevision);
  const state = body?.state;
  if (!Number.isInteger(baseRevision) || baseRevision < 0 || !state || typeof state !== "object" || !state.store || typeof state.store !== "object" || !Array.isArray(state.store.projects)) {
    return NextResponse.json({ ok: false, error: "invalid_state" }, { status: 400, headers: noStoreHeaders() });
  }

  const admin = createAdminClient();
  const conflict = async () => {
    const { data } = await admin.from("vaak_company_data").select("state,revision").eq("company_id", member.companyId).maybeSingle();
    return NextResponse.json(
      { ok: false, error: "conflict", revision: Number(data?.revision || 0), state: data?.state || null },
      { status: 409, headers: noStoreHeaders() },
    );
  };
  const now = new Date().toISOString();

  if (baseRevision === 0) {
    // Only an administrator publishes the initial company workspace.
    if (member.role !== "admin") return conflict();
    const { error } = await admin.from("vaak_company_data").insert({ company_id: member.companyId, state, revision: 1, updated_at: now, updated_by: member.userId });
    if (error) return error.code === "23505" ? conflict() : NextResponse.json({ ok: false, error: "service_unavailable" }, { status: 503, headers: noStoreHeaders() });
    return NextResponse.json({ ok: true, revision: 1 }, { headers: noStoreHeaders() });
  }

  const { data, error } = await admin
    .from("vaak_company_data")
    .update({ state, revision: baseRevision + 1, updated_at: now, updated_by: member.userId })
    .eq("company_id", member.companyId)
    .eq("revision", baseRevision)
    .select("revision");
  if (error) return NextResponse.json({ ok: false, error: "service_unavailable" }, { status: 503, headers: noStoreHeaders() });
  if (!data || !data.length) return conflict();
  return NextResponse.json({ ok: true, revision: Number(data[0].revision) }, { headers: noStoreHeaders() });
}
