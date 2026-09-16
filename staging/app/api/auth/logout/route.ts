import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { allowedOrigin, noStoreHeaders, validCsrf } from "@/lib/security";

export async function POST(request: NextRequest) {
  if (!allowedOrigin(request) || !validCsrf(request)) {
    return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders() });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Mark the user as signed out so the directory shows them as inactive right away.
  if (user) await createAdminClient().from("vaak_profiles").update({ signed_out_at: new Date().toISOString() }).eq("id", user.id);
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
}
