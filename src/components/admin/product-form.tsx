"use client";

import Image from "next/image";
import { useTransition } from "react";
import type { Brand, Category, Product, ProductImage } from "@/lib/types";
import { createProduct, updateProduct } from "@/app/admin/actions";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45">{label}</span>{children}{hint ? <span className="mt-2 block text-xs text-black/35">{hint}</span> : null}</label>;
}

export function ProductForm({ product, categories, brands }: { product?: Product & { images: ProductImage[] }; categories: Category[]; brands: Brand[] }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const action = product ? updateProduct : createProduct;
      await action(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <div className="space-y-6">
        <section className="rounded-[1.5rem] border border-black/10 bg-white/75 p-5 sm:p-7">
          <h2 className="font-display text-3xl tracking-[-0.035em]">Основная информация</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Название"><Input name="name" required defaultValue={product?.name} /></Field>
            <Field label="Статус"><select name="status" defaultValue={product?.status ?? "published"} className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none"><option value="published">Опубликован</option><option value="draft">Черновик</option><option value="archived">Архив</option></select></Field>
          </div>
          <div className="mt-5"><Field label="Короткое описание"><Textarea name="shortDescription" defaultValue={product?.shortDescription} className="min-h-24" /></Field></div>
          <div className="mt-5"><Field label="Полное описание"><Textarea name="description" defaultValue={product?.description} className="min-h-52" /></Field></div>
        </section>

        <section className="rounded-[1.5rem] border border-black/10 bg-white/75 p-5 sm:p-7">
          <h2 className="font-display text-3xl tracking-[-0.035em]">Фотографии</h2>
          {product?.images.length ? <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{product.images.map((image) => <label key={image.id} className="relative overflow-hidden rounded-xl border border-black/10 bg-[#eee] p-2"><div className="relative aspect-square overflow-hidden rounded-lg"><Image src={image.url} alt={image.alt || product.name} fill className="object-cover" /></div><span className="mt-2 flex items-center gap-2 text-xs"><input type="checkbox" name="removeImages" value={image.id} /> Удалить</span></label>)}</div> : null}
          <Field label="Добавить фотографии" hint="JPEG, PNG, WebP, AVIF или HEIC, до 50 МБ каждая. Можно выбрать несколько файлов."><Input type="file" name="images" accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif" multiple className="mt-6 h-auto py-3" /></Field>
        </section>


      </div>

      <aside className="space-y-6">
        <section className="rounded-[1.5rem] border border-black/10 bg-white/75 p-5 sm:p-6">
          <h2 className="font-display text-3xl tracking-[-0.035em]">Продажа</h2>
          <div className="mt-6 space-y-5">
            <Field label="Цена, ₽"><Input type="number" min="0" name="price" required defaultValue={product?.price} /></Field>
            <Field label="Старая цена, ₽"><Input type="number" min="0" name="compareAtPrice" defaultValue={product?.compareAtPrice ?? ""} /></Field>
            <Field label="Валюта"><Input name="currency" defaultValue={product?.currency ?? "RUB"} /></Field>
            <Field label="Остаток"><Input type="number" min="0" name="stock" defaultValue={product?.stock ?? 0} /></Field>
          </div>
        </section>
        <section className="rounded-[1.5rem] border border-black/10 bg-white/75 p-5 sm:p-6">
          <h2 className="font-display text-3xl tracking-[-0.035em]">Классификация</h2>
          <div className="mt-6 space-y-5">
            <Field label="Категория"><select name="categoryId" required defaultValue={product?.categoryId} className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
            <Field label="Бренд"><select name="brandId" required defaultValue={product?.brandId} className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none">{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></Field>
          </div>
        </section>
        <section className="rounded-[1.5rem] border border-black/10 bg-white/75 p-5 sm:p-6">
          <h2 className="font-display text-3xl tracking-[-0.035em]">Метки</h2>
          <div className="mt-5 space-y-3">{[["isNew", "Новинка", product?.isNew], ["isFeatured", "На главной", product?.isFeatured], ["isBestseller", "Хит продаж", product?.isBestseller], ["isOnSale", "Акция", product?.isOnSale]].map(([name, label, checked]) => <label key={String(name)} className="flex items-center gap-3 rounded-xl border border-black/10 p-3 text-sm"><input type="checkbox" name={String(name)} defaultChecked={Boolean(checked)} />{String(label)}</label>)}</div>
        </section>
        <Button className="w-full" type="submit" disabled={isPending}>{isPending ? "Сохранение..." : product ? "Сохранить товар" : "Создать товар"}</Button>
      </aside>
    </form>
  );
}
