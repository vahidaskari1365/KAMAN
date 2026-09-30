// DDL ساخت جداول - برای محیط‌هایی که prisma db push اجرا نمی‌شود (مانند Vercel serverless)
// این دستورات idempotent هستند (IF NOT EXISTS) و از همان SQL تولیدشده توسط
// `prisma migrate diff` گرفته شده‌اند.

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "economicCode" TEXT,
    "nationalId" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "contactPerson" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractNumber" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "amount" REAL,
    "currency" TEXT DEFAULT 'ریال',
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "reminderDays" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contract_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ContractFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "category" TEXT,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContractFile_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "email" TEXT,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "detail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Contract_organizationId_idx" ON "Contract"("organizationId");
CREATE INDEX IF NOT EXISTS "Contract_type_idx" ON "Contract"("type");
CREATE INDEX IF NOT EXISTS "Contract_status_idx" ON "Contract"("status");
CREATE INDEX IF NOT EXISTS "Contract_endDate_idx" ON "Contract"("endDate");
CREATE INDEX IF NOT EXISTS "ContractFile_contractId_idx" ON "ContractFile"("contractId");
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");
`

// برای جلوگیری از اجرای مکرر در یک نمونه (instance)
let schemaEnsured = false

/**
 * جداول دیتابیس را اگر وجود ندارند می‌سازد.
 * ضروری برای Vercel serverless که prisma db push در آن اجرا نمی‌شود.
 */
export async function ensureSchema(db: any) {
  if (schemaEnsured) return
  try {
    // روش مطمئن: از طریق sqlite اجرا نمی‌شود چون Prisma $executeRawUnsafe فقط
    // یک statement می‌پذیرد. پس جدول‌ها را به‌صورت جداگانه با try/catch می‌سازیم.
    const statements = SCHEMA_SQL.split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"))

    for (const stmt of statements) {
      try {
        await db.$executeRawUnsafe(stmt)
      } catch (e: any) {
        // اگر جدول از قبل وجود داشته باشد یا ایندکس تکراری باشد، نادیده بگیر
        if (!/already exists|unique/i.test(e.message || "")) {
          // خطای جدی است؛ لاگ کن ولی ادامه بده
          console.error("[ensureSchema] statement error:", e.message, "| SQL:", stmt.slice(0, 60))
        }
      }
    }
    schemaEnsured = true
  } catch (e) {
    console.error("[ensureSchema] error:", e)
  }
}

export const SCHEMA_DDL = SCHEMA_SQL
