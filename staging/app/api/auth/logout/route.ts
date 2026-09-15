import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { allowedOrigin, noStoreHeaders, validCsrf } from "@/lib/security";

export async function POST(request: NextRequest) {
  if (!allowedOrigin(request) || !validCsrf(request)) {
    return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders() });
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
}
