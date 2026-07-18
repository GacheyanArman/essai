import "dotenv/config";

import { hash } from "bcryptjs";
import { db, initializeDatabase } from "../src/lib/db";

const ADMIN_EMAIL = "admin@esexpress.local";

function requiredPassword() {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password || password.includes("REPLACE_WITH") || password.length < 20) {
    throw new Error("Set ADMIN_PASSWORD to a new password containing at least 20 characters.");
  }
  return password;
}

async function main() {
  await initializeDatabase();
  const user = await db.adminUser.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!user) {
    throw new Error("Administrator does not exist yet. Run npm run db:seed first.");
  }

  await db.adminUser.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      passwordHash: await hash(requiredPassword(), 12),
      sessionVersion: user.sessionVersion + 1,
    },
    create: {},
  });

  console.log("Administrator password changed and all existing sessions revoked.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
