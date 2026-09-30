import { PrismaClient } from '@prisma/client'
import { mkdirSync } from 'fs'
import path from 'path'

// اگر DATABASE_URL تنظیم نشده، یک مسیر پیش‌فرض مناسب محیط می‌گذاریم:
// - روی Vercel/serverless: /tmp/kaman.db (تنها مسیر writable در lambda)
// - محیط محلی / سرور با دیسک دائمی: ./db/custom.db
if (!process.env.DATABASE_URL) {
  const isServerless =
    process.env.VERCEL === '1' ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME
  if (isServerless) {
    process.env.DATABASE_URL = 'file:/tmp/kaman.db'
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

// مطمئن شو پوشه‌ی پدر فایل SQLite وجود دارد (برای مسیرهای مطلق روی سرور)
const dbUrl = process.env.DATABASE_URL || ''
if (dbUrl.startsWith('file:')) {
  const filePath = dbUrl.replace(/^file:/, '')
  // فقط مسیرهای مطلق را مدیریت کن (نسبی توسط next start مدیریت می‌شود)
  if (filePath.startsWith('/')) {
    try {
      mkdirSync(path.dirname(filePath), { recursive: true })
    } catch {
      // ignore
    }
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