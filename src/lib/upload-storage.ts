import "server-only";

import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { access, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { BlobNotFoundError, del, head, put } from "@vercel/blob";

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const UPLOAD_DIRECTORY = path.join(process.cwd(), "data", "uploads");
const BLOB_UPLOAD_PREFIX = "uploads/";
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

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

function blobFilenameFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(BLOB_HOST_SUFFIX)) return null;
    const pathname = decodeURIComponent(parsed.pathname).replace(/^\//, "");
    if (!pathname.startsWith(BLOB_UPLOAD_PREFIX)) return null;
    const filename = pathname.slice(BLOB_UPLOAD_PREFIX.length);
    return isSafeFilename(filename) ? filename : null;
  } catch {
    return null;
  }
}

export function isStoredUploadUrl(url: string) {
  return Boolean(filenameFromUploadUrl(url) || blobFilenameFromUrl(url));
}

function blobStorageIsConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function contentTypeForUpload(filename: string) {
  const extension = path.extname(filename).slice(1).toLowerCase();
  return contentTypeByExtension.get(extension) ?? "application/octet-stream";
}

export async function saveImages(files: File[]) {
  const useBlob = blobStorageIsConfigured();
  if (!useBlob) await mkdir(UPLOAD_DIRECTORY, { recursive: true });

  const savedUrls = new Set<string>();

  for (const file of files) {
    if (!file || file.size === 0) continue;

    const extension = extensionByContentType.get(file.type);
    if (!extension) throw new Error(`Формат ${file.type || file.name} не поддерживается`);
    if (file.size > MAX_IMAGE_SIZE) throw new Error("Один файл не должен превышать 10 МБ");

    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = createHash("sha256").update(buffer).digest("hex");
    const filename = `${hash}.${extension}`;

    if (useBlob) {
      const blob = await put(`${BLOB_UPLOAD_PREFIX}${filename}`, buffer, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: false,
      });
      savedUrls.add(blob.url);
    } else {
      const destination = path.join(UPLOAD_DIRECTORY, filename);
      try {
        await writeFile(destination, buffer, { flag: "wx" });
      } catch (error) {
        const code = error instanceof Error && "code" in error ? String(error.code) : "";
        if (code !== "EEXIST") throw error;
      }
      savedUrls.add(`/uploads/${filename}`);
    }
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
  const blobFilename = blobFilenameFromUrl(url);
  if (blobFilename) {
    if (!blobStorageIsConfigured()) return;
    try {
      await del(url);
    } catch (error) {
      if (!(error instanceof BlobNotFoundError)) throw error;
    }
    return;
  }

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
  const blobFilename = blobFilenameFromUrl(url);
  if (blobFilename) {
    if (!blobStorageIsConfigured()) return false;
    try {
      await head(url);
      return true;
    } catch {
      return false;
    }
  }

  const filename = filenameFromUploadUrl(url);
  if (!filename) return false;
  try {
    await access(path.join(UPLOAD_DIRECTORY, filename), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
