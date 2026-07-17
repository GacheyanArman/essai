import { notFound } from "next/navigation";
import { Notice, PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { db } from "@/lib/store-db";

type Params = Promise<{ id: string }>; type SearchParams = Promise<{ saved?: string }>;
export default async function EditProductPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [product, categories, brands] = await Promise.all([db.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }), db.category.findMany({ orderBy: { name: "asc" } }), db.brand.findMany({ orderBy: { name: "asc" } })]);
  if (!product) notFound();
  return <><PageHeader title="Редактирование" text={product.name} /><Notice type={query.saved ? "saved" : undefined} /><ProductForm product={product} categories={categories} brands={brands} /></>;
}
