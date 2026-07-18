import "dotenv/config";

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
const envPath = join(root, ".env");

if (!existsSync(envPath)) {
  copyFileSync(join(root, ".env.example"), envPath);
  console.log("Created .env from .env.example");
  console.log("Run npm run security:generate, copy the generated values to .env, then run npm run setup again.");
  process.exit(0);
}

const envContents = readFileSync(envPath, "utf8");
if (!/DATABASE_URL\s*=\s*["']?postgres(?:ql)?:\/\//.test(envContents) || envContents.includes("USER:PASSWORD@HOST")) {
  console.error("Set a real Neon PostgreSQL DATABASE_URL in .env before running setup.");
  process.exit(1);
}

const sessionSecret = process.env.SESSION_SECRET?.trim() ?? "";
const adminPassword = process.env.ADMIN_PASSWORD?.trim() ?? "";

if (sessionSecret.includes("REPLACE_WITH") || Buffer.byteLength(sessionSecret, "utf8") < 32) {
  console.error("SESSION_SECRET must contain at least 32 random bytes.");
  process.exit(1);
}
if (adminPassword.includes("REPLACE_WITH") || adminPassword.length < 20) {
  console.error("ADMIN_PASSWORD must contain at least 20 characters.");
  process.exit(1);
}

mkdirSync(join(root, "data", "uploads"), { recursive: true });

const seed = spawnSync("npx", ["tsx", "database/seed.ts"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (seed.status !== 0) process.exit(seed.status ?? 1);

const migration = spawnSync(process.execPath, ["scripts/migrate-uploads.mjs"], { stdio: "inherit" });
if (migration.status !== 0) process.exit(migration.status ?? 1);

console.log("\nEsExpress is ready. Run: npm run dev");
console.log("Admin: /admin/login (password is required)");
