import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";

const CSRF_COOKIE = "vaak-csrf";

function hmac(value: string) {
  return createHmac("sha256", getServerEnv().rateLimitHmacSecret).update(value).digest("base64url");
}

export function allowedOrigin(request: NextRequest) {
  const configured = getServerEnv().appOrigin.split(",").map((item) => item.trim()).filter(Boolean);
  const origin = request.headers.get("origin");
  return Boolean(origin && (configured.includes(origin) || origin === request.nextUrl.origin));
}

export function issueCsrf(response: NextResponse) {
  const token = randomBytes(32).toString("base64url");
  response.cookies.set(CSRF_COOKIE, hmac(token), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60,
  });
  return token;
}

export function validCsrf(request: NextRequest) {
  const token = request.headers.get("x-vaak-csrf") || "";
  const cookie = request.cookies.get(CSRF_COOKIE)?.value || "";
  if (!token || !cookie) return false;
  const expected = hmac(token);
  const left = Buffer.from(expected);
  const right = Buffer.from(cookie);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function loginAttemptKey(request: NextRequest, identifier: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return hmac(`${forwarded}|${identifier.trim().toLowerCase()}`);
}

export function noStoreHeaders() {
  return { "Cache-Control": "no-store, max-age=0" };
}
