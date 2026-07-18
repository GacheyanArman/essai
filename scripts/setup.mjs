import { existsSync, copyFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
if (!existsSync(join(root, ".env"))) {
  copyFileSync(join(root, ".env.example"), join(root, ".env"));
  console.log("Created .env from .env.example");
}

mkdirSync(join(root, "data", "uploads"), { recursive: true });

const migration = spawnSync(process.execPath, ["scripts/migrate-uploads.mjs"], { stdio: "inherit" });
if (migration.status !== 0) process.exit(migration.status ?? 1);

const seed = spawnSync("npx", ["tsx", "database/seed.ts"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (seed.status !== 0) process.exit(seed.status ?? 1);

console.log("\nEsExpress is ready. Run: npm run dev");
console.log("Admin: /admin/login (credentials are in .env)");
