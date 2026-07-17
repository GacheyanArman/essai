import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/store/logo";

type Props = {
  telegramUsername: string;
  channelUsername: string;
  footerText: string;
};

export function Footer({ telegramUsername, channelUsername, footerText }: Props) {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-[1560px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_.8fr_.8fr]">
          <div>
            <Logo inverted className="h-24" />
            <p className="mt-6 max-w-md text-sm leading-7 text-white/55">{footerText}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">Навигация</p>
            <div className="mt-6 flex flex-col gap-3 text-sm">
              <Link href="/catalog" className="hover:text-white/60">Каталог</Link>
              <Link href="/about" className="hover:text-white/60">О сервисе</Link>
              <Link href="/delivery" className="hover:text-white/60">Доставка и оплата</Link>
              <Link href="/contacts" className="hover:text-white/60">Контакты</Link>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">Связь</p>
            <div className="mt-6 flex flex-col gap-3 text-sm">
              <a href={`https://t.me/${telegramUsername.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white/60">Менеджер <ArrowUpRight className="h-3.5 w-3.5" /></a>
              <a href={`https://t.me/${channelUsername.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white/60">Telegram-канал <ArrowUpRight className="h-3.5 w-3.5" /></a>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.18em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} EsExpress</span>
          <span>Оригинальные товары · Персональный выкуп · Москва</span>
        </div>
      </div>
    </footer>
  );
}
