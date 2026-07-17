import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

type Props = {
  eyebrow: string;
  title: string;
  text: string;
  telegramUsername: string;
};

export function Hero({ eyebrow, title, text, telegramUsername }: Props) {
  return (
    <section className="relative min-h-[calc(100svh-112px)] overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <Image src="/media/founder.jpg" alt="Основатель EsExpress" fill priority sizes="100vw" className="object-cover object-[58%_center] opacity-60 grayscale sm:object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.96)_0%,rgba(0,0,0,.75)_42%,rgba(0,0,0,.18)_75%,rgba(0,0,0,.5)_100%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,.25)_1px,transparent_0)] [background-size:28px_28px]" />
      </div>
      <div className="relative mx-auto flex min-h-[calc(100svh-112px)] max-w-[1560px] flex-col justify-end px-5 pb-10 pt-24 sm:px-8 lg:px-12 lg:pb-14">
        <div className="max-w-5xl">
          <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.36em] text-white/55">{eyebrow}</p>
          <h1 className="font-display max-w-5xl text-[clamp(3.7rem,9vw,9rem)] leading-[0.82] tracking-[-0.065em]">
            {title}
          </h1>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <p className="max-w-xl text-sm leading-7 text-white/65 sm:text-base">{text}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/catalog" variant="light">Открыть каталог <ArrowUpRight className="h-4 w-4" /></ButtonLink>
              <a href={`https://t.me/${telegramUsername.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] transition hover:bg-white hover:text-black">Личный запрос</a>
            </div>
          </div>
        </div>
        <div className="mt-12 flex items-center justify-end border-t border-white/15 pt-5 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/45">
          <span className="flex items-center gap-2">Исследовать <ArrowDown className="h-3.5 w-3.5" /></span>
        </div>
      </div>
    </section>
  );
}
