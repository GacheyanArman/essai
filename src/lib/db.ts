/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { schemaStatements } from "@/lib/schema";
import type { AdminUser, Banner, Brand, Category, Product, ProductImage, Review, SiteSettings } from "@/lib/types";

type Row = Record<string, unknown>;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Copy the PostgreSQL connection string from Neon Console → Connect and add it to .env.",
  );
}

if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
  throw new Error("DATABASE_URL must be a PostgreSQL connection string from Neon, not a Turso/libSQL or file: URL.");
}

const sql = neon(databaseUrl, { fullResults: true });
const globalDb = globalThis as unknown as { esexpressInit?: Promise<void> };

function toPostgresPlaceholders(query: string) {
  let index = 0;
  return query.replace(/\?/g, () => `$${++index}`);
}

async function ensureReady() {
  if (!globalDb.esexpressInit) {
    globalDb.esexpressInit = (async () => {
      for (const statement of schemaStatements) {
        await sql.query(statement, [], { fullResults: true });
      }
    })().catch((error) => {
      globalDb.esexpressInit = undefined;
      throw error;
    });
  }
  await globalDb.esexpressInit;
}

async function execute(query: string, args: any[] = []) {
  await ensureReady();
  return sql.query(toPostgresPlaceholders(query), args, { fullResults: true });
}

function id() { return randomUUID().replaceAll("-", ""); }
function now() { return new Date().toISOString(); }
function date(value: unknown) { return new Date(String(value)); }
function bool(value: unknown) { return Number(value) === 1 || value === true; }
function num(value: unknown) { return value == null ? 0 : Number(value); }
function nullableNum(value: unknown) { return value == null ? null : Number(value); }
function text(value: unknown) { return value == null ? "" : String(value); }

function mapAdmin(row: Row): AdminUser {
  return {
    id: text(row.id),
    email: text(row.email),
    name: text(row.name),
    passwordHash: text(row.password_hash),
    sessionVersion: num(row.session_version) || 1,
    createdAt: date(row.created_at),
    updatedAt: date(row.updated_at),
  };
}
function mapCategory(row: Row): Category {
  return { id: text(row.id), name: text(row.name), slug: text(row.slug), description: text(row.description), image: text(row.image), sortOrder: num(row.sort_order), isActive: bool(row.is_active), createdAt: date(row.created_at), updatedAt: date(row.updated_at) };
}
function mapBrand(row: Row): Brand {
  return { id: text(row.id), name: text(row.name), slug: text(row.slug), description: text(row.description), logo: text(row.logo), sortOrder: num(row.sort_order), isActive: bool(row.is_active), createdAt: date(row.created_at), updatedAt: date(row.updated_at) };
}
function mapProduct(row: Row): Product {
  return {
    id: text(row.id), name: text(row.name), slug: text(row.slug), sku: text(row.sku), shortDescription: text(row.short_description), description: text(row.description),
    price: num(row.price), compareAtPrice: nullableNum(row.compare_at_price), currency: text(row.currency), stock: num(row.stock), status: text(row.status),
    isNew: bool(row.is_new), isFeatured: bool(row.is_featured), isBestseller: bool(row.is_bestseller), isOnSale: bool(row.is_on_sale),
    seoTitle: text(row.seo_title), seoDescription: text(row.seo_description), categoryId: text(row.category_id), brandId: text(row.brand_id),
    createdAt: date(row.created_at), updatedAt: date(row.updated_at),
  };
}
function mapImage(row: Row): ProductImage { return { id: text(row.id), url: text(row.url), alt: text(row.alt), sortOrder: num(row.sort_order), productId: text(row.product_id) }; }
function mapBanner(row: Row): Banner { return { id: text(row.id), eyebrow: text(row.eyebrow), title: text(row.title), subtitle: text(row.subtitle), image: text(row.image), ctaLabel: text(row.cta_label), ctaHref: text(row.cta_href), theme: text(row.theme), position: num(row.position), isActive: bool(row.is_active), createdAt: date(row.created_at), updatedAt: date(row.updated_at) }; }
function mapReview(row: Row): Review { return { id: text(row.id), author: text(row.author), city: text(row.city), rating: num(row.rating), text: text(row.text), isApproved: bool(row.is_approved), productId: row.product_id == null ? null : text(row.product_id), createdAt: date(row.created_at), updatedAt: date(row.updated_at) }; }
function mapSettings(row: Row): SiteSettings { return { id: text(row.id), storeName: text(row.store_name), tagline: text(row.tagline), announcement: text(row.announcement), telegramUsername: text(row.telegram_username), channelUsername: text(row.channel_username), heroEyebrow: text(row.hero_eyebrow), heroTitle: text(row.hero_title), heroText: text(row.hero_text), founderTitle: text(row.founder_title), founderText: text(row.founder_text), seoTitle: text(row.seo_title), seoDescription: text(row.seo_description), footerText: text(row.footer_text), updatedAt: date(row.updated_at) }; }

