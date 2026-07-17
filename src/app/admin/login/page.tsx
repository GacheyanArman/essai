import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { loginAction } from "@/app/admin/actions";
import { Logo } from "@/components/store/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSession } from "@/lib/auth";

type SearchParams = Promise<{ error?: string }>;
export const metadata: Metadata = { title: "Вход в панель", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  if (await getSession()) redirect("/admin/dashboard");
  const params = await searchParams;
  return (
    <div className="grid min-h-screen bg-black lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-[url('/media/founder.jpg')] bg-cover bg-center grayscale" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/35" />
        <div className="absolute inset-x-10 bottom-10 text-white"><p className="text-[10px] uppercase tracking-[0.28em] text-white/45">EsExpress control room</p><h1 className="mt-4 max-w-2xl font-display text-7xl leading-[.88] tracking-[-0.055em]">Управляйте брендом как редакцией.</h1></div>
      </div>
      <div className="flex items-center justify-center bg-[#f3f1e9] p-5 sm:p-8">
        <div className="w-full max-w-md rounded-[2rem] border border-black/10 bg-white/70 p-7 shadow-2xl shadow-black/10 backdrop-blur sm:p-10">
          <Logo className="h-20" />
          <div className="mt-10 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white"><LockKeyhole className="h-5 w-5" /></div>
          <h2 className="mt-6 font-display text-5xl tracking-[-0.05em]">Вход</h2>
          <p className="mt-3 text-sm leading-6 text-black/50">Панель управления товарами, контентом и SEO.</p>
          {params.error ? <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Неверный email или пароль.</div> : null}
          <form action={loginAction} className="mt-7 space-y-4">
            <label className="block"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45">Пароль</span><Input type="password" name="password" required autoComplete="current-password" /></label>
            <Button type="submit" className="mt-2 w-full">Войти в панель</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
