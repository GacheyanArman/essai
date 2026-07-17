import { db } from "@/lib/store-db";

export async function getSettings() {
  return db.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });
}

export async function getFeaturedProducts(limit = 8) {
  return db.product.findMany({
    where: { status: "published", isFeatured: true },
    include: { images: { orderBy: { sortOrder: "asc" } }, brand: true, category: true },
    orderBy: [{ isBestseller: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}
