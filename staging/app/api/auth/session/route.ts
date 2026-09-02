import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { usernameForEmail } from "@/lib/demo-identities";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const username = usernameForEmail(user?.email);

  if (!user || !username) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("vaak_user_company_memberships")
    .select("role,status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ authenticated: false }, { status: 403 });
  }

  return NextResponse.json({ authenticated: true, username, role: membership.role });
}
