import { NextResponse } from "next/server";
import { getSupabaseEnv } from "@/lib/env";

export async function GET() {
  try {
    const { supabaseUrl } = getSupabaseEnv();
    return NextResponse.json({ ok: true, service: "vaak-staging", supabaseHost: new URL(supabaseUrl).host, releaseId: process.env.VAAK_RELEASE_ID || "local" });
  } catch {
    return NextResponse.json({ ok: false, error: "environment_not_configured" }, { status: 503 });
  }
}
