import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="login-page">
      <section className="login-visual"><div><p>VAAK PROCUREMENT</p><h1>Avance claro para cada proyecto.</h1></div></section>
      <section className="login-panel">
        <div className="login-card">
          <Image src="/logo-vaak.png" alt="VAAK" width={260} height={82} priority />
          <p className="eyebrow">BIENVENIDO A VAAK</p>
          <h2>Ingresa a tu espacio de trabajo</h2>
          <LoginForm hasError={error === "credentials"} />
        </div>
      </section>
    </main>
  );
}
