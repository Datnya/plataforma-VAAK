import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, { data: membership }, { data: project }] = await Promise.all([
    supabase.from("vaak_profiles").select("display_name").eq("id", user.id).maybeSingle(),
    supabase.from("vaak_user_company_memberships").select("role").eq("user_id", user.id).eq("status", "active").limit(1).maybeSingle(),
    supabase.from("vaak_projects").select("id,code,name,legal_name,tax_id,fiscal_address,installation_date,opening_date").eq("id", id).maybeSingle(),
  ]);
  if (!project) notFound();
  return <AppShell displayName={profile?.display_name || user.email || "Usuario VAAK"} role={membership?.role || "usuario"}>
    <section className="project-banner"><p>{project.code}</p><h1>{project.name}</h1></section>
    <section className="details-grid"><article><h2>Información general</h2><dl><div><dt>Razón social</dt><dd>{project.legal_name || "Por definir"}</dd></div><div><dt>RUC</dt><dd>{project.tax_id || "Por definir"}</dd></div><div><dt>Dirección fiscal</dt><dd>{project.fiscal_address || "Por definir"}</dd></div></dl></article><article><h2>Fechas</h2><dl><div><dt>Instalación</dt><dd>{project.installation_date || "Por definir"}</dd></div><div><dt>Apertura</dt><dd>{project.opening_date || "Por definir"}</dd></div></dl></article></section>
  </AppShell>;
}
