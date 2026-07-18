"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Brand, Category, Product, ProductImage } from "@/lib/types";
import { createProduct, updateProduct } from "@/app/admin/actions";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45">{label}</span>{children}{hint ? <span className="mt-2 block text-xs text-black/35">{hint}</span> : null}</label>;
}

export function ProductForm({ product, categories, brands }: { product?: Product & { images: ProductImage[] }; categories: Category[]; brands: Brand[] }) {
  const action = product ? updateProduct : createProduct;
  const router = useRouter();
  const [selectedImages, setSelectedImages] = useState<{ file: File; previewUrl: string }[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [imageError, setImageError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const uploadInFlightRef = useRef(false);
  const selectedImagesRef = useRef(selectedImages);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  const syncImageInput = (files: File[]) => {
    if (!imageInputRef.current) return;
    const dt = new DataTransfer();
    files.forEach((file) => dt.items.add(file));
    imageInputRef.current.files = dt.files;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");
    setSuccessMessage("");
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setImageError("Только изображения");
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setImageError("Файл слишком большой (максимум 10 МБ)");
        continue;
      }
      validFiles.push(file);
    }
    
    setSelectedImages((prev) => {
      const next = [...prev, ...validFiles.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))];
      syncImageInput(next.map(({ file }) => file));
      return next;
    });
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].previewUrl);
      next.splice(index, 1);
      syncImageInput(next.map(({ file }) => file));
      return next;
    });
  };

  const submitProduct = async (formData: FormData, newUrls: string[] = []) => {
    newUrls.forEach((url) => formData.append("newImageUrls", url));
    setIsSaving(true);
    setSuccessMessage("");
    setUploadError("");
    try {
      const result = await action(formData);
      if (result && ('success' in result || 'redirectTo' in result)) {
        setSuccessMessage("Товар успешно сохранён!");
        if (!product) {
          formRef.current?.reset();
          setSelectedImages([]);
          setUploadedUrls([]);
          syncImageInput([]);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        if ('redirectTo' in result && result.redirectTo) {
           router.push(result.redirectTo);
        }
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Не удалось сохранить товар.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (selectedImagesRef.current.length === 0) {
      return submitProduct(formData);
    }

    if (uploadInFlightRef.current) return;
    uploadInFlightRef.current = true;
    setIsUploading(true);
    setUploadError("");

    try {
      const uploadData = new FormData();
      selectedImagesRef.current.forEach(({ file }) => uploadData.append("files", file));
      const uploadRes = await fetch("/api/admin/uploads", { method: "POST", body: uploadData });
      
      if (!uploadRes.ok) {
        const errJson = await uploadRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Ошибка загрузки фотографий на сервер");
      }
      
      const { urls } = await uploadRes.json();
      setUploadedUrls((prev) => [...prev, ...urls]);
      submitProduct(formData, urls);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Ошибка загрузки фотографий");
    } finally {
      uploadInFlightRef.current = false;
      setIsUploading(false);
    }
  };

  const visibleError = imageError || uploadError;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      {uploadedUrls.map((url) => <input key={url} type="hidden" name="newImageUrls" value={url} />)}

      <div className="space-y-6">
        {successMessage && (
          <div className="rounded-xl border border-green-200 bg-green-50/50 p-6 shadow-sm">
            <p className="font-medium text-green-800">{successMessage}</p>
          </div>
        )}
        
        {visibleError && (
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-6 shadow-sm">
            <p className="font-medium text-red-800">{visibleError}</p>
          </div>
        )}

        <section className="rounded-[1.5rem] border border-black/10 bg-white/75 p-5 sm:p-7">
          <h2 className="font-display text-3xl tracking-[-0.035em]">Основная информация</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Название"><Input name="name" required defaultValue={product?.name} disabled={isUploading || isSaving} /></Field>
            <Field label="Статус">
              <select name="status" defaultValue={product?.status ?? "published"} disabled={isUploading || isSaving} className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none">
                <option value="published">Опубликован</option>
                <option value="draft">Черновик</option>
                <option value="archived">Архив</option>
              </select>
            </Field>
          </div>
          <div className="mt-5"><Field label="Описание"><Textarea name="description" defaultValue={product?.description} disabled={isUploading || isSaving} className="min-h-52" /></Field></div>
        </section>

        <section className="rounded-[1.5rem] border border-black/10 bg-white/75 p-5 sm:p-7">
          <h2 className="font-display text-3xl tracking-[-0.035em]">Фотографии</h2>
          
          {product?.images.length ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {product.images.map((image) => (
                <label key={image.id} className="relative overflow-hidden rounded-xl border border-black/10 bg-[#eee] p-2">
                  <div className="relative aspect-square overflow-hidden rounded-lg">
                    <Image src={image.url} alt={image.alt || product.name} fill sizes="200px" className="object-cover" />
                  </div>
                  <span className="mt-2 flex items-center gap-2 text-xs">
                    <input type="checkbox" name="removeImages" value={image.id} disabled={isUploading || isSaving} /> Удалить
                  </span>
                </label>
              ))}
            </div>
          ) : null}
          
          {selectedImages.length > 0 && (
             <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
               {selectedImages.map((img, idx) => (
                 <div key={idx} className="relative overflow-hidden rounded-xl border border-black/10 bg-[#eee] p-2">
                   <div className="relative aspect-square overflow-hidden rounded-lg">
                     <Image src={img.previewUrl} alt="Preview" fill sizes="200px" className="object-cover" />
                   </div>
                   <button type="button" onClick={() => removeSelectedImage(idx)} disabled={isUploading || isSaving} className="mt-2 text-xs text-red-600 hover:underline">Удалить</button>
                 </div>
               ))}
             </div>
          )}

          <Field label="Добавить фотографии" hint="JPEG, PNG, WebP, AVIF или HEIC, до 10 МБ каждая. Можно выбрать несколько файлов.">
            <Input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif" multiple disabled={isUploading || isSaving} className="mt-6 h-auto py-3" />
          </Field>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-[1.5rem] border border-black/10 bg-white/75 p-5 sm:p-6">
          <h2 className="font-display text-3xl tracking-[-0.035em]">Продажа</h2>
          <div className="mt-6 space-y-5">
            <Field label="Цена, ₽"><Input type="number" min="0" name="price" required defaultValue={product?.price} disabled={isUploading || isSaving} /></Field>
            <Field label="Старая цена, ₽"><Input type="number" min="0" name="compareAtPrice" defaultValue={product?.compareAtPrice ?? ""} disabled={isUploading || isSaving} /></Field>
            <Field label="Валюта"><Input name="currency" defaultValue={product?.currency ?? "RUB"} disabled={isUploading || isSaving} /></Field>
            <Field label="Остаток"><Input type="number" min="0" name="stock" defaultValue={product?.stock ?? 0} disabled={isUploading || isSaving} /></Field>
          </div>
        </section>
        
        <section className="rounded-[1.5rem] border border-black/10 bg-white/75 p-5 sm:p-6">
          <h2 className="font-display text-3xl tracking-[-0.035em]">Классификация</h2>
          <div className="mt-6 space-y-5">
            <Field label="Категория">
              <select name="categoryId" required defaultValue={product?.categoryId} disabled={isUploading || isSaving} className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none">
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </Field>
            <Field label="Бренд">
              <select name="brandId" required defaultValue={product?.brandId} disabled={isUploading || isSaving} className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none">
                {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
              </select>
            </Field>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-black/10 bg-white/75 p-5 sm:p-6">
          <h2 className="font-display text-3xl tracking-[-0.035em]">Метки</h2>
          <div className="mt-5 space-y-3">
            {[["isNew", "Новинка", product?.isNew], ["isFeatured", "На главной", product?.isFeatured], ["isBestseller", "Хит продаж", product?.isBestseller], ["isOnSale", "Акция", product?.isOnSale]].map(([name, label, checked]) => (
              <label key={String(name)} className="flex items-center gap-3 rounded-xl border border-black/10 p-3 text-sm">
                <input type="checkbox" name={String(name)} defaultChecked={Boolean(checked)} disabled={isUploading || isSaving} />
                {String(label)}
              </label>
            ))}
          </div>
        </section>
        
        <Button className="w-full" type="submit" disabled={isUploading || isSaving}>
          {isUploading ? "Загрузка фото..." : isSaving ? "Сохранение..." : product ? "Сохранить товар" : "Создать товар"}
        </Button>
      </aside>
    </form>
  );
}
