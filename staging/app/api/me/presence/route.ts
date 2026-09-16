import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { allowedOrigin, noStoreHeaders, validCsrf } from "@/lib/security";

// Heartbeat sent by an open, actively used session (at most once per minute).
export async function POST(request: NextRequest) {
  if (!allowedOrigin(request) || !validCsrf(request)) {
    return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders() });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401, headers: noStoreHeaders() });

  const now = new Date().toISOString();
  const { error } = await createAdminClient()
    .from("vaak_profiles")
    .update({ last_seen_at: now, signed_out_at: null })
    .eq("id", user.id);
  if (error) return NextResponse.json({ ok: false }, { status: 500, headers: noStoreHeaders() });
  return NextResponse.json({ ok: true, serverNow: now }, { headers: noStoreHeaders() });
}
