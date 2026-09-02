import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedBuckets = new Set(["vaak-stg-project-media", "vaak-stg-spec-pdfs", "vaak-stg-po-pdfs", "vaak-stg-report-exports"]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "resource_unavailable" }, { status: 404 });
  const body = await request.json().catch(() => null) as { bucket?: string; path?: string } | null;
  if (!body?.bucket || !body.path || !allowedBuckets.has(body.bucket)) {
    return NextResponse.json({ error: "resource_unavailable" }, { status: 404 });
  }
  const { data, error } = await supabase.storage.from(body.bucket).createSignedUrl(body.path, 300);
  if (error || !data) return NextResponse.json({ error: "resource_unavailable" }, { status: 404 });
  return NextResponse.json({ signedUrl: data.signedUrl, expiresIn: 300 });
}
