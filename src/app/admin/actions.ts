"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authenticate, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/store-db";
import { slugify } from "@/lib/utils";

function str(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}
function int(formData: FormData, name: string, fallback = 0) {
  const parsed = Number.parseInt(str(formData, name), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function bool(formData: FormData, name: string) { return formData.has(name); }

async function saveImages(files: File[]) {
  const validTypes = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"], ["image/avif", "avif"]]);
  const output: string[] = [];
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  for (const file of files) {
    if (!file || file.size === 0) continue;
    const ext = validTypes.get(file.type);
    if (!ext) throw new Error(`Формат ${file.type || file.name} не поддерживается`);
    if (file.size > 10 * 1024 * 1024) throw new Error("Один файл не должен превышать 10 МБ");
    const filename = `${Date.now()}-${randomUUID()}.${ext}`;
    await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
    output.push(`/uploads/${filename}`);
  }
  return output;
}

async function removeLocalFile(url: string) {
  if (!url.startsWith("/uploads/")) return;
  try { await unlink(path.join(process.cwd(), "public", url)); } catch { /* file may already be absent */ }
}

export async function loginAction(formData: FormData) {
  const email = (process.env.ADMIN_EMAIL ?? "admin@esexpress.local").toLowerCase();
  const password = str(formData, "password");
  const user = await authenticate(email, password);
  if (!user) redirect("/admin/login?error=1");
  await createSession({ sub: user.id, email: user.email, name: user.name });
  redirect("/admin/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

async function uniqueProductSlug(base: string, currentId?: string) {
  let candidate = base || `product-${Date.now()}`;
  let index = 2;
  while (await db.product.findFirst({ where: { slug: candidate, ...(currentId ? { id: { not: currentId } } : {}) }, select: { id: true } })) candidate = `${base}-${index++}`;
  return candidate;
}
async function uniqueCategorySlug(base: string, currentId?: string) {
  let candidate = base || `category-${Date.now()}`; let index = 2;
  while (await db.category.findFirst({ where: { slug: candidate, ...(currentId ? { id: { not: currentId } } : {}) }, select: { id: true } })) candidate = `${base}-${index++}`;
  return candidate;
}
async function uniqueBrandSlug(base: string, currentId?: string) {
  let candidate = base || `brand-${Date.now()}`; let index = 2;
  while (await db.brand.findFirst({ where: { slug: candidate, ...(currentId ? { id: { not: currentId } } : {}) }, select: { id: true } })) candidate = `${base}-${index++}`;
  return candidate;
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const name = str(formData, "name");
  if (!name) throw new Error("Название обязательно");
  const uploaded = await saveImages(formData.getAll("images").filter((value): value is File => value instanceof File));
  const slug = await uniqueProductSlug(slugify(str(formData, "slug") || name));
  const product = await db.product.create({
    data: {
      name, slug, sku: str(formData, "sku") || `ES-${Date.now()}`,
      shortDescription: str(formData, "shortDescription"), description: str(formData, "description"),
      price: int(formData, "price"), compareAtPrice: str(formData, "compareAtPrice") ? int(formData, "compareAtPrice") : null,
      currency: str(formData, "currency") || "RUB", stock: int(formData, "stock"), status: str(formData, "status") || "published",
      isNew: bool(formData, "isNew"), isFeatured: bool(formData, "isFeatured"), isBestseller: bool(formData, "isBestseller"), isOnSale: bool(formData, "isOnSale"),
      seoTitle: str(formData, "seoTitle"), seoDescription: str(formData, "seoDescription"), categoryId: str(formData, "categoryId"), brandId: str(formData, "brandId"),
      images: { create: uploaded.map((url, index) => ({ url, alt: name, sortOrder: index })) },
    },
  });
  revalidatePath("/"); revalidatePath("/catalog");
  redirect(`/admin/products/${product.id}/edit?saved=1`);
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const name = str(formData, "name");
  const current = await db.product.findUnique({ where: { id }, include: { images: true } });
  if (!current) throw new Error("Товар не найден");
  const removeIds = formData.getAll("removeImages").map(String);
  const removed = current.images.filter((image: import("@/lib/types").ProductImage) => removeIds.includes(image.id));
  const uploaded = await saveImages(formData.getAll("images").filter((value): value is File => value instanceof File));
  const slug = await uniqueProductSlug(slugify(str(formData, "slug") || name), id);
  await db.$transaction(async (tx: typeof db) => {
    if (removeIds.length) await tx.productImage.deleteMany({ where: { id: { in: removeIds }, productId: id } });
    const remaining = current.images.filter((image: import("@/lib/types").ProductImage) => !removeIds.includes(image.id));
    await tx.product.update({
      where: { id },
      data: {
        name, slug, sku: str(formData, "sku"), shortDescription: str(formData, "shortDescription"), description: str(formData, "description"),
        price: int(formData, "price"), compareAtPrice: str(formData, "compareAtPrice") ? int(formData, "compareAtPrice") : null,
        currency: str(formData, "currency") || "RUB", stock: int(formData, "stock"), status: str(formData, "status") || "published",
        isNew: bool(formData, "isNew"), isFeatured: bool(formData, "isFeatured"), isBestseller: bool(formData, "isBestseller"), isOnSale: bool(formData, "isOnSale"),
        seoTitle: str(formData, "seoTitle"), seoDescription: str(formData, "seoDescription"), categoryId: str(formData, "categoryId"), brandId: str(formData, "brandId"),
        images: { create: uploaded.map((url, index) => ({ url, alt: name, sortOrder: remaining.length + index })) },
      },
    });
  });
  await Promise.all(removed.map((image: import("@/lib/types").ProductImage) => removeLocalFile(image.url)));
  revalidatePath("/"); revalidatePath("/catalog"); revalidatePath(`/product/${slug}`);
  redirect(`/admin/products/${id}/edit?saved=1`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const product = await db.product.findUnique({ where: { id }, include: { images: true } });
  if (product) { await db.product.delete({ where: { id } }); await Promise.all(product.images.map((image: import("@/lib/types").ProductImage) => removeLocalFile(image.url))); }
  revalidatePath("/"); revalidatePath("/catalog"); redirect("/admin/products?deleted=1");
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = str(formData, "name");
  const [uploaded] = await saveImages(formData.getAll("imageFile").filter((value): value is File => value instanceof File));
  await db.category.create({ data: { name, slug: await uniqueCategorySlug(slugify(str(formData, "slug") || name)), description: str(formData, "description"), image: uploaded || str(formData, "image"), sortOrder: int(formData, "sortOrder"), isActive: bool(formData, "isActive") } });
  revalidatePath("/"); redirect("/admin/categories?saved=1");
}
export async function updateCategory(formData: FormData) {
  await requireAdmin(); const id = str(formData, "id"); const name = str(formData, "name");
  const [uploaded] = await saveImages(formData.getAll("imageFile").filter((value): value is File => value instanceof File));
  await db.category.update({ where: { id }, data: { name, slug: await uniqueCategorySlug(slugify(str(formData, "slug") || name), id), description: str(formData, "description"), image: uploaded || str(formData, "image"), sortOrder: int(formData, "sortOrder"), isActive: bool(formData, "isActive") } });
  revalidatePath("/"); redirect("/admin/categories?saved=1");
}
export async function deleteCategory(formData: FormData) { await requireAdmin(); await db.category.delete({ where: { id: str(formData, "id") } }); revalidatePath("/"); redirect("/admin/categories?deleted=1"); }

export async function createBrand(formData: FormData) {
  await requireAdmin(); const name = str(formData, "name");
  const [uploaded] = await saveImages(formData.getAll("logoFile").filter((value): value is File => value instanceof File));
  await db.brand.create({ data: { name, slug: await uniqueBrandSlug(slugify(str(formData, "slug") || name)), description: str(formData, "description"), logo: uploaded || str(formData, "logo"), sortOrder: int(formData, "sortOrder"), isActive: bool(formData, "isActive") } });
  redirect("/admin/brands?saved=1");
}
export async function updateBrand(formData: FormData) {
  await requireAdmin(); const id = str(formData, "id"); const name = str(formData, "name");
  const [uploaded] = await saveImages(formData.getAll("logoFile").filter((value): value is File => value instanceof File));
  await db.brand.update({ where: { id }, data: { name, slug: await uniqueBrandSlug(slugify(str(formData, "slug") || name), id), description: str(formData, "description"), logo: uploaded || str(formData, "logo"), sortOrder: int(formData, "sortOrder"), isActive: bool(formData, "isActive") } });
  redirect("/admin/brands?saved=1");
}
export async function deleteBrand(formData: FormData) { await requireAdmin(); await db.brand.delete({ where: { id: str(formData, "id") } }); redirect("/admin/brands?deleted=1"); }

export async function createBanner(formData: FormData) {
  await requireAdmin(); const [uploaded] = await saveImages(formData.getAll("imageFile").filter((value): value is File => value instanceof File));
  await db.banner.create({ data: { eyebrow: str(formData, "eyebrow"), title: str(formData, "title"), subtitle: str(formData, "subtitle"), image: uploaded || str(formData, "image"), ctaLabel: str(formData, "ctaLabel") || "Смотреть коллекцию", ctaHref: str(formData, "ctaHref") || "/catalog", theme: str(formData, "theme") || "dark", position: int(formData, "position"), isActive: bool(formData, "isActive") } });
  revalidatePath("/"); redirect("/admin/banners?saved=1");
}
export async function updateBanner(formData: FormData) {
  await requireAdmin(); const id = str(formData, "id"); const [uploaded] = await saveImages(formData.getAll("imageFile").filter((value): value is File => value instanceof File));
  await db.banner.update({ where: { id }, data: { eyebrow: str(formData, "eyebrow"), title: str(formData, "title"), subtitle: str(formData, "subtitle"), image: uploaded || str(formData, "image"), ctaLabel: str(formData, "ctaLabel"), ctaHref: str(formData, "ctaHref"), theme: str(formData, "theme"), position: int(formData, "position"), isActive: bool(formData, "isActive") } });
  revalidatePath("/"); redirect("/admin/banners?saved=1");
}
export async function deleteBanner(formData: FormData) { await requireAdmin(); await db.banner.delete({ where: { id: str(formData, "id") } }); revalidatePath("/"); redirect("/admin/banners?deleted=1"); }

export async function createReview(formData: FormData) {
  await requireAdmin(); await db.review.create({ data: { author: str(formData, "author"), city: str(formData, "city"), rating: Math.min(5, Math.max(1, int(formData, "rating", 5))), text: str(formData, "text"), isApproved: bool(formData, "isApproved") } });
  revalidatePath("/"); redirect("/admin/reviews?saved=1");
}
export async function toggleReview(formData: FormData) { await requireAdmin(); const id = str(formData, "id"); const review = await db.review.findUnique({ where: { id } }); if (review) await db.review.update({ where: { id }, data: { isApproved: !review.isApproved } }); revalidatePath("/"); redirect("/admin/reviews?saved=1"); }
export async function deleteReview(formData: FormData) { await requireAdmin(); await db.review.delete({ where: { id: str(formData, "id") } }); revalidatePath("/"); redirect("/admin/reviews?deleted=1"); }

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  await db.siteSettings.upsert({ where: { id: "main" }, create: { id: "main" }, update: {
    storeName: str(formData, "storeName"), tagline: str(formData, "tagline"), announcement: str(formData, "announcement"), telegramUsername: str(formData, "telegramUsername"), channelUsername: str(formData, "channelUsername"), heroEyebrow: str(formData, "heroEyebrow"), heroTitle: str(formData, "heroTitle"), heroText: str(formData, "heroText"), founderTitle: str(formData, "founderTitle"), founderText: str(formData, "founderText"), seoTitle: str(formData, "seoTitle"), seoDescription: str(formData, "seoDescription"), footerText: str(formData, "footerText"),
  } });
  revalidatePath("/", "layout"); redirect("/admin/home?saved=1");
}
