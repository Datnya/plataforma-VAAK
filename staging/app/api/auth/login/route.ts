import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveDemoIdentity } from "@/lib/demo-identities";

function failure(request: Request, json: boolean) {
  return json
    ? NextResponse.json({ ok: false }, { status: 401 })
    : NextResponse.redirect(new URL("/login?error=credentials", request.url), 303);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const identifier = String(form.get("username") ?? form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const identity = resolveDemoIdentity(identifier);
  const wantsJson = request.headers.get("accept")?.includes("application/json") ?? false;

  if (!identity || !password) {
    return failure(request, wantsJson);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: identity.email, password });

  if (error) {
    return failure(request, wantsJson);
  }

  if (wantsJson) return NextResponse.json({ ok: true, username: identity.username });
  return NextResponse.redirect(new URL("/", request.url), 303);
}
