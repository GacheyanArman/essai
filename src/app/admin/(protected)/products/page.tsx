import Image from "next/image";
import Link from "next/link";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/admin/actions";
import { Notice, PageHeader } from "@/components/admin/page-header";
import { ButtonLink } from "@/components/ui/button";
import { db } from "@/lib/store-db";
import { formatPrice } from "@/lib/utils";

type SearchParams = Promise<{ saved?: string; deleted?: string }>;
export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const products = await db.product.findMany({ include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } }, orderBy: { updatedAt: "desc" } });
  return <><PageHeader title="Товары" text="Управление ассортиментом, ценами, фотографиями и товарными метками." action={<ButtonLink href="/admin/products/new"><Plus className="h-4 w-4" /> Добавить товар</ButtonLink>} /><Notice type={params.deleted ? "deleted" : params.saved ? "saved" : undefined} />
    <div className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-white/75"><div className="hidden grid-cols-[70px_1fr_160px_140px_120px] gap-4 border-b border-black/10 px-5 py-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-black/40 md:grid"><span>Фото</span><span>Товар</span><span>Категория</span><span>Цена</span><span>Действия</span></div><div className="divide-y divide-black/10">{products.map((product: import("@/lib/types").Product & { brand: import("@/lib/types").Brand; category: import("@/lib/types").Category; images: import("@/lib/types").ProductImage[] }) => <div key={product.id} className="grid gap-4 p-4 md:grid-cols-[70px_1fr_160px_140px_120px] md:items-center md:px-5"><div className="relative h-16 w-16 overflow-hidden rounded-xl bg-[#eee]"><Image src={product.images[0]?.url || "/media/logo-card.webp"} alt={product.name} fill className="object-cover" /></div><div><p className="text-sm font-medium">{product.name}</p><p className="mt-1 text-xs text-black/40">{product.brand.name} · {product.sku} · {product.status}</p></div><p className="text-sm text-black/55">{product.category.name}</p><p className="text-sm">{formatPrice(product.price, product.currency)}</p><div className="flex gap-2"><Link href={`/admin/products/${product.id}/edit`} className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 hover:bg-black hover:text-white" aria-label="Редактировать"><Edit3 className="h-4 w-4" /></Link><form action={deleteProduct}><input type="hidden" name="id" value={product.id} /><button className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 hover:bg-red-600 hover:text-white" aria-label="Удалить"><Trash2 className="h-4 w-4" /></button></form></div></div>)}</div></div>
  </>;
}
