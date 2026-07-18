import "dotenv/config";

import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set.");
if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
  throw new Error("DATABASE_URL must point to Neon PostgreSQL.");
}

const sql = neon(databaseUrl);
await sql.query("TRUNCATE TABLE product_images, products, brands, categories, banners, reviews CASCADE");
console.log("Catalog, banners, and reviews were removed. Admin user and site settings were kept.");
