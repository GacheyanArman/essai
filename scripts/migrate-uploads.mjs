import "dotenv/config";

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@libsql/client";

const root = process.cwd();
const sourceDirectory = path.join(root, "public", "uploads");
const destinationDirectory = path.join(root, "data", "uploads");
const databaseUrl = process.env.DATABASE_URL ?? "file:./data/esexpress.db";
const supportedExtensions = new Set(["jpg", "jpeg", "png", "webp", "avif"]);

await mkdir(destinationDirectory, { recursive: true });

if (!existsSync(sourceDirectory)) {
  console.log("No public/uploads directory found. Nothing to migrate.");
  process.exit(0);
}

const entries = await readdir(sourceDirectory, { withFileTypes: true });
const files = entries.filter((entry) => entry.isFile());
const replacements = new Map();
let copied = 0;
let deduplicated = 0;

for (const entry of files) {
  const extension = path.extname(entry.name).slice(1).toLowerCase();
  if (!supportedExtensions.has(extension)) continue;

  const sourcePath = path.join(sourceDirectory, entry.name);
  const buffer = await readFile(sourcePath);
  const hash = createHash("sha256").update(buffer).digest("hex");
  const normalizedExtension = extension === "jpeg" ? "jpg" : extension;
  const destinationName = `${hash}.${normalizedExtension}`;
  const destinationPath = path.join(destinationDirectory, destinationName);

  try {
    await writeFile(destinationPath, buffer, { flag: "wx" });
    copied += 1;
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "EEXIST") throw error;
    deduplicated += 1;
  }

  replacements.set(`/uploads/${entry.name}`, `/uploads/${destinationName}`);
}

if (replacements.size && existsSync(path.join(root, "data", "esexpress.db"))) {
  const client = createClient({ url: databaseUrl });
  try {
    for (const [oldUrl, newUrl] of replacements) {
      await client.batch([
        { sql: "UPDATE product_images SET url = ? WHERE url = ?", args: [newUrl, oldUrl] },
        { sql: "UPDATE categories SET image = ? WHERE image = ?", args: [newUrl, oldUrl] },
        { sql: "UPDATE brands SET logo = ? WHERE logo = ?", args: [newUrl, oldUrl] },
        { sql: "UPDATE banners SET image = ? WHERE image = ?", args: [newUrl, oldUrl] },
      ], "write");
    }
  } finally {
    client.close();
  }
}

for (const entry of files) {
  await rm(path.join(sourceDirectory, entry.name), { force: true });
}

console.log(`Uploads migrated: ${copied} unique files, ${deduplicated} duplicates reused.`);
console.log(`Runtime upload directory: ${destinationDirectory}`);
