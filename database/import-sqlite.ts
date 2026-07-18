import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { schemaStatements } from "../src/lib/schema";

type ExportRow = Record<string, string | number | null>;
type ExportData = Record<string, ExportRow[]>;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Add the Neon PostgreSQL connection string to .env.");
}
if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
  throw new Error("DATABASE_URL must point to Neon PostgreSQL.");
}

const tableColumns: Record<string, string[]> = {
  admin_users: ["id", "email", "name", "password_hash", "created_at", "updated_at"],
  categories: ["id", "name", "slug", "description", "image", "sort_order", "is_active", "created_at", "updated_at"],
  brands: ["id", "name", "slug", "description", "logo", "sort_order", "is_active", "created_at", "updated_at"],
  products: [
    "id", "name", "slug", "sku", "short_description", "description", "price", "compare_at_price", "currency", "stock",
    "status", "is_new", "is_featured", "is_bestseller", "is_on_sale", "seo_title", "seo_description", "category_id", "brand_id",
    "created_at", "updated_at",
  ],
  product_images: ["id", "url", "alt", "sort_order", "product_id"],
  banners: [
    "id", "eyebrow", "title", "subtitle", "image", "cta_label", "cta_href", "theme", "position", "is_active", "created_at", "updated_at",
  ],
  reviews: ["id", "author", "city", "rating", "text", "is_approved", "product_id", "created_at", "updated_at"],
  site_settings: [
    "id", "store_name", "tagline", "announcement", "telegram_username", "channel_username", "hero_eyebrow", "hero_title", "hero_text",
    "founder_title", "founder_text", "seo_title", "seo_description", "footer_text", "updated_at",
  ],
};

const tableOrder = [
  "admin_users",
  "categories",
  "brands",
  "products",
  "product_images",
  "banners",
  "reviews",
  "site_settings",
];

const exportPath = path.join(process.cwd(), "database", "sqlite-export.json");
const exportedData = JSON.parse(await readFile(exportPath, "utf8")) as ExportData;
const sql = neon(databaseUrl);

for (const statement of schemaStatements) {
  await sql.query(statement);
}

for (const table of tableOrder) {
  const columns = tableColumns[table];
  const rows = exportedData[table] ?? [];
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
  const updates = columns
    .filter((column) => column !== "id")
    .map((column) => `${column} = EXCLUDED.${column}`)
    .join(", ");
  const query = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${updates}`;

  for (const row of rows) {
    await sql.query(query, columns.map((column) => row[column] ?? null));
  }

  console.log(`${table}: imported ${rows.length}`);
}

console.log("SQLite export imported into Neon successfully.");
