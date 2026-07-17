import { db, initializeDatabase } from "../src/lib/db";
import { hash } from "bcryptjs";


async function main() {
  await initializeDatabase();
  const email = process.env.ADMIN_EMAIL ?? "admin@esexpress.local";
  const password = process.env.ADMIN_PASSWORD ?? "EsExpress2026!";
  await db.adminUser.upsert({ where: { email }, update: { name: "EsExpress Admin", passwordHash: await hash(password, 12) }, create: { email, name: "EsExpress Admin", passwordHash: await hash(password, 12) } });
  await db.siteSettings.upsert({ where: { id: "main" }, update: {}, create: { id: "main" } });

  const categoriesData = [
    { name: "Парфюмерия", slug: "parfyumeriya", image: "/media/perfume-amouage.webp", sortOrder: 1, description: "Нишевая и люксовая парфюмерия." },
    { name: "Обувь", slug: "obuv", image: "/media/sneaker-tiger.webp", sortOrder: 2, description: "Редкие пары и актуальные силуэты." },
    { name: "Аксессуары", slug: "aksessuary", image: "/media/glasses-pink.webp", sortOrder: 3, description: "Очки, часы, сумки и детали образа." },
    { name: "Одежда", slug: "odezhda", image: "/media/lookbook-men.webp", sortOrder: 4, description: "Мужские и женские образы." },
  ];
  for (const category of categoriesData) await db.category.upsert({ where: { slug: category.slug }, update: category, create: category });

  const brandsData = ["Духи", "Колаж", "Off-White", "Onitsuka Tiger", "Chrome Hearts", "Maison Margiela"].map((name, index) => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, "-").replace(/^-|-$/g, ""), sortOrder: index + 1 }));
  for (const brand of brandsData) await db.brand.upsert({ where: { slug: brand.slug }, update: brand, create: brand });

  const categoryMap = Object.fromEntries((await db.category.findMany()).map((x: { slug: string; id: string }) => [x.slug, x.id]));
  const brandMap = Object.fromEntries((await db.brand.findMany()).map((x: { slug: string; id: string }) => [x.slug, x.id]));
  const products = [
    { name: "Духи Crimson Rocks", slug: "dukhi-crimson-rocks", sku: "ES-DK-001", price: 21900, compareAtPrice: 28900, brand: "духи", category: "parfyumeriya", image: "/media/perfume-amouage.webp", shortDescription: "Тёплая композиция с корицей, розой, мёдом и древесными нотами.", description: "Crimson Rocks — насыщенный аромат с выразительным характером. Подходит для прохладного сезона и вечерних образов.", isFeatured: true, isBestseller: true, isOnSale: true },
    { name: "Колаж Classic Paradise", slug: "kolazh-classic-paradise", sku: "ES-KL-002", price: 17400, brand: "колаж", category: "parfyumeriya", image: "/media/perfume-bois.webp", shortDescription: "Цитрусово-древесный аромат с пудровыми, пряными и ванильными акцентами.", description: "Универсальная нишевая композиция с чистым цитрусовым стартом и мягкой древесно-пудровой базой.", isFeatured: true, isNew: true },
    { name: "Off-White Out Of Office White", slug: "off-white-out-of-office-white", sku: "ES-OW-003", price: 48900, compareAtPrice: 55900, brand: "off-white", category: "obuv", image: "/media/sneaker-offwhite.webp", shortDescription: "Белые кожаные кеды с фирменной графикой и индустриальной биркой.", description: "Знаковый силуэт Off-White для повседневных образов. Доступность размеров уточняется у менеджера.", isFeatured: true, isBestseller: true, isOnSale: true },
    { name: "Onitsuka Tiger Mexico 66", slug: "onitsuka-tiger-mexico-66-green", sku: "ES-OT-004", price: 22900, brand: "onitsuka-tiger", category: "obuv", image: "/media/sneaker-tiger.webp", shortDescription: "Культовая пара в молочно-зелёной палитре с замшевыми деталями.", description: "Лёгкий ретро-силуэт для спокойного премиального casual. Размер и наличие подтверждает менеджер.", isFeatured: true, isNew: true },
    { name: "Chrome Hearts Tinted Frame", slug: "chrome-hearts-tinted-frame", sku: "ES-CH-005", price: 112000, brand: "chrome-hearts", category: "aksessuary", image: "/media/glasses-yellow.webp", shortDescription: "Массивная чёрная оправа с цветными линзами и узнаваемыми металлическими деталями.", description: "Редкая аксессуарная позиция. Конкретную модель, цвет линз и комплект уточняйте перед заказом.", isFeatured: true, isBestseller: true },
    { name: "Maison Margiela Geometric Glasses", slug: "maison-margiela-geometric-glasses", sku: "ES-MM-006", price: 46900, brand: "maison-margiela", category: "aksessuary", image: "/media/glasses-pink.webp", shortDescription: "Геометричная бордовая оправа с розовыми линзами.", description: "Акцентные очки с выразительной архитектурой оправы. Доступность уточняется у менеджера.", isFeatured: true, isNew: true },
    { name: "Колаж Leather Cardholder", slug: "kolazh-leather-cardholder", sku: "ES-KL-007", price: 29900, brand: "колаж", category: "aksessuary", image: "/media/lookbook-men.webp", shortDescription: "Чёрный кожаный кардхолдер с лаконичным золотым тиснением.", description: "Компактный аксессуар из фактурной кожи. Может быть заказан отдельно или как часть персональной подборки.", isFeatured: true },
    { name: "EsExpress Personal Look", slug: "esexpress-personal-look", sku: "ES-LOOK-008", price: 0, brand: "колаж", category: "odezhda", image: "/media/lookbook-women.webp", shortDescription: "Персональная подборка полного образа под ваш запрос и бюджет.", description: "Отправьте референс менеджеру — мы подберём оригинальные позиции, проверим наличие и соберём финальную стоимость.", isFeatured: true, isNew: true },
  ];
  for (const item of products) {
    const { brand, category, image, ...data } = item;
    const existing = await db.product.findUnique({ where: { slug: data.slug } });
    const product = existing
      ? await db.product.update({ where: { id: existing.id }, data: { ...data, price: data.price, categoryId: categoryMap[category], brandId: brandMap[brand] } })
      : await db.product.create({ data: { ...data, price: data.price, categoryId: categoryMap[category], brandId: brandMap[brand] } });
    const imageExists = await db.productImage.findFirst({ where: { productId: product.id, url: image } });
    if (!imageExists) await db.productImage.create({ data: { productId: product.id, url: image, alt: data.name, sortOrder: 0 } });
  }

  if ((await db.banner.count()) === 0) await db.banner.create({ data: { eyebrow: "SCENT EDIT · PRIVATE SELECTION", title: "Аромат как личная подпись", subtitle: "Нишевые композиции, которые редко встречаются на обычной витрине. Проверенный оригинал и бережная доставка.", image: "/media/perfume-amouage.webp", ctaLabel: "Смотреть ароматы", ctaHref: "/catalog?category=parfyumeriya", position: 1 } });
  if ((await db.review.count()) === 0) await db.review.createMany({ data: [
    { author: "Анна", city: "Москва", rating: 5, text: "Нашли редкий аромат дешевле, чем в бутике. Упаковка идеальная, менеджер был на связи на каждом этапе.", isApproved: true },
    { author: "Максим", city: "Казань", rating: 5, text: "Заказывал кроссовки, которых нигде не было в моём размере. Всё прозрачно: ссылка на магазин, сроки и фото перед отправкой.", isApproved: true },
    { author: "Екатерина", city: "Санкт-Петербург", rating: 5, text: "Очень понравился подход — не просто продали, а помогли выбрать и честно объяснили разницу между вариантами.", isApproved: true },
  ] });
  console.log(`Seed complete. Admin: ${email}`);
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => db.$disconnect());