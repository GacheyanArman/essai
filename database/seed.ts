import "dotenv/config";

import { hash } from "bcryptjs";
import { db, initializeDatabase } from "../src/lib/db";

const ADMIN_EMAIL = "admin@esexpress.local";

function requiredAdminPassword() {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) throw new Error("ADMIN_PASSWORD is required.");
  if (password.includes("REPLACE_WITH")) throw new Error("ADMIN_PASSWORD still contains a placeholder value.");
  if (password.length < 20) {
    throw new Error("ADMIN_PASSWORD must contain at least 20 characters.");
  }
  return password;
}

async function main() {
  await initializeDatabase();
  const password = requiredAdminPassword();
  const existing = await db.adminUser.findUnique({ where: { email: ADMIN_EMAIL } });
  const passwordHash = await hash(password, 12);

  await db.adminUser.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "EsExpress Admin",
      passwordHash,
      sessionVersion: (existing?.sessionVersion ?? 0) + 1,
    },
    create: {
      email: ADMIN_EMAIL,
      name: "EsExpress Admin",
      passwordHash,
      sessionVersion: 1,
    },
  });

  await db.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });

  console.log(`Seed complete. Admin: ${ADMIN_EMAIL}. All previous sessions were revoked.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
