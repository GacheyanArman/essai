import "dotenv/config";

import { db, initializeDatabase } from "../src/lib/db";
import { hash } from "bcryptjs";


async function main() {
  await initializeDatabase();
  // The admin panel intentionally uses a single password-only account.
  const email = "admin@esexpress.local";
  const password = process.env.ADMIN_PASSWORD ?? "EsExpress2026!";
  await db.adminUser.upsert({ where: { email }, update: { name: "EsExpress Admin", passwordHash: await hash(password, 12) }, create: { email, name: "EsExpress Admin", passwordHash: await hash(password, 12) } });
  await db.siteSettings.upsert({ where: { id: "main" }, update: {}, create: { id: "main" } });

  // Only essential setup is done here so you can add everything manually through the admin panel.
  console.log(`Seed complete. Admin: ${email}`);
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => db.$disconnect());
