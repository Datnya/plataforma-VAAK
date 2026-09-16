import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { allowedOrigin, noStoreHeaders, validCsrf } from "@/lib/security";

// A cropped 300x300 photo is well below this limit; it keeps oversized uploads out of the database.
const MAX_PHOTO_LENGTH = 700000;
const PHOTO_FORMAT = /^data:image[/](png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStoreHeaders() });

async function signedInUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export async function PUT(request: NextRequest) {
  if (!allowedOrigin(request) || !validCsrf(request)) return reply({ ok: false, error: "forbidden" }, 403);
  const userId = await signedInUserId();
  if (!userId) return reply({ ok: false, error: "unauthenticated" }, 401);

  let body: { photo?: unknown };
  try { body = await request.json(); } catch { return reply({ ok: false, error: "invalid_photo" }, 400); }
  const photo = typeof body.photo === "string" ? body.photo : "";
  if (photo.length > MAX_PHOTO_LENGTH) return reply({ ok: false, error: "photo_too_large" }, 413);
  if (!PHOTO_FORMAT.test(photo)) return reply({ ok: false, error: "invalid_photo" }, 400);

  const { error } = await createAdminClient().from("vaak_profiles").update({ avatar_url: photo }).eq("id", userId);
  if (error) return reply({ ok: false, error: "save_failed" }, 500);
  return reply({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!allowedOrigin(request) || !validCsrf(request)) return reply({ ok: false, error: "forbidden" }, 403);
  const userId = await signedInUserId();
  if (!userId) return reply({ ok: false, error: "unauthenticated" }, 401);
  const { error } = await createAdminClient().from("vaak_profiles").update({ avatar_url: null }).eq("id", userId);
  if (error) return reply({ ok: false, error: "save_failed" }, 500);
  return reply({ ok: true });
}