async function allCategories() { return (await execute("SELECT * FROM categories")).rows.map(mapCategory); }
async function allBrands() { return (await execute("SELECT * FROM brands")).rows.map(mapBrand); }
async function allProducts() { return (await execute("SELECT * FROM products")).rows.map(mapProduct); }
async function allImages() { return (await execute("SELECT * FROM product_images")).rows.map(mapImage); }
async function allBanners() { return (await execute("SELECT * FROM banners")).rows.map(mapBanner); }
async function allReviews() { return (await execute("SELECT * FROM reviews")).rows.map(mapReview); }

function matchesText(value: string, condition: unknown) {
  if (condition && typeof condition === "object" && "contains" in condition) return value.toLocaleLowerCase("ru").includes(String((condition as { contains: unknown }).contains).toLocaleLowerCase("ru"));
  return value === String(condition);
}

function matchesProductCondition(condition: Record<string, any>, product: Product, brands: Map<string, Brand>, categories: Map<string, Category>): boolean {
  for (const [key, expected] of Object.entries(condition)) {
    if (key === "OR") {
      if (!Array.isArray(expected) || !expected.some((item) => matchesProductCondition(item, product, brands, categories))) return false;
      continue;
    }
    if (key === "id") {
      if (expected && typeof expected === "object" && "not" in expected) { if (product.id === expected.not) return false; }
      else if (product.id !== expected) return false;
      continue;
    }
    if (key === "slug" && product.slug !== expected) return false;
    if (key === "sku" && product.sku !== expected) return false;
    if (key === "name" && !matchesText(product.name, expected)) return false;
    if (key === "description" && !matchesText(product.description, expected)) return false;
    if (key === "shortDescription" && !matchesText(product.shortDescription, expected)) return false;
    if (key === "status" && product.status !== expected) return false;
    if (key === "categoryId" && product.categoryId !== expected) return false;
    if (key === "brandId" && product.brandId !== expected) return false;
    if (["isNew", "isFeatured", "isBestseller", "isOnSale"].includes(key) && (product as any)[key] !== expected) return false;
    if (key === "category") {
      const category = categories.get(product.categoryId);
      if (!category || (expected.slug && category.slug !== expected.slug)) return false;
    }
    if (key === "brand") {
      const brand = brands.get(product.brandId);
      if (!brand) return false;
      if (expected.slug && brand.slug !== expected.slug) return false;
      if (expected.name && !matchesText(brand.name, expected.name)) return false;
    }
  }
  return true;
}

function sortRecords<T extends Record<string, any>>(items: T[], orderBy: any): T[] {
  if (!orderBy) return items;
  const rules = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...items].sort((a, b) => {
    for (const rule of rules) {
      const [key, direction] = Object.entries(rule)[0] as [string, any];
      const av = a[key] instanceof Date ? a[key].getTime() : a[key];
      const bv = b[key] instanceof Date ? b[key].getTime() : b[key];
      if (av < bv) return direction === "desc" ? 1 : -1;
      if (av > bv) return direction === "desc" ? -1 : 1;
    }
    return 0;
  });
}

async function includeProducts(items: Product[], include: any) {
  if (!include) return items;
  const [brands, categories, images] = await Promise.all([allBrands(), allCategories(), allImages()]);
  const brandMap = new Map(brands.map((item) => [item.id, item]));
  const categoryMap = new Map(categories.map((item) => [item.id, item]));
  return items.map((product) => {
    const output: any = { ...product };
    if (include.brand) output.brand = brandMap.get(product.brandId) ?? null;
    if (include.category) output.category = categoryMap.get(product.categoryId) ?? null;
    if (include.images) {
      let productImages = images.filter((image) => image.productId === product.id);
      productImages = sortRecords(productImages as any, include.images.orderBy) as ProductImage[];
      if (include.images.take) productImages = productImages.slice(0, include.images.take);
      output.images = productImages;
    }
    return output;
  });
}

