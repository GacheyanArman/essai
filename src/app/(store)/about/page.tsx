import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "О сервисе", description: "История EsExpress и принципы персонального выкупа оригинальных товаров." };

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <div>
      <section className="mx-auto grid max-w-[1560px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-24">
        <div className="flex flex-col"><p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-black/45">About EsExpress</p><h1 className="mt-5 font-display text-7xl leading-[.84] tracking-[-0.06em] sm:text-8xl">Стиль без лишних барьеров</h1><p className="mt-8 max-w-xl text-sm leading-8 text-black/60 sm:text-base">{settings.founderText}</p></div>
        <div className="relative min-h-[650px] overflow-hidden rounded-[2rem]"><Image src="/media/founder.jpg" alt="Основатель EsExpress" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover grayscale" /></div>
      </section>
      <section className="bg-black px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-28"><div className="mx-auto max-w-[1560px]"><SectionHeading eyebrow="Our principle" title="Репутация — главный актив" text="Мы строим сервис вокруг прозрачности: заранее согласовываем источник, стоимость, сроки и остаёмся на связи до получения заказа." /><div className="mt-14 grid gap-4 md:grid-cols-3">{["Только оригинальные позиции", "Без космических наценок", "Один менеджер на всём пути"].map((item, index) => <div key={item} className="rounded-[1.8rem] border border-white/15 p-8"><span className="text-[10px] tracking-[0.2em] text-white/35">0{index + 1}</span><h2 className="mt-16 font-display text-4xl tracking-[-0.04em]">{item}</h2><p className="mt-5 text-sm leading-7 text-white/50">Каждое решение в процессе заказа подчинено одному: чтобы покупка была спокойной, понятной и предсказуемой.</p></div>)}</div></div></section>
      <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-28"><SectionHeading eyebrow="What we do" title="От ссылки до вашей двери" align="center" /><div className="mx-auto mt-12 max-w-3xl space-y-4">{["Ищем нужную модель, размер, оттенок или аромат", "Проверяем официального продавца и финальную стоимость", "Выкупаем и сопровождаем международную доставку", "Принимаем на складе в Москве и проверяем комплектность", "Отправляем СДЭКом в любой город России"].map((item) => <div key={item} className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white/40 p-5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white"><Check className="h-4 w-4" /></span><p className="text-sm">{item}</p></div>)}</div></section>
    </div>
  );
}
