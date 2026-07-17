import { existsSync, copyFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
if (!existsSync(join(root, ".env"))) {
  copyFileSync(join(root, ".env.example"), join(root, ".env"));
  console.log("Created .env from .env.example");
}
mkdirSync(join(root, "public", "uploads"), { recursive: true });
mkdirSync(join(root, "data"), { recursive: true });
const result = spawnSync("npx", ["tsx", "database/seed.ts"], { stdio: "inherit", shell: process.platform === "win32" });
if (result.status !== 0) process.exit(result.status ?? 1);
console.log("\nEsExpress is ready. Run: npm run dev");
console.log("Admin: /admin/login (credentials are in .env)");