const settingsDefaults: Omit<SiteSettings, "updatedAt"> = {
  id: "main",
  storeName: "EsExpress",
  tagline: "Ваш проводник в мир зарубежного шоппинга",
  announcement: "Оригинальные вещи и ароматы из Европы и Китая",
  telegramUsername: "EsExpress_Manager",
  channelUsername: "esexpresss",
  heroEyebrow: "PRIVATE SOURCING · MOSCOW",
  heroTitle: "Редкие вещи. Честная цена. Личный сервис.",
  heroText: "Выкупаем оригинальные позиции у официальных брендов и ритейлеров. Сопровождаем заказ до момента, когда он окажется у вас в руках.",
  founderTitle: "Создано из личного опыта",
  founderText: "EsExpress появился, чтобы сделать оригинальный стиль доступнее, прозрачнее и спокойнее — без лишних посредников и космических наценок.",
  seoTitle: "EsExpress — оригинальные бренды и нишевая парфюмерия",
  seoDescription: "Оригинальная одежда, обувь, аксессуары и нишевая парфюмерия из Европы и Китая с доставкой по России.",
  footerText: "Оригинальные позиции мировых брендов без лишних посредников.",
};

export const db: any = {
  adminUser: {
    async findUnique({ where }: any) {
      const key = where.email ? "email" : "id";
      const result = await execute(`SELECT * FROM admin_users WHERE ${key} = ? LIMIT 1`, [where[key]]);
      return result.rows[0] ? mapAdmin(result.rows[0]) : null;
    },
    async upsert({ where, update, create }: any) {
      const existing = await this.findUnique({ where });
      const stamp = now();
      if (existing) {
        const data = { ...existing, ...update, updatedAt: new Date(stamp) };
        await execute(
          "UPDATE admin_users SET email=?, name=?, password_hash=?, session_version=?, updated_at=? WHERE id=?",
          [data.email, data.name, data.passwordHash, data.sessionVersion, stamp, existing.id],
        );
        return { ...data };
      }
      const record: AdminUser = {
        id: create.id ?? id(),
        email: create.email,
        name: create.name,
        passwordHash: create.passwordHash,
        sessionVersion: create.sessionVersion ?? 1,
        createdAt: new Date(stamp),
        updatedAt: new Date(stamp),
      };
      await execute(
        "INSERT INTO admin_users (id,email,name,password_hash,session_version,created_at,updated_at) VALUES (?,?,?,?,?,?,?)",
        [record.id, record.email, record.name, record.passwordHash, record.sessionVersion, stamp, stamp],
      );
      return record;
    },
    async incrementSessionVersion({ where }: any) {
      const result = await execute(
        "UPDATE admin_users SET session_version=session_version+1, updated_at=? WHERE id=? RETURNING *",
        [now(), where.id],
      );
      return result.rows[0] ? mapAdmin(result.rows[0]) : null;
    },
  },
  authLoginAttempt: {
    async findUnique({ where }: any) {
      const result = await execute("SELECT * FROM auth_login_attempts WHERE key_hash=? LIMIT 1", [where.keyHash]);
      const row = result.rows[0];
      if (!row) return null;
      return {
        keyHash: text(row.key_hash),
        failedAttempts: num(row.failed_attempts),
        windowStartedAt: date(row.window_started_at),
        blockedUntil: row.blocked_until == null ? null : date(row.blocked_until),
        updatedAt: date(row.updated_at),
      };
    },
    async upsert({ where, update, create }: any) {
      const record = { ...create, ...update, keyHash: where.keyHash, updatedAt: update.updatedAt ?? create.updatedAt ?? new Date() };
      await execute(
        `INSERT INTO auth_login_attempts (key_hash,failed_attempts,window_started_at,blocked_until,updated_at)
         VALUES (?,?,?,?,?)
         ON CONFLICT (key_hash) DO UPDATE SET failed_attempts=EXCLUDED.failed_attempts, window_started_at=EXCLUDED.window_started_at, blocked_until=EXCLUDED.blocked_until, updated_at=EXCLUDED.updated_at`,
        [record.keyHash, record.failedAttempts, record.windowStartedAt.toISOString(), record.blockedUntil?.toISOString() ?? null, record.updatedAt.toISOString()],
      );
      return record;
    },
    async recordFailure({ keyHash, now: currentTime, windowStartedBefore, blockedUntil, maxFailures }: any) {
      const nowIso = currentTime.toISOString();
      const cutoffIso = windowStartedBefore.toISOString();
      const blockIso = blockedUntil.toISOString();
      const resetCondition = `(auth_login_attempts.window_started_at <= ? OR (auth_login_attempts.blocked_until IS NOT NULL AND auth_login_attempts.blocked_until <= ?))`;
      const nextAttempts = `(CASE WHEN ${resetCondition} THEN 1 ELSE auth_login_attempts.failed_attempts + 1 END)`;
      const result = await execute(
        `INSERT INTO auth_login_attempts (key_hash,failed_attempts,window_started_at,blocked_until,updated_at)
         VALUES (?,1,?,NULL,?)
         ON CONFLICT (key_hash) DO UPDATE SET
           failed_attempts=${nextAttempts},
           window_started_at=CASE WHEN ${resetCondition} THEN ? ELSE auth_login_attempts.window_started_at END,
           blocked_until=CASE
             WHEN auth_login_attempts.blocked_until IS NOT NULL AND auth_login_attempts.blocked_until > ? THEN auth_login_attempts.blocked_until
             WHEN ${nextAttempts} >= ? THEN ?
             ELSE NULL
           END,
           updated_at=?
         RETURNING *`,
        [
          keyHash, nowIso, nowIso,
          cutoffIso, nowIso,
          cutoffIso, nowIso, nowIso,
          nowIso,
          cutoffIso, nowIso, maxFailures, blockIso,
          nowIso,
        ],
      );
      const row = result.rows[0];
      return {
        keyHash: text(row.key_hash),
        failedAttempts: num(row.failed_attempts),
        windowStartedAt: date(row.window_started_at),
        blockedUntil: row.blocked_until == null ? null : date(row.blocked_until),
        updatedAt: date(row.updated_at),
      };
    },
    async deleteMany({ where }: any) {
      const keys: string[] = where.keyHash?.in ?? [];
      for (const key of keys) await execute("DELETE FROM auth_login_attempts WHERE key_hash=?", [key]);
      return { count: keys.length };
    },
    async deleteExpired({ before }: any) {
      await execute("DELETE FROM auth_login_attempts WHERE updated_at < ?", [before.toISOString()]);
    },
  },
  category: {
    async findMany(args: any = {}) {
      let items: any[] = await allCategories();
      if (args.where?.isActive !== undefined) items = items.filter((item) => item.isActive === args.where.isActive);
      items = sortRecords(items, args.orderBy);
      if (args.take) items = items.slice(0, args.take);
      if (args.include?._count) {
        const products = await allProducts();
        items = items.map((item) => ({ ...item, _count: { products: products.filter((product) => product.categoryId === item.id).length } }));
      }
      return items;
    },
    async findFirst({ where }: any) {
      const items = await allCategories(); return items.find((item) => item.slug === where.slug && (!where.id?.not || item.id !== where.id.not)) ?? null;
    },
    async count() { return (await allCategories()).length; },
    async create({ data }: any) {
      const stamp = now(); const record: Category = { id: data.id ?? id(), name: data.name, slug: data.slug, description: data.description ?? "", image: data.image ?? "", sortOrder: data.sortOrder ?? 0, isActive: data.isActive ?? true, createdAt: new Date(stamp), updatedAt: new Date(stamp) };
      await execute("INSERT INTO categories (id,name,slug,description,image,sort_order,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)", [record.id,record.name,record.slug,record.description,record.image,record.sortOrder,record.isActive?1:0,stamp,stamp]); return record;
    },
    async update({ where, data }: any) {
      const existing = (await allCategories()).find((item) => item.id === where.id); if (!existing) throw new Error("Category not found"); const record = { ...existing, ...data, updatedAt: new Date() };
      await execute("UPDATE categories SET name=?,slug=?,description=?,image=?,sort_order=?,is_active=?,updated_at=? WHERE id=?", [record.name,record.slug,record.description,record.image,record.sortOrder,record.isActive?1:0,record.updatedAt.toISOString(),record.id]); return record;
    },
    async delete({ where }: any) { await execute("DELETE FROM categories WHERE id=?", [where.id]); },
    async upsert({ where, update, create }: any) { const existing = (await allCategories()).find((item) => item.slug === where.slug); return existing ? this.update({ where: { id: existing.id }, data: update }) : this.create({ data: create }); },
  },
  brand: {
    async findMany(args: any = {}) {
      let items: any[] = await allBrands(); if (args.where?.isActive !== undefined) items = items.filter((item) => item.isActive === args.where.isActive); items = sortRecords(items, args.orderBy); if (args.take) items = items.slice(0,args.take);
      if (args.include?._count) { const products = await allProducts(); items = items.map((item) => ({ ...item, _count: { products: products.filter((product) => product.brandId === item.id).length } })); }
      return items;
    },
    async findFirst({ where }: any) { const items = await allBrands(); return items.find((item) => item.slug === where.slug && (!where.id?.not || item.id !== where.id.not)) ?? null; },
    async count() { return (await allBrands()).length; },
    async create({ data }: any) { const stamp=now(); const record:Brand={id:data.id??id(),name:data.name,slug:data.slug,description:data.description??"",logo:data.logo??"",sortOrder:data.sortOrder??0,isActive:data.isActive??true,createdAt:new Date(stamp),updatedAt:new Date(stamp)}; await execute("INSERT INTO brands (id,name,slug,description,logo,sort_order,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)",[record.id,record.name,record.slug,record.description,record.logo,record.sortOrder,record.isActive?1:0,stamp,stamp]); return record; },
    async update({where,data}:any){const existing=(await allBrands()).find((item)=>item.id===where.id);if(!existing)throw new Error("Brand not found");const record={...existing,...data,updatedAt:new Date()};await execute("UPDATE brands SET name=?,slug=?,description=?,logo=?,sort_order=?,is_active=?,updated_at=? WHERE id=?",[record.name,record.slug,record.description,record.logo,record.sortOrder,record.isActive?1:0,record.updatedAt.toISOString(),record.id]);return record;},
    async delete({where}:any){await execute("DELETE FROM brands WHERE id=?",[where.id]);},
    async upsert({where,update,create}:any){const existing=(await allBrands()).find((item)=>item.slug===where.slug);return existing?this.update({where:{id:existing.id},data:update}):this.create({data:create});},
  },
  product: {
    async findMany(args: any = {}) {
      let items: any[] = await allProducts();
      const [brands, categories] = await Promise.all([allBrands(), allCategories()]); const brandMap=new Map(brands.map((item)=>[item.id,item])); const categoryMap=new Map(categories.map((item)=>[item.id,item]));
      if (args.where) items = items.filter((item) => matchesProductCondition(args.where, item, brandMap, categoryMap));
      items = sortRecords(items, args.orderBy); if (args.take) items=items.slice(0,args.take);
      if (args.select) return items.map((item) => Object.fromEntries(Object.keys(args.select).filter((key)=>args.select[key]).map((key)=>[key,item[key]])));
      return includeProducts(items, args.include);
    },
    async findUnique({ where, include }: any) { const products=await allProducts(); const item=products.find((product)=>where.id?product.id===where.id:product.slug===where.slug); if(!item)return null; return (await includeProducts([item],include))[0]; },
    async findFirst({where}:any){return (await this.findMany({where,take:1}))[0]??null;},
    async count(args:any={}){return (await this.findMany({where:args.where})).length;},
    async create({data}:any){const stamp=now();const nested=data.images?.create??[];const record:Product={id:data.id??id(),name:data.name,slug:data.slug,sku:data.sku,shortDescription:data.shortDescription??"",description:data.description??"",price:data.price,compareAtPrice:data.compareAtPrice??null,currency:data.currency??"RUB",stock:data.stock??0,status:data.status??"published",isNew:data.isNew??false,isFeatured:data.isFeatured??false,isBestseller:data.isBestseller??false,isOnSale:data.isOnSale??false,seoTitle:data.seoTitle??"",seoDescription:data.seoDescription??"",categoryId:data.categoryId,brandId:data.brandId,createdAt:new Date(stamp),updatedAt:new Date(stamp)};await execute("INSERT INTO products (id,name,slug,sku,short_description,description,price,compare_at_price,currency,stock,status,is_new,is_featured,is_bestseller,is_on_sale,seo_title,seo_description,category_id,brand_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[record.id,record.name,record.slug,record.sku,record.shortDescription,record.description,record.price,record.compareAtPrice,record.currency,record.stock,record.status,record.isNew?1:0,record.isFeatured?1:0,record.isBestseller?1:0,record.isOnSale?1:0,record.seoTitle,record.seoDescription,record.categoryId,record.brandId,stamp,stamp]);for(const image of nested)await db.productImage.create({data:{...image,productId:record.id}});return record;},
    async update({where,data}:any){const existing=await this.findUnique({where});if(!existing)throw new Error("Product not found");const nested=data.images?.create??[];const clean={...data};delete clean.images;const record={...existing,...clean,updatedAt:new Date()};await execute("UPDATE products SET name=?,slug=?,sku=?,short_description=?,description=?,price=?,compare_at_price=?,currency=?,stock=?,status=?,is_new=?,is_featured=?,is_bestseller=?,is_on_sale=?,seo_title=?,seo_description=?,category_id=?,brand_id=?,updated_at=? WHERE id=?",[record.name,record.slug,record.sku,record.shortDescription,record.description,record.price,record.compareAtPrice,record.currency,record.stock,record.status,record.isNew?1:0,record.isFeatured?1:0,record.isBestseller?1:0,record.isOnSale?1:0,record.seoTitle,record.seoDescription,record.categoryId,record.brandId,record.updatedAt.toISOString(),record.id]);for(const image of nested)await db.productImage.create({data:{...image,productId:record.id}});return record;},
    async delete({where}:any){await execute("DELETE FROM products WHERE id=?",[where.id]);},
  },
  productImage: {
    async findFirst({where}:any){const images=await allImages();return images.find((image)=>(where.productId===undefined||image.productId===where.productId)&&(where.url===undefined||image.url===where.url))??null;},
    async create({data}:any){const record:ProductImage={id:data.id??id(),url:data.url,alt:data.alt??"",sortOrder:data.sortOrder??0,productId:data.productId};await execute("INSERT INTO product_images (id,url,alt,sort_order,product_id) VALUES (?,?,?,?,?)",[record.id,record.url,record.alt,record.sortOrder,record.productId]);return record;},
    async deleteMany({where}:any){let images=await allImages();images=images.filter((image)=>(!where.productId||image.productId===where.productId)&&(!where.id?.in||where.id.in.includes(image.id)));for(const image of images)await execute("DELETE FROM product_images WHERE id=?",[image.id]);return{count:images.length};},
  },
  banner: {
    async findMany(args:any={}){let items:any[]=await allBanners();if(args.where?.isActive!==undefined)items=items.filter((item)=>item.isActive===args.where.isActive);items=sortRecords(items,args.orderBy);if(args.take)items=items.slice(0,args.take);return items;},
    async count(args:any={}){return (await this.findMany(args)).length;},
    async create({data}:any){const stamp=now();const record:Banner={id:data.id??id(),eyebrow:data.eyebrow??"",title:data.title,subtitle:data.subtitle??"",image:data.image,ctaLabel:data.ctaLabel??"Смотреть коллекцию",ctaHref:data.ctaHref??"/catalog",theme:data.theme??"dark",position:data.position??0,isActive:data.isActive??true,createdAt:new Date(stamp),updatedAt:new Date(stamp)};await execute("INSERT INTO banners (id,eyebrow,title,subtitle,image,cta_label,cta_href,theme,position,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",[record.id,record.eyebrow,record.title,record.subtitle,record.image,record.ctaLabel,record.ctaHref,record.theme,record.position,record.isActive?1:0,stamp,stamp]);return record;},
    async update({where,data}:any){const existing=(await allBanners()).find((item)=>item.id===where.id);if(!existing)throw new Error("Banner not found");const record={...existing,...data,updatedAt:new Date()};await execute("UPDATE banners SET eyebrow=?,title=?,subtitle=?,image=?,cta_label=?,cta_href=?,theme=?,position=?,is_active=?,updated_at=? WHERE id=?",[record.eyebrow,record.title,record.subtitle,record.image,record.ctaLabel,record.ctaHref,record.theme,record.position,record.isActive?1:0,record.updatedAt.toISOString(),record.id]);return record;},
    async delete({where}:any){await execute("DELETE FROM banners WHERE id=?",[where.id]);},
  },
  review: {
    async findMany(args:any={}){let items:any[]=await allReviews();if(args.where?.isApproved!==undefined)items=items.filter((item)=>item.isApproved===args.where.isApproved);items=sortRecords(items,args.orderBy);if(args.take)items=items.slice(0,args.take);if(args.include?.product){const products=await allProducts();const map=new Map(products.map((item)=>[item.id,item]));items=items.map((item)=>({...item,product:item.productId?map.get(item.productId)??null:null}));}return items;},
    async findUnique({where}:any){return (await allReviews()).find((item)=>item.id===where.id)??null;},
    async count(args:any={}){return (await this.findMany(args)).length;},
    async create({data}:any){const stamp=now();const record:Review={id:data.id??id(),author:data.author,city:data.city??"",rating:data.rating??5,text:data.text,isApproved:data.isApproved??false,productId:data.productId??null,createdAt:new Date(stamp),updatedAt:new Date(stamp)};await execute("INSERT INTO reviews (id,author,city,rating,text,is_approved,product_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)",[record.id,record.author,record.city,record.rating,record.text,record.isApproved?1:0,record.productId,stamp,stamp]);return record;},
    async createMany({data}:any){for(const record of data)await this.create({data:record});return{count:data.length};},
    async update({where,data}:any){const existing=await this.findUnique({where});if(!existing)throw new Error("Review not found");const record={...existing,...data,updatedAt:new Date()};await execute("UPDATE reviews SET author=?,city=?,rating=?,text=?,is_approved=?,product_id=?,updated_at=? WHERE id=?",[record.author,record.city,record.rating,record.text,record.isApproved?1:0,record.productId,record.updatedAt.toISOString(),record.id]);return record;},
    async delete({where}:any){await execute("DELETE FROM reviews WHERE id=?",[where.id]);},
  },
  siteSettings: {
    async upsert({ where, update, create }: any) {
      const result = await execute("SELECT * FROM site_settings WHERE id=? LIMIT 1", [where.id]);
      if (result.rows[0]) {
        const existing = mapSettings(result.rows[0]);
        if (!Object.keys(update).length) return existing;
        const record = { ...existing, ...update, updatedAt: new Date() };
        await execute("UPDATE site_settings SET store_name=?,tagline=?,announcement=?,telegram_username=?,channel_username=?,hero_eyebrow=?,hero_title=?,hero_text=?,founder_title=?,founder_text=?,seo_title=?,seo_description=?,footer_text=?,updated_at=? WHERE id=?", [record.storeName, record.tagline, record.announcement, record.telegramUsername, record.channelUsername, record.heroEyebrow, record.heroTitle, record.heroText, record.founderTitle, record.founderText, record.seoTitle, record.seoDescription, record.footerText, record.updatedAt.toISOString(), record.id]);
        return record;
      }

      const stamp = now();
      const record = { ...settingsDefaults, ...create, id: create.id ?? where.id ?? "main", updatedAt: new Date(stamp) };
      const fields: Record<string, string> = {
        storeName: "store_name", tagline: "tagline", announcement: "announcement", telegramUsername: "telegram_username", channelUsername: "channel_username", heroEyebrow: "hero_eyebrow", heroTitle: "hero_title", heroText: "hero_text", founderTitle: "founder_title", founderText: "founder_text", seoTitle: "seo_title", seoDescription: "seo_description", footerText: "footer_text",
      };
      const conflictFields = Object.keys(update).filter((field) => field in fields);
      const onConflict = conflictFields.length
        ? `DO UPDATE SET ${[...conflictFields.map((field) => `${fields[field]}=EXCLUDED.${fields[field]}`), "updated_at=EXCLUDED.updated_at"].join(", ")}`
        : "DO UPDATE SET id=site_settings.id";

      const persisted = await execute(
        `INSERT INTO site_settings (id,store_name,tagline,announcement,telegram_username,channel_username,hero_eyebrow,hero_title,hero_text,founder_title,founder_text,seo_title,seo_description,footer_text,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT (id) ${onConflict} RETURNING *`,
        [record.id, record.storeName, record.tagline, record.announcement, record.telegramUsername, record.channelUsername, record.heroEyebrow, record.heroTitle, record.heroText, record.founderTitle, record.founderText, record.seoTitle, record.seoDescription, record.footerText, stamp],
      );
      return mapSettings(persisted.rows[0]);
    },
  },
  async $transaction(callback:any){return callback(db);},
  async $disconnect(){ /* clients are closed after each query */ },
};

export async function initializeDatabase() { await ensureReady(); }
