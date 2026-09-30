import { db } from "@/lib/db"
import { ensureSchema } from "@/lib/schema-sql"
import { promises as fs } from "fs"
import path from "path"
import { getUploadDir } from "@/lib/file-storage"

let seeding = false

// ایجاد داده‌های نمونه اگر دیتابیس خالی باشد
export async function ensureSeed() {
  try {
    // مطمئن شو پوشه‌ی آپلود وجود دارد
    await fs.mkdir(getUploadDir(), { recursive: true })
  } catch {
    // ignore
  }

  if (seeding) return
  seeding = true
  try {
    // ۱) بررسی کن آیا جدول Organization وجود دارد
    let count: number
    try {
      count = await db.organization.count()
    } catch {
      // جدول وجود ندارد (مثلاً sqlite روی serverless که prisma db push
      // در آن اجرا نشده) → جداول را با DDL بساز
      await ensureSchema(db)
      count = await db.organization.count().catch(() => 0)
    }
    // ۲) اگر هیچ سازمانی وجود ندارد، داده‌های نمونه بساز
    if (count === 0) {
      await seedDemoData()
    }
  } catch (e) {
    console.error("[ensureSeed] خطا:", e)
  } finally {
    seeding = false
  }
}

async function seedDemoData() {
  const now = new Date()
  const addDays = (days: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() + days)
    return d
  }

  const orgs = await Promise.all([
    db.organization.create({
      data: {
        name: "دانشگاه علوم پزشکی اصفهان",
        type: "پزشکی",
        economicCode: "14025678901",
        nationalId: "14005678901",
        phone: "0316678901",
        email: "info@mu.ac.ir",
        address: "اصفهان، خیابان هشت بهشت هشتم",
        contactPerson: "اداره قراردادها",
        notes: "از سال ۱۳۹۸ قرارداد پشتیبانی دائم داریم",
      },
    }),
    db.organization.create({
      data: {
        name: "شهرداری اصفهان",
        type: "دولتی",
        economicCode: "14012345678",
        nationalId: "14001234567",
        phone: "03136612345",
        email: "contract@isfahan.ir",
        address: "اصفهان، میدان امام حسن",
        contactPerson: "معاونت فنی",
      },
    }),
    db.organization.create({
      data: {
        name: "شرکت پتروشیمی اصفهان",
        type: "صنعتی",
        economicCode: "14098765432",
        nationalId: "14009876543",
        phone: "03155678901",
        email: "contracts@pi.ir",
        address: "اصفهان، شهرک صنعتی محمودیه",
        contactPerson: "مدیر تدارکات",
      },
    }),
    db.organization.create({
      data: {
        name: "بیمارستان سیدالشهدا",
        type: "پزشکی",
        economicCode: "14034567890",
        nationalId: "14003456789",
        phone: "03133456789",
        email: "it@sahd.ir",
        address: "اصفهان، خیابان سیدالشهدا",
        contactPerson: "مدیر امور اداری",
      },
    }),
  ])

  const [medUniv, municipality, petro, hospital] = orgs

  const contractsData = [
    {
      contractNumber: "SUP-9801",
      organizationId: medUniv.id,
      type: "SUPPORT",
      title: "پشتیبانی سیستم HIS بیمارستانی",
      startDate: new Date(2019, 8, 23),
      endDate: addDays(20),
      amount: 850000000,
      status: "ACTIVE",
      reminderDays: 60,
      description: "پشتیبانی فنی و نگهداری نرم‌افزار HIS بخش‌های مختلف بیمارستان",
    },
    {
      contractNumber: "PUR-1402-45",
      organizationId: medUniv.id,
      type: "PURCHASE",
      title: "خرید تجهیزات سرور و شبکه",
      startDate: new Date(2023, 2, 21),
      endDate: new Date(2024, 2, 20),
      amount: 3200000000,
      status: "EXPIRED",
      reminderDays: 60,
      description: "تامین و نصب سرورها و تجهیزات شبکه دیتاسنتر",
    },
    {
      contractNumber: "SUP-1403-12",
      organizationId: medUniv.id,
      type: "SUPPORT",
      title: "پشتیبانی وب‌سایت و پرتال دانشجویی",
      startDate: new Date(2024, 0, 1),
      endDate: addDays(45),
      amount: 420000000,
      status: "ACTIVE",
      reminderDays: 60,
      description: "نگهداری و پشتیبانی پرتال دانشجویی و وب‌سایت رسمی",
    },
    {
      contractNumber: "PUR-1402-78",
      organizationId: municipality.id,
      type: "PURCHASE",
      title: "خرید سیستم پارکینگ هوشمند",
      startDate: new Date(2023, 5, 1),
      endDate: addDays(180),
      amount: 1500000000,
      status: "ACTIVE",
      reminderDays: 60,
      description: "تجهیزات و نرم‌افزار پارکینگ هوشمند مراکز شهرداری",
    },
    {
      contractNumber: "SUP-1402-03",
      organizationId: municipality.id,
      type: "SUPPORT",
      title: "پشتیبانی سامانه مدیریت شهر",
      startDate: new Date(2023, 9, 1),
      endDate: addDays(15),
      amount: 680000000,
      status: "ACTIVE",
      reminderDays: 60,
      description: "پشتیبانی فنی سامانه مدیریت یکپارچه شهر",
    },
    {
      contractNumber: "SUP-1401-22",
      organizationId: petro.id,
      type: "SUPPORT",
      title: "پشتیبانی DCS و کنترل صنعتی",
      startDate: new Date(2022, 11, 1),
      endDate: addDays(90),
      amount: 2400000000,
      status: "ACTIVE",
      reminderDays: 60,
      description: "نگهداری و پشتیبانی سیستم‌های کنترل توزیع‌شده صنعتی",
    },
    {
      contractNumber: "PUR-1401-101",
      organizationId: petro.id,
      type: "PURCHASE",
      title: "خرید سنسورها و تجهیزات اندازه‌گیری",
      startDate: new Date(2022, 6, 1),
      endDate: new Date(2023, 5, 30),
      amount: 1850000000,
      status: "EXPIRED",
      reminderDays: 60,
      description: "تامین سنسورها و ابزار دقیق صنعتی",
    },
    {
      contractNumber: "SUP-1403-55",
      organizationId: hospital.id,
      type: "SUPPORT",
      title: "پشتیبانی PACS و تصویربرداری پزشکی",
      startDate: new Date(2024, 2, 15),
      endDate: addDays(50),
      amount: 950000000,
      status: "ACTIVE",
      reminderDays: 60,
      description: "پشتیبانی و نگهداری سامانه PACS بخش تصویربرداری",
    },
    {
      contractNumber: "PUR-1403-09",
      organizationId: hospital.id,
      type: "PURCHASE",
      title: "خرید ایستگاه‌های کار و مانیتورهای پزشکی",
      startDate: new Date(2024, 0, 10),
      endDate: addDays(365),
      amount: 2100000000,
      status: "ACTIVE",
      reminderDays: 60,
      description: "خرید و نصب ایستگاه‌های کار بالینی و مانیتورها",
    },
  ]

  for (const c of contractsData) {
    await db.contract.create({ data: c as any })
  }

  // کاربر ادمین پیش‌فرض
  const userExists = await db.user.findUnique({ where: { username: "admin" } })
  if (!userExists) {
    await db.user.create({
      data: {
        name: "مدیر سیستم",
        username: "admin",
        password: "admin123",
        role: "ADMIN",
        email: "admin@kaman.ir",
        active: true,
      },
    })
  }

  console.log("[ensureSeed] داده‌های نمونه ایجاد شد")
}
