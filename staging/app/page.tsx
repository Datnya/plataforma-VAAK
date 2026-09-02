import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";
import type { Membership, Objective, Profile, Project } from "@/lib/types";

function readableRole(role: string) {
  return role === "admin" ? "Administrador" : role === "worker" ? "Trabajador" : "Cliente";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profileData }, { data: membershipData }] = await Promise.all([
    supabase.from("vaak_profiles").select("id,display_name,locale").eq("id", user.id).maybeSingle(),
    supabase.from("vaak_user_company_memberships").select("company_id,role,companies:vaak_companies(name)").eq("user_id", user.id).eq("status", "active").limit(1).maybeSingle(),
  ]);
  const profile = profileData as Profile | null;
  const membership = membershipData as unknown as Membership | null;
  if (!membership) {
    return <main className="unassigned"><h1>Cuenta pendiente de asignación</h1><p>Tu usuario está autenticado, pero aún no tiene una empresa o rol asignado.</p></main>;
  }

  const [{ data: projectsData }, { data: objectivesData }] = await Promise.all([
    supabase.from("vaak_projects").select("id,company_id,code,name,legal_name,installation_date,opening_date,cover_path").eq("company_id", membership.company_id).order("name"),
    supabase.from("vaak_objectives").select("id,project_id,title,status,due_date").eq("company_id", membership.company_id).order("due_date"),
  ]);
  const projects = (projectsData ?? []) as Project[];
  const objectives = (objectivesData ?? []) as Objective[];

  return (
    <AppShell displayName={profile?.display_name || user.email || "Usuario VAAK"} role={readableRole(membership.role)}>
      <section className="hero"><p className="eyebrow">PORTAFOLIO ACTIVO</p><h1>Proyectos actuales</h1><p>Gestiona compras, especificaciones y seguimiento desde un solo espacio.</p></section>
      <section className="section-block">
        <div className="section-title"><div><p className="eyebrow">PROYECTOS</p><h2>Portafolio de proyectos</h2></div></div>
        <div className="project-grid">
          {projects.map((project) => <Link className="project-card" href={`/proyectos/${project.id}`} key={project.id}>
            <div className="project-cover"><span>{project.code}</span></div>
            <div className="project-body"><p className="eyebrow">{project.code}</p><h3>{project.name}</h3><p>{project.legal_name || "Proyecto de demostración"}</p><div className="dates"><span>Instalación<strong>{project.installation_date || "Por definir"}</strong></span><span>Apertura<strong>{project.opening_date || "Por definir"}</strong></span></div></div>
          </Link>)}
          {!projects.length ? <div className="empty-state">Todavía no hay proyectos visibles para esta cuenta.</div> : null}
        </div>
      </section>
      <section className="section-block objectives"><div className="section-title"><div><p className="eyebrow">OBJETIVOS</p><h2>Objetivos por completar</h2></div></div>
        <div className="list">{objectives.map((objective) => <article key={objective.id}><div><strong>{objective.title}</strong><p>Fecha límite: {objective.due_date || "Por definir"}</p></div><span className={`status ${objective.status}`}>{objective.status.replace("_", " ")}</span></article>)}{!objectives.length ? <div className="empty-state">No existen objetivos asignados.</div> : null}</div>
      </section>
    </AppShell>
  );
}
