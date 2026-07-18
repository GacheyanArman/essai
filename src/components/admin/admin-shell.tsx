import Link from "next/link";
import { BarChart3, Boxes, LayoutDashboard, LogOut, Package, ShieldX, ShoppingBag, Tags } from "lucide-react";
import { Logo } from "@/components/store/logo";
import { logoutAction, revokeAllSessionsAction } from "@/app/admin/actions";

const nav = [
  { href: "/admin/dashboard", label: "Обзор", icon: LayoutDashboard },
  { href: "/admin/products", label: "Товары", icon: Package },
  { href: "/admin/categories", label: "Категории", icon: Boxes },
  { href: "/admin/brands", label: "Бренды", icon: Tags },
];

export function AdminShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  return (
    <div className="min-h-screen bg-[#f3f1e9] text-black lg:grid lg:grid-cols-[270px_1fr]">
      <aside className="border-b border-black/10 bg-black text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-white/10">
        <div className="flex h-20 items-center justify-between px-5 lg:h-auto lg:block lg:px-7 lg:py-7">
          <Link href="/admin/dashboard"><Logo inverted className="h-14" /></Link>
          <div className="flex items-center gap-2 lg:hidden">
            <Link href="/" className="flex h-9 items-center gap-1.5 rounded-full border border-white/20 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70 hover:bg-white/10">
              <ShoppingBag className="h-3.5 w-3.5" /> Магазин
            </Link>
            <form action={logoutAction}>
              <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 hover:bg-white/10" aria-label="Выйти">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
          <span className="hidden rounded-full border border-white/15 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-white/50 lg:mt-5 lg:inline-block">Control room</span>
        </div>
        <nav className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:overflow-visible lg:px-4 lg:pb-0">
          {nav.map((item) => { const Icon = item.icon; return (
            <Link key={item.href} href={item.href} className="flex min-h-12 shrink-0 items-center gap-3 rounded-xl px-4 text-sm text-white/65 transition hover:bg-white/10 hover:text-white">
              <Icon className="h-4 w-4" strokeWidth={1.7} />{item.label}
            </Link>
          ); })}
        </nav>
        <div className="hidden border-t border-white/10 p-5 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
          <Link href="/" className="mb-4 flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-xs text-white/65 transition hover:bg-white hover:text-black">
            <ShoppingBag className="h-4 w-4" /> Перейти в магазин
          </Link>
          <div className="mb-4 text-xs text-white/50"><p className="text-white">{userName}</p><p className="mt-1">Administrator</p></div>
          <div className="space-y-2">
            <form action={revokeAllSessionsAction}>
              <button className="flex w-full items-center gap-3 rounded-xl border border-amber-300/25 px-4 py-3 text-left text-xs text-amber-100/75 transition hover:bg-amber-100 hover:text-black">
                <ShieldX className="h-4 w-4" /> Завершить все сеансы
              </button>
            </form>
            <form action={logoutAction}>
              <button className="flex w-full items-center gap-3 rounded-xl border border-white/15 px-4 py-3 text-xs text-white/65 transition hover:bg-white hover:text-black">
                <LogOut className="h-4 w-4" /> Выйти
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="admin-grid min-w-0"><main className="mx-auto max-w-[1500px] p-5 sm:p-8 lg:p-10">{children}</main></div>
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon = BarChart3 }: { label: string; value: string | number; hint?: string; icon?: typeof BarChart3 }) {
  return <div className="rounded-[1.5rem] border border-black/10 bg-white/70 p-6 backdrop-blur"><div className="flex items-start justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40">{label}</p><Icon className="h-5 w-5 text-black/35" /></div><p className="mt-7 font-display text-5xl tracking-[-0.05em]">{value}</p>{hint ? <p className="mt-3 text-xs text-black/45">{hint}</p> : null}</div>;
}
