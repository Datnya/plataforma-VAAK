import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { allowedOrigin, noStoreHeaders, validCsrf } from "@/lib/security";
import { requireMember } from "@/lib/company-data";

const DATA_URL = /^data:(image[/](?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/;
const MAX_BYTES = 3_200_000;

// Stores an image referenced by the shared workspace. The id is the SHA-256 of the file bytes.
export async function PUT(request: NextRequest) {
  if (!allowedOrigin(request) || !validCsrf(request)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403, headers: noStoreHeaders() });
  }
  const member = await requireMember();
  if (!member) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401, headers: noStoreHeaders() });
  if (member.role === "client") return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403, headers: noStoreHeaders() });

  const body = await request.json().catch(() => null);
  const id = String(body?.id || "");
  const match = DATA_URL.exec(String(body?.dataUrl || ""));
  if (!/^[0-9a-f]{64}$/.test(id) || !match) return NextResponse.json({ ok: false, error: "invalid_asset" }, { status: 400, headers: noStoreHeaders() });
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > MAX_BYTES) return NextResponse.json({ ok: false, error: "too_large" }, { status: 413, headers: noStoreHeaders() });
  if (createHash("sha256").update(bytes).digest("hex") !== id) {
    return NextResponse.json({ ok: false, error: "hash_mismatch" }, { status: 400, headers: noStoreHeaders() });
  }

  const { error } = await createAdminClient()
    .from("vaak_company_assets")
    .upsert(
      { company_id: member.companyId, id, mime: match[1], data_base64: match[2], byte_size: bytes.length, created_by: member.userId },
      { onConflict: "company_id,id", ignoreDuplicates: true },
    );
  if (error) return NextResponse.json({ ok: false, error: "service_unavailable" }, { status: 503, headers: noStoreHeaders() });
  return NextResponse.json({ ok: true, url: `/api/data/assets/${id}` }, { headers: noStoreHeaders() });
}
