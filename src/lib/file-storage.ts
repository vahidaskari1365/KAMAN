import { promises as fs } from "fs"
import path from "path"
import { randomUUID } from "crypto"

const UPLOAD_DIR = path.join(process.cwd(), "db", "uploads")

export async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  } catch {
    // dir exists
  }
}

export function getUploadDir() {
  return UPLOAD_DIR
}

export async function saveFile(
  buffer: Buffer,
  originalName: string,
  contentType: string
): Promise<{ filename: string; filepath: string; fileType: string; fileSize: number }> {
  await ensureUploadDir()
  const ext = path.extname(originalName) || ""
  const filename = `${randomUUID()}${ext}`
  const filepath = path.join(UPLOAD_DIR, filename)
  await fs.writeFile(filepath, buffer)
  return {
    filename,
    filepath,
    fileType: contentType,
    fileSize: buffer.length,
  }
}

export async function deleteFile(filepath: string) {
  try {
    await fs.unlink(filepath)
  } catch {
    // ignore
  }
}

export async function readFileBuffer(filepath: string): Promise<Buffer> {
  return fs.readFile(filepath)
}

export function isImage(fileType: string): boolean {
  return fileType.startsWith("image/")
}

export function isPdf(fileType: string): boolean {
  return fileType === "application/pdf"
}

export function fileKind(fileType: string, originalName: string): "image" | "pdf" | "other" {
  if (fileType.startsWith("image/")) return "image"
  if (fileType === "application/pdf" || originalName.toLowerCase().endsWith(".pdf")) return "pdf"
  return "other"
}
