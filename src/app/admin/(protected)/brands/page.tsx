import { Plus, Trash2 } from "lucide-react";
import { createBrand, deleteBrand, updateBrand } from "@/app/admin/actions";
import { Notice, PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { db } from "@/lib/store-db";

type SearchParams = Promise<{ saved?: string; deleted?: string }>;
export const dynamic = "force-dynamic";

export default async function BrandsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const brands = await db.brand.findMany({ include: { _count: { select: { products: true } } }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return <><PageHeader title="Бренды" text="Справочник брендов, используемый в каталоге и фильтрах." /><Notice type={params.deleted ? "deleted" : params.saved ? "saved" : undefined} />
    <details className="mb-6 rounded-[1.5rem] border border-black/10 bg-white/75 p-5 open:pb-7"><summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium"><Plus className="h-4 w-4" /> Добавить бренд</summary><form action={createBrand} className="mt-6 grid gap-4 md:grid-cols-2"><Input name="name" required placeholder="Название" /><Input name="slug" placeholder="Slug" /><Input name="logo" placeholder="URL логотипа" /><Input type="file" name="logoFile" accept="image/*" className="h-auto py-3" /><Input type="number" name="sortOrder" defaultValue="0" /><label className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-4 text-sm"><input type="checkbox" name="isActive" defaultChecked /> Активен</label><Textarea name="description" placeholder="Описание" className="md:col-span-2" /><Button className="md:col-span-2">Создать бренд</Button></form></details>
    <div className="grid gap-4 xl:grid-cols-2">{brands.map((brand: import("@/lib/types").Brand & { _count: { products: number } }) => <details key={brand.id} className="rounded-[1.5rem] border border-black/10 bg-white/75 p-5 open:pb-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-4"><div><h2 className="font-display text-3xl tracking-[-0.035em]">{brand.name}</h2><p className="mt-1 text-xs text-black/40">/{brand.slug} · {brand._count.products} товаров</p></div><span className="text-xs text-black/40">Редактировать</span></summary><form action={updateBrand} className="mt-6 grid gap-4 border-t border-black/10 pt-6 sm:grid-cols-2"><input type="hidden" name="id" value={brand.id} /><Input name="name" required defaultValue={brand.name} /><Input name="slug" defaultValue={brand.slug} /><Input name="logo" defaultValue={brand.logo} /><Input type="file" name="logoFile" accept="image/*" className="h-auto py-3" /><Input type="number" name="sortOrder" defaultValue={brand.sortOrder} /><label className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-4 text-sm"><input type="checkbox" name="isActive" defaultChecked={brand.isActive} /> Активен</label><Textarea name="description" defaultValue={brand.description} className="sm:col-span-2" /><Button className="sm:col-span-2">Сохранить</Button></form><form action={deleteBrand} className="mt-3"><input type="hidden" name="id" value={brand.id} /><button className="flex items-center gap-2 text-xs text-red-600"><Trash2 className="h-4 w-4" /> Удалить бренд</button></form></details>)}</div>
  </>;
}
