import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/store-db";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Каталог", description: "Оригинальная одежда, обувь, аксессуары и нишевая парфюмерия с персональным выкупом." };

type SearchParams = Promise<{ q?: string; category?: string; brand?: string; feature?: string; sort?: string }>;

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [categories, brands] = await Promise.all([
    db.category.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    db.brand.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  const orderBy = params.sort === "price-asc"
    ? { price: "asc" as const }
    : params.sort === "price-desc"
      ? { price: "desc" as const }
      : { createdAt: "desc" as const };

  const products = await db.product.findMany({
    where: {
      status: "published",
      ...(params.q ? { OR: [{ name: { contains: params.q } }, { description: { contains: params.q } }, { brand: { name: { contains: params.q } } }] } : {}),
      ...(params.category ? { category: { slug: params.category } } : {}),
      ...(params.brand ? { brand: { slug: params.brand } } : {}),
      ...(params.feature === "new" ? { isNew: true } : {}),
      ...(params.feature === "sale" ? { isOnSale: true } : {}),
      ...(params.feature === "bestseller" ? { isBestseller: true } : {}),
    },
    include: { images: { orderBy: { sortOrder: "asc" } }, brand: true, category: true },
    orderBy,
  });

  const makeHref = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { ...params, ...updates };
    Object.entries(merged).forEach(([key, value]) => { if (value) next.set(key, value); });
    const query = next.toString();
    return `/catalog${query ? `?${query}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-[1560px] px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-black/45">EsExpress selection</p><h1 className="mt-5 font-display text-7xl leading-[.85] tracking-[-0.06em] sm:text-8xl">Каталог</h1></div>
        <p className="max-w-2xl text-sm leading-7 text-black/60 lg:justify-self-end">Коллекция формируется не количеством, а точностью выбора. Любую позицию, которой нет в каталоге, можно заказать через личного менеджера.</p>
      </div>

      <form className="mt-12 flex flex-col gap-3 rounded-[1.5rem] border border-black/10 bg-white/45 p-3 sm:flex-row" action="/catalog">
        <div className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" /><Input name="q" defaultValue={params.q} placeholder="Поиск по товарам и брендам" className="border-0 bg-white pl-11" /></div>
        <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-black px-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"><Search className="h-4 w-4" /> Искать</button>
      </form>

      <div className="mt-7 flex flex-wrap gap-2">
        <Link href={makeHref({ category: undefined, brand: undefined, feature: undefined })} className={cn("rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em]", !params.category && !params.brand && !params.feature ? "border-black bg-black text-white" : "border-black/15")}>Все</Link>
        <Link href={makeHref({ feature: "new" })} className={cn("rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em]", params.feature === "new" ? "border-black bg-black text-white" : "border-black/15")}>Новинки</Link>
        <Link href={makeHref({ feature: "bestseller" })} className={cn("rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em]", params.feature === "bestseller" ? "border-black bg-black text-white" : "border-black/15")}>Хиты</Link>
        <Link href={makeHref({ feature: "sale" })} className={cn("rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em]", params.feature === "sale" ? "border-black bg-black text-white" : "border-black/15")}>Акции</Link>
        {categories.map((category: import("@/lib/types").Category) => <Link key={category.id} href={makeHref({ category: category.slug, feature: undefined })} className={cn("rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em]", params.category === category.slug ? "border-black bg-black text-white" : "border-black/15")}>{category.name}</Link>)}
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/40">Бренды</p>
          <div className="mt-5 flex flex-col gap-3 text-sm">
            <Link href={makeHref({ brand: undefined })} className={!params.brand ? "font-semibold" : "text-black/55"}>Все бренды</Link>
            {brands.map((brand: import("@/lib/types").Brand) => <Link key={brand.id} href={makeHref({ brand: brand.slug })} className={params.brand === brand.slug ? "font-semibold" : "text-black/55 hover:text-black"}>{brand.name}</Link>)}
          </div>
        </aside>
        <div>
          <div className="mb-6 flex items-center justify-between"><p className="text-sm text-black/55">Найдено: {products.length}</p>{params.q ? <Link href="/catalog" className="text-xs underline underline-offset-4">Сбросить поиск</Link> : null}</div>
          {products.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 xl:grid-cols-3">{products.map((product: import("@/lib/types").Product & { brand: import("@/lib/types").Brand; images: import("@/lib/types").ProductImage[] }) => <ProductCard key={product.id} product={product} />)}</div> : <div className="rounded-[2rem] border border-black/10 p-12 text-center"><h2 className="font-display text-4xl">Ничего не найдено</h2><p className="mt-4 text-sm text-black/55">Попробуйте изменить фильтры или отправьте персональный запрос менеджеру.</p></div>}
        </div>
      </div>
    </div>
  );
}
