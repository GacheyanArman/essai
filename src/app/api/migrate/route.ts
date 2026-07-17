import { NextResponse } from "next/server";
import { db } from "@/lib/store-db";

export async function GET() {
  const oldBrand = await db.brand.findFirst({ where: { slug: "коллаж" } });
  if (oldBrand) await db.brand.update({ where: { id: oldBrand.id }, data: { name: "Коллаж", slug: "коллаж" } });
  
  let category = await db.category.findFirst({ where: { slug: "коллаж" } });
  if (!category) await db.category.create({ data: { name: "Коллаж", slug: "коллаж", image: "/media/lookbook-women.webp", description: "Подборки и коллажи." } });

  return NextResponse.json({ success: true });
}
