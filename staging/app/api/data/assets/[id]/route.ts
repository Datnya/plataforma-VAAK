import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { noStoreHeaders } from "@/lib/security";
import { requireMember } from "@/lib/company-data";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[0-9a-f]{64}$/.test(id)) return NextResponse.json({ ok: false }, { status: 404, headers: noStoreHeaders() });
  const member = await requireMember();
  if (!member) return NextResponse.json({ ok: false }, { status: 401, headers: noStoreHeaders() });
  const { data, error } = await createAdminClient()
    .from("vaak_company_assets")
    .select("mime,data_base64")
    .eq("company_id", member.companyId)
    .eq("id", id)
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false }, { status: 503, headers: noStoreHeaders() });
  if (!data) return NextResponse.json({ ok: false }, { status: 404, headers: noStoreHeaders() });
  return new NextResponse(Buffer.from(data.data_base64 as string, "base64"), {
    headers: { "Content-Type": data.mime as string, "Cache-Control": "private, max-age=31536000, immutable" },
  });
}
