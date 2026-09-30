import { PrismaClient } from '@prisma/client'
import { mkdirSync } from 'fs'
import path from 'path'

// اگر DATABASE_URL تنظیم نشده، یک مسیر پیش‌فرض مناسب محیط می‌گذاریم:
// - روی Vercel/serverless: /tmp/kaman.db (تنها مسیر writable در lambda)
// - محیط محلی / سرور با دیسک دائمی: ./db/custom.db
if (!process.env.DATABASE_URL) {
  const isServerless =
    process.env.VERCEL === '1' ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
    !!process.env.NETLLY // netlify
  if (isServerless) {
    process.env.DATABASE_URL = 'file:/tmp/kaman.db'
    // فایل‌های آپلودی هم در /tmp
    if (!process.env.UPLOAD_DIR) process.env.UPLOAD_DIR = '/tmp/kaman-uploads'
  } else {
    try {
      mkdirSync(path.join(process.cwd(), 'db'), { recursive: true })
    } catch {
      // ignore
    }
    process.env.DATABASE_URL = 'file:./db/custom.db'
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db