import type { MetadataRoute } from "next";
import { db } from "@/lib/store-db";
import { getSiteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const products = await db.product.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } });
  const staticPages = ["", "/catalog", "/about", "/delivery", "/contacts"].map((path) => ({ url: `${site}${path}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: path === "" ? 1 : .7 }));
  return [...staticPages, ...products.map((product: { slug: string; updatedAt: Date }) => ({ url: `${site}/product/${product.slug}`, lastModified: product.updatedAt, changeFrequency: "weekly" as const, priority: .8 }))];
}
