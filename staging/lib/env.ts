const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const appOrigin = process.env.VAAK_APP_ORIGIN;
const rateLimitHmacSecret = process.env.VAAK_RATE_LIMIT_HMAC_SECRET;

export function getSupabaseEnv() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase staging environment variables are not configured.");
  }
  return { supabaseUrl, supabasePublishableKey };
}

export function getServerEnv() {
  const publicEnv = getSupabaseEnv();
  if (!supabaseSecretKey || !appOrigin || !rateLimitHmacSecret) {
    throw new Error("VAAK server environment variables are not configured.");
  }
  return { ...publicEnv, supabaseSecretKey, appOrigin, rateLimitHmacSecret };
}
