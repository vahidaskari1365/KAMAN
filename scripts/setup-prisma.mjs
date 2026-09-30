// اسکریپت pre-build: بر اساس DATABASE_URL، provider پرایزما را تطبیق می‌دهد.
// - postgres:// یا postgresql:// → postgresql (برای Vercel Postgres / Neon)
// - file:// یا خالی → sqlite (برای محیط محلی / Render / سرور با دیسک)
//
// این اسکریپت در زمان build روی container Vercel اجرا می‌شود و فایل schema.prisma
// را بازنویسی می‌کند (بدون اثر روی ریپو). سپس prisma generate و prisma db push
// از همان schema استفاده می‌کنند.

import { readFileSync, writeFileSync, existsSync } from "fs"

const url = process.env.DATABASE_URL || ""
let provider = "sqlite"
if (url.startsWith("postgres") || url.startsWith("postgresql")) {
  provider = "postgresql"
}

const schemaPath = "prisma/schema.prisma"
if (!existsSync(schemaPath)) {
  console.log("[setup-prisma] schema.prisma یافت نشد، رد می‌شود")
  process.exit(0)
}

let schema = readFileSync(schemaPath, "utf8")
const before = schema.match(/provider\s*=\s*"(\w+)"/)?.[1] || "؟"
schema = schema.replace(/provider\s*=\s*"\w+"/, `provider = "${provider}"`)
writeFileSync(schemaPath, schema)
console.log(
  `[setup-prisma] provider: ${before} -> ${provider} | DATABASE_URL: ${url ? url.slice(0, 24) + "..." : "(خالي - pish-farz sqlite)"}`
)
