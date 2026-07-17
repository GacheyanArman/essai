import Link from "next/link";
import { Boxes, Package, Plus, Tags } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/admin-shell";
import { ButtonLink } from "@/components/ui/button";
import { db } from "@/lib/store-db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [products, published, categories, brands, latest] = await Promise.all([
    db.product.count(), db.product.count({ where: { status: "published" } }), db.category.count(), db.brand.count(),
    db.product.findMany({ include: { brand: true }, orderBy: { updatedAt: "desc" }, take: 6 }),
  ]);
  return <>
    <PageHeader title="Обзор" text="Ключевые показатели каталога и быстрый доступ к основным разделам." action={<ButtonLink href="/admin/products/new"><Plus className="h-4 w-4" /> Добавить товар</ButtonLink>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><StatCard label="Всего товаров" value={products} hint={`${published} опубликовано`} icon={Package} /><StatCard label="Категории" value={categories} icon={Boxes} /><StatCard label="Бренды" value={brands} icon={Tags} /></div>
    <div className="mt-8">
      <section className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-white/75"><div className="flex items-center justify-between border-b border-black/10 p-6"><h2 className="font-display text-3xl tracking-[-0.035em]">Последние товары</h2><Link href="/admin/products" className="text-xs underline underline-offset-4">Все товары</Link></div><div className="divide-y divide-black/10">{latest.map((product: import("@/lib/types").Product & { brand: import("@/lib/types").Brand }) => <Link key={product.id} href={`/admin/products/${product.id}/edit`} className="grid grid-cols-[1fr_auto] gap-4 p-5 transition hover:bg-black/[.025]"><div><p className="text-sm font-medium">{product.name}</p><p className="mt-1 text-xs text-black/40">{product.brand.name} · {product.status}</p></div><p className="text-sm">{formatPrice(product.price, product.currency)}</p></Link>)}</div></section>
    </div>
  </>;
}
