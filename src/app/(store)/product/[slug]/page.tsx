import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { ChevronRight, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { BackButton } from "@/components/store/back-button";
import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { TelegramOrderButton } from "@/components/store/telegram-order-button";
import { getSettings } from "@/lib/data";
import { db } from "@/lib/store-db";
import { formatPrice, getSiteUrl } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

async function getProduct(slug: string) {
  return db.product.findUnique({ where: { slug }, include: { images: { orderBy: { sortOrder: "asc" } }, brand: true, category: true } });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title: product.name, description: product.description, images: product.images[0] ? [product.images[0].url] : [] },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProduct(slug), getSettings()]);
  if (!product || product.status !== "published") notFound();
  const related = await db.product.findMany({
    where: { status: "published", id: { not: product.id }, OR: [{ categoryId: product.categoryId }, { brandId: product.brandId }] },
    include: { images: { orderBy: { sortOrder: "asc" } }, brand: true },
    take: 4,
  });
  const url = `${getSiteUrl()}/product/${product.slug}`;
  const schema = {
    "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description,
    image: product.images.map((image: import("@/lib/types").ProductImage) => `${getSiteUrl()}${image.url}`), sku: product.sku, brand: { "@type": "Brand", name: product.brand.name },
    offers: { "@type": "Offer", priceCurrency: product.currency, price: product.price, availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder", url },
  };

  return (
    <div className="mx-auto max-w-[1560px] px-5 py-8 sm:px-8 lg:px-12 lg:py-14">
      <BackButton />
      <nav className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-black/40" aria-label="Хлебные крошки">
        <Link href="/">Главная</Link><ChevronRight className="h-3 w-3" /><Link href="/catalog">Каталог</Link><ChevronRight className="h-3 w-3" /><span>{product.name}</span>
      </nav>
      <div className="mt-7 grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-16">
        <div className="min-w-0">
          <ProductGallery images={product.images} productName={product.name} />
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-black/45">{product.brand.name} · {product.category.name}</p>
          <h1 className="mt-5 font-display text-5xl leading-[.92] tracking-[-0.05em] sm:text-6xl">{product.name}</h1>
          <div className="mt-7 flex items-center gap-3 text-xl"><span>{formatPrice(product.price, product.currency)}</span>{product.compareAtPrice ? <span className="text-black/30 line-through">{formatPrice(product.compareAtPrice, product.currency)}</span> : null}</div>
          <div className="mt-7 whitespace-pre-line text-sm leading-7 text-black/60">{product.description}</div>
          <div className="mt-8 flex flex-wrap gap-2">
            {product.isNew ? <span className="rounded-full border border-black/15 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.18em]">Новинка</span> : null}
            {product.isBestseller ? <span className="rounded-full border border-black/15 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.18em]">Хит продаж</span> : null}
            <span className="rounded-full border border-black/15 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.18em]">100% original</span>
          </div>
          <div className="mt-9">
            <TelegramOrderButton username={settings.telegramUsername} productName={product.name} price={formatPrice(product.price, product.currency)} productUrl={url} />
          </div>
          <p className="mt-3 text-xs leading-5 text-black/40">Нажатие откроет Telegram Desktop или веб-версию и автоматически сформирует сообщение с товаром.</p>
          <div className="mt-10 divide-y divide-black/10 border-y border-black/10">
            {[{ icon: ShieldCheck, title: "Гарантия оригинальности", text: "Выкуп с официальных сайтов брендов и у авторизованных ритейлеров." }, { icon: PackageCheck, title: "Проверка перед отправкой", text: "Сверяем позицию, состояние и комплектность на складе в Москве." }, { icon: Truck, title: "Доставка по России", text: "СДЭК до пункта выдачи или курьером по Москве." }].map((item) => { const Icon = item.icon; return <div key={item.title} className="flex gap-4 py-5"><Icon className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} /><div><h2 className="text-sm font-medium">{item.title}</h2><p className="mt-1 text-xs leading-5 text-black/50">{item.text}</p></div></div>; })}
          </div>

        </aside>
      </div>
      {related.length ? <section className="py-20 lg:py-28"><h2 className="font-display text-5xl tracking-[-0.045em]">Вам также может понравиться</h2><div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">{related.map((item: import("@/lib/types").Product & { brand: import("@/lib/types").Brand; images: import("@/lib/types").ProductImage[] }) => <ProductCard key={item.id} product={item} />)}</div></section> : null}
      <Script id="product-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </div>
  );
}
