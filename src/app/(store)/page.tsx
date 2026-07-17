import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Send } from "lucide-react";
import { Hero } from "@/components/store/hero";
import { Marquee } from "@/components/store/marquee";
import { OrderSteps } from "@/components/store/order-steps";
import { ProductCard } from "@/components/store/product-card";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getFeaturedProducts, getSettings } from "@/lib/data";
import { db } from "@/lib/store-db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, products, categories, banners] = await Promise.all([
    getSettings(),
    getFeaturedProducts(8),
    db.category.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], take: 4 }),
    db.banner.findMany({ where: { isActive: true }, orderBy: { position: "asc" }, take: 1 }),
  ]);
  const banner = banners[0];

  return (
    <>
      <Hero eyebrow={settings.heroEyebrow} title={settings.heroTitle} text={settings.heroText} telegramUsername={settings.telegramUsername} />
      <Marquee />

      <section className="mx-auto max-w-[1560px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="Curated selection" title="То, что сложно найти" text="Редкие позиции, проверенные источники и персональный выкуп без лишнего шума." />
          <ButtonLink href="/catalog" variant="outline" className="shrink-0">Весь каталог <ArrowUpRight className="h-4 w-4" /></ButtonLink>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
          {products.map((product: import("@/lib/types").Product & { brand: import("@/lib/types").Brand; images: import("@/lib/types").ProductImage[] }) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="bg-black px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1560px]">
          <SectionHeading eyebrow="Shop by mood" title="Категории как главы одной истории" text="Одежда, аксессуары, обувь и ароматы — собраны в единой визуальной системе EsExpress." />
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((category: import("@/lib/types").Category, index: number) => (
              <Link key={category.id} href={`/catalog?category=${category.slug}`} className={`group relative min-h-[430px] overflow-hidden rounded-[2rem] ${index === 0 ? "lg:col-span-2" : ""}`}>
                <Image src={category.image || "/media/lookbook-men.webp"} alt={category.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-7">
                  <div><p className="text-[9px] uppercase tracking-[0.25em] text-white/50">0{index + 1}</p><h3 className="mt-2 font-display text-4xl tracking-[-0.04em]">{category.name}</h3></div>
                  <ArrowUpRight className="h-6 w-6 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1560px] gap-0 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-32">
        <div className="relative min-h-[620px] overflow-hidden rounded-t-[2rem] lg:rounded-l-[2rem] lg:rounded-tr-none">
          <Image src="/media/founder.jpg" alt="Основатель сервиса EsExpress" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <p className="absolute bottom-7 left-7 max-w-xs text-xs uppercase leading-6 tracking-[0.2em] text-white/75">Личная репутация важнее одной продажи</p>
        </div>
        <div className="flex flex-col justify-between rounded-b-[2rem] bg-[#e9e5d9] p-8 sm:p-12 lg:rounded-r-[2rem] lg:rounded-bl-none lg:p-16">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-black/45">Founder story</p>
            <h2 className="mt-6 font-display text-5xl leading-[.95] tracking-[-0.05em] sm:text-6xl">{settings.founderTitle}</h2>
            <p className="mt-8 max-w-xl text-sm leading-8 text-black/60 sm:text-base">{settings.founderText}</p>
          </div>
          <div className="mt-12 space-y-4 border-t border-black/10 pt-8">
            {["Только официальные сайты и ритейлеры", "Проверка позиции до оплаты", "Личный менеджер на всём пути", "Бережная упаковка и доставка СДЭК"].map((item) => <div key={item} className="flex items-center gap-3 text-sm"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white"><Check className="h-3.5 w-3.5" /></span>{item}</div>)}
          </div>
        </div>
      </section>

      {banner ? (
        <section className="relative min-h-[78svh] overflow-hidden bg-black text-white">
          <Image src={banner.image} alt={banner.title} fill sizes="100vw" className="object-cover opacity-65" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          <div className="relative mx-auto flex min-h-[78svh] max-w-[1560px] items-end px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            <div className="max-w-4xl"><p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/55">{banner.eyebrow}</p><h2 className="mt-5 font-display text-6xl leading-[.88] tracking-[-0.055em] sm:text-8xl">{banner.title}</h2><p className="mt-6 max-w-xl text-sm leading-7 text-white/65">{banner.subtitle}</p><ButtonLink href={banner.ctaHref} variant="light" className="mt-8">{banner.ctaLabel}<ArrowUpRight className="h-4 w-4" /></ButtonLink></div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-[1560px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
        <SectionHeading eyebrow="How it works" title="Заказ без неизвестности" text="Никаких автоматических ботов. На каждом этапе с вами работает живой менеджер." />
        <div className="mt-14"><OrderSteps /></div>
      </section>



      <section className="bg-[#f7f5ed] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1560px] overflow-hidden rounded-[2.5rem] bg-black px-7 py-16 text-center text-white sm:px-12 lg:py-24">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/45">Private request</p>
          <h2 className="mx-auto mt-6 max-w-5xl font-display text-5xl leading-[.9] tracking-[-0.055em] sm:text-7xl lg:text-8xl">Не нашли нужную позицию? Найдём лично для вас.</h2>
          <a href={`https://t.me/${settings.telegramUsername.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="mt-10 inline-flex min-h-14 items-center gap-3 rounded-full bg-white px-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:scale-[1.02]"><Send className="h-4 w-4" /> Написать менеджеру</a>
        </div>
      </section>
    </>
  );
}
