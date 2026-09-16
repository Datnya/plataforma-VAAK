import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { noStoreHeaders } from "@/lib/security";
import { requireRemoteAdmin } from "@/lib/users";

// Lightweight presence list for the user directory (no photos or access data).
export async function GET() {
  const actor = await requireRemoteAdmin();
  if (!actor) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders() });

  const { data, error } = await createAdminClient()
    .from("vaak_user_company_memberships")
    .select("user_id,profiles:vaak_profiles!inner(legacy_id,last_seen_at,signed_out_at)")
    .eq("company_id", actor.companyId);
  if (error) return NextResponse.json({ ok: false }, { status: 500, headers: noStoreHeaders() });

  const presence = (data || []).map((row: any) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: profile?.legacy_id || `remote-${row.user_id}`,
      lastSeenAt: profile?.last_seen_at || null,
      signedOutAt: profile?.signed_out_at || null,
    };
  });
  return NextResponse.json({ ok: true, serverNow: new Date().toISOString(), presence }, { headers: noStoreHeaders() });
}
