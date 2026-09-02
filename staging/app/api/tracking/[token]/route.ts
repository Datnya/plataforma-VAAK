import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("vaak_lookup_public_tracking", { raw_token: token });
  if (error || !data?.length) return NextResponse.json({ error: "resource_unavailable" }, { status: 404 });
  return NextResponse.json(data[0]);
}
