import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";

const cards = [
  ["Gestor de usuarios", "Administra cuentas, roles y estado de acceso."],
  ["Gestión de proveedores", "Mantén organizado el directorio de proveedores."],
  ["Historial de Órdenes de Compra", "Consulta las órdenes generadas en todos los proyectos."],
  ["Biblioteca de specs", "Revisa productos y fichas técnicas guardadas."],
  ["Configuración del sistema", "Idioma y preferencias generales del entorno."],
];

export default async function ToolsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("vaak_profiles").select("display_name").eq("id", user.id).maybeSingle();
  const { data: membership } = await supabase.from("vaak_user_company_memberships").select("role").eq("user_id", user.id).eq("status", "active").limit(1).maybeSingle();
  return <AppShell displayName={profile?.display_name || user.email || "Usuario VAAK"} role={membership?.role || "usuario"}>
    <section className="hero"><p className="eyebrow">ESPACIO DE TRABAJO</p><h1>Herramientas</h1></section>
    <section className="tools-grid">{cards.map(([title, description]) => <article className="tool-card" key={title}><div className="tool-icon">◇</div><h2>{title}</h2><p>{description}</p><button className="open-button" disabled>Abrir</button></article>)}</section>
    <Link href="/" className="back-link">← Volver al dashboard</Link>
  </AppShell>;
}
