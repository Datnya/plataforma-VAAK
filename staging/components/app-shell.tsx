import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/sign-out-button";

export function AppShell({ children, displayName, role }: { children: ReactNode; displayName: string; role: string }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link href="/" className="brand"><Image src="/logo-vaak.png" alt="VAAK" width={210} height={66} priority /></Link>
        <nav><Link href="/">Dashboard</Link><Link href="/herramientas">Herramientas</Link></nav>
        <div className="profile"><span><strong>{displayName}</strong><small>{role}</small></span><SignOutButton /></div>
      </header>
      <main>{children}</main>
      <footer><strong>VAAK</strong><span>© 2026 VAAK Procurement Solutions. All rights reserved.</span></footer>
    </div>
  );
}
