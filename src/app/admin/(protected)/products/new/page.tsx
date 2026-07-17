import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/page-header";
import { db } from "@/lib/store-db";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([db.category.findMany({ orderBy: { name: "asc" } }), db.brand.findMany({ orderBy: { name: "asc" } })]);
  return <><PageHeader title="Новый товар" /><ProductForm categories={categories} brands={brands} /></>;
}
