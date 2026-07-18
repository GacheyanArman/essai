import "server-only";

import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { BlobNotFoundError, del, head, put } from "@vercel/blob";

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

// Legacy local directory: images baked into the deployment at build time
// (from before this file used Blob storage). The production filesystem is
// read-only, so this directory is ONLY ever read from, never written to.
const LOCAL_UPLOAD_DIRECTORY = path.join(process.cwd(), "data", "uploads");
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

function requireBlobStorage() {
  if (!blobStorageIsConfigured()) {
    throw new Error("Хранилище Vercel Blob не настроено. Добавьте BLOB_READ_WRITE_TOKEN в переменные окружения проекта на Vercel (Storage → Blob → Connect) и переразверните проект.");
  }
}

export function contentTypeForUpload(filename: string) {
  const extension = path.extname(filename).slice(1).toLowerCase();
  return contentTypeByExtension.get(extension) ?? "application/octet-stream";
}

export async function saveImages(files: File[]) {
  const realFiles = files.filter((file) => file && file.size > 0);
  if (!realFiles.length) return [];

  requireBlobStorage();
  const savedUrls = new Set<string>();

  for (const file of realFiles) {
    const extension = extensionByContentType.get(file.type);
    if (!extension) throw new Error(`Формат ${file.type || file.name} не поддерживается`);
    if (file.size > MAX_IMAGE_SIZE) throw new Error("Один файл не должен превышать 10 МБ");

    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = createHash("sha256").update(buffer).digest("hex");
    const filename = `${hash}.${extension}`;
    const blobPath = `${BLOB_UPLOAD_PREFIX}${filename}`;

    let url: string;
    try {
      // Same content already uploaded before - reuse it instead of re-uploading.
      url = (await head(blobPath)).url;
    } catch (error) {
      if (!(error instanceof BlobNotFoundError)) throw error;
      url = (await put(blobPath, buffer, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: false,
      })).url;
    }

    savedUrls.add(url);
  }

  return [...savedUrls];
}

// Reads images that were baked into the deployment before this project
// switched to Blob storage. Kept for backwards compatibility only - never
// written to, since the production filesystem is read-only.
export async function readStoredUpload(filename: string) {
  if (!isSafeFilename(filename)) return null;
  try {
    const buffer = await readFile(path.join(LOCAL_UPLOAD_DIRECTORY, filename));
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
    try {
      await del(`${BLOB_UPLOAD_PREFIX}${blobFilename}`);
    } catch (error) {
      if (!(error instanceof BlobNotFoundError)) throw error;
    }
    return;
  }
  // Legacy local file baked into the deployment - nothing we can delete
  // at runtime since the filesystem is read-only in production.
}

export async function storedUploadExists(url: string) {
  const blobFilename = blobFilenameFromUrl(url);
  if (blobFilename) {
    try {
      await head(`${BLOB_UPLOAD_PREFIX}${blobFilename}`);
      return true;
    } catch {
      return false;
    }
  }

  const localFilename = filenameFromUploadUrl(url);
  if (!localFilename) return false;
  try {
    await access(path.join(LOCAL_UPLOAD_DIRECTORY, localFilename), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}