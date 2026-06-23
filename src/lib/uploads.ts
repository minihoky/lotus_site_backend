import { mkdirSync, writeFileSync } from "node:fs";
import { extname, join, dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = join(__dirname, "..", "..", "data", "uploads");

mkdirSync(uploadsDir, { recursive: true });

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function getUploadsDir(): string {
  return uploadsDir;
}

function extensionFor(file: File): string {
  const fromMime = MIME_TO_EXT[file.type];
  if (fromMime) return fromMime;

  const fromName = extname(file.name).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(fromName)) {
    return fromName === ".jpeg" ? ".jpg" : fromName;
  }

  return ".jpg";
}

export async function saveUploadedFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Apenas imagens são permitidas");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Imagem excede o limite de 5 MB");
  }

  const filename = `${randomUUID()}${extensionFor(file)}`;
  const filepath = join(uploadsDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  writeFileSync(filepath, buffer);

  return `/uploads/${filename}`;
}
