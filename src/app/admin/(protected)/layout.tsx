import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: { default: "Панель управления", template: "%s — EsExpress Admin" }, robots: { index: false, follow: false } };

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return <AdminShell userName={session.name}>{children}</AdminShell>;
}
