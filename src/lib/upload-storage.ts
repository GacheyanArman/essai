import "server-only";

import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { access, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const UPLOAD_DIRECTORY = path.join(process.cwd(), "data", "uploads");

const extensionByContentType = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

const contentTypeByExtension = new Map([
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
  ["avif", "image/avif"],
]);

function isSafeFilename(filename: string) {
  return /^[a-f0-9]{64}\.(?:jpg|jpeg|png|webp|avif)$/i.test(filename)
    || /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:jpg|jpeg|png|webp|avif)$/i.test(filename);
}

export function filenameFromUploadUrl(url: string) {
  if (!url.startsWith("/uploads/")) return null;
  const filename = url.slice("/uploads/".length);
  return isSafeFilename(filename) ? filename : null;
}

export function contentTypeForUpload(filename: string) {
  const extension = path.extname(filename).slice(1).toLowerCase();
  return contentTypeByExtension.get(extension) ?? "application/octet-stream";
}

export async function saveImages(files: File[]) {
  await mkdir(UPLOAD_DIRECTORY, { recursive: true });
  const savedUrls = new Set<string>();

  for (const file of files) {
    if (!file || file.size === 0) continue;

    const extension = extensionByContentType.get(file.type);
    if (!extension) throw new Error(`Формат ${file.type || file.name} не поддерживается`);
    if (file.size > MAX_IMAGE_SIZE) throw new Error("Один файл не должен превышать 10 МБ");

    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = createHash("sha256").update(buffer).digest("hex");
    const filename = `${hash}.${extension}`;
    const destination = path.join(UPLOAD_DIRECTORY, filename);

    try {
      await writeFile(destination, buffer, { flag: "wx" });
    } catch (error) {
      const code = error instanceof Error && "code" in error ? String(error.code) : "";
      if (code !== "EEXIST") throw error;
    }

    savedUrls.add(`/uploads/${filename}`);
  }

  return [...savedUrls];
}

export async function readStoredUpload(filename: string) {
  if (!isSafeFilename(filename)) return null;
  try {
    const buffer = await readFile(path.join(UPLOAD_DIRECTORY, filename));
    return { buffer, contentType: contentTypeForUpload(filename) };
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : "";
    if (code === "ENOENT") return null;
    throw error;
  }
}

export async function removeStoredUpload(url: string) {
  const filename = filenameFromUploadUrl(url);
  if (!filename) return;
  try {
    await unlink(path.join(UPLOAD_DIRECTORY, filename));
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : "";
    if (code !== "ENOENT") throw error;
  }
}

export async function storedUploadExists(url: string) {
  const filename = filenameFromUploadUrl(url);
  if (!filename) return false;
  try {
    await access(path.join(UPLOAD_DIRECTORY, filename), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
