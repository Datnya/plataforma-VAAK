"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";

let client: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (!client) {
    const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();
    client = createBrowserClient(supabaseUrl, supabasePublishableKey);
  }
  return client;
}
