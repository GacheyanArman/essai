import { db, initializeDatabase } from "../src/lib/db";

async function main() {
  await initializeDatabase();
  console.log("Wiping dummy data...");
  
  // We'll delete all rows from these tables.
  const tables = ["product_images", "products", "brands", "categories", "banners", "reviews"];
  
  for (const table of tables) {
    try {
      await db.$transaction(async (tx: any) => {
        // execute is not exposed directly on tx in a standard way here, let's just use the client.
        // Wait, db in our custom wrapper doesn't have a raw query method exposed easily except if we use execute inside db.ts.
      });
    } catch (e) {
      // ignore
    }
  }
}

main();
