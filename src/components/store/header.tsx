"use client";

import Link from "next/link";
import { Menu, Search, Send, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/store/logo";

const nav = [
  ["Каталог", "/catalog"],
  ["Новинки", "/catalog?feature=new"],
  ["Парфюмерия", "/catalog?category=parfyumeriya"],
  ["О сервисе", "/about"],
  ["Доставка", "/delivery"],
];

export function Header({ announcement, telegramUsername }: { announcement: string; telegramUsername: string }) {
  const [open, setOpen] = useState(false);
  const tg = telegramUsername.replace(/^@/, "");

  return (
    <>
      <div className="bg-black px-4 py-2.5 text-center text-[9px] font-medium uppercase tracking-[0.22em] text-white sm:text-[10px]">
        {announcement}
      </div>
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f7f5ed]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1560px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <button type="button" className="rounded-full p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Открыть меню">
            <Menu className="h-5 w-5" />
          </button>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Главное меню">
            {nav.slice(0, 3).map(([label, href]) => <Link key={href} href={href} className="text-[10px] font-semibold uppercase tracking-[0.18em] transition hover:opacity-50">{label}</Link>)}
          </nav>
          <Link href="/" aria-label="EsExpress — главная" className="absolute left-1/2 -translate-x-1/2">
            <Logo className="h-16" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/catalog" className="rounded-full p-2" aria-label="Поиск по каталогу"><Search className="h-5 w-5" /></Link>
            <a href={`https://t.me/${tg}`} target="_blank" rel="noreferrer" className="hidden min-h-11 items-center gap-2 rounded-full border border-black/15 px-5 text-[10px] font-semibold uppercase tracking-[0.16em] transition hover:bg-black hover:text-white sm:flex">
              <Send className="h-4 w-4" /> Telegram
            </a>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 z-[80] transition ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
        <button type="button" className={`absolute inset-0 bg-black/45 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} aria-label="Закрыть меню" />
        <aside className={`absolute inset-y-0 left-0 w-[88%] max-w-sm bg-[#f7f5ed] p-6 transition-transform duration-500 ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between">
            <Logo className="h-14" />
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2" aria-label="Закрыть меню"><X className="h-5 w-5" /></button>
          </div>
          <nav className="mt-16 flex flex-col gap-2">
            {nav.map(([label, href], index) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="border-b border-black/10 py-5 font-display text-4xl tracking-[-0.04em]">
                <span className="mr-4 text-[10px] font-sans text-black/35">0{index + 1}</span>{label}
              </Link>
            ))}
          </nav>
          <a href={`https://t.me/${tg}`} target="_blank" rel="noreferrer" className="mt-10 flex min-h-14 items-center justify-center gap-2 rounded-full bg-black text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
            <Send className="h-4 w-4" /> Связаться с менеджером
          </a>
        </aside>
      </div>
    </>
  );
}
