import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toEnglishDigits } from "@/lib/persian"

// GET /api/contracts - لیست قراردادها با فیلتر و جستجو
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get("q") || "").trim()
    const contractNumber = searchParams.get("contractNumber") || ""
    const type = searchParams.get("type") || "" // PURCHASE | SUPPORT
    const status = searchParams.get("status") || ""
    const organizationId = searchParams.get("organizationId") || ""
    const expiringInDays = searchParams.get("expiringInDays") // عدد
    const expiredOnly = searchParams.get("expiredOnly") === "1"
    const hasFiles = searchParams.get("hasFiles") === "1"
    const sortBy = searchParams.get("sortBy") || "endDate"
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc"

    const where: any = {}
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { contractNumber: { contains: q } },
        { description: { contains: q } },
        { organization: { name: { contains: q } } },
      ]
    }
    if (contractNumber) {
      where.contractNumber = { contains: toEnglishDigits(contractNumber) }
    }
    if (type) where.type = type
    if (status) where.status = status
    if (organizationId) where.organizationId = organizationId

    const now = new Date()
    if (expiringInDays) {
      const days = Number(expiringInDays)
      const future = new Date()
      future.setDate(future.getDate() + days)
      where.endDate = { gte: now, lte: future }
      where.status = "ACTIVE"
    } else if (expiredOnly) {
      // فقط قراردادهایی که تاریخ پایانشان گذشته و فسخ نشده‌اند
      where.endDate = { lt: now }
      where.status = { not: "TERMINATED" }
    }

    if (hasFiles) {
      where.files = { some: {} }
    }

    const contracts = await db.contract.findMany({
      where,
      include: {
        organization: {
          select: { id: true, name: true, type: true },
        },
        files: {
          select: { id: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
    })

    const data = contracts.map((c) => ({
      id: c.id,
      contractNumber: c.contractNumber,
      organizationId: c.organizationId,
      type: c.type,
      title: c.title,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate.toISOString(),
      amount: c.amount,
      currency: c.currency,
      description: c.description,
      status: c.status,
      reminderDays: c.reminderDays,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      organization: c.organization,
      _count: { files: c.files.length },
    }))

    return NextResponse.json({ data })
  } catch (e: any) {
    console.error("GET /api/contracts error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/contracts - ایجاد قرارداد
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      contractNumber,
      organizationId,
      type,
      title,
      startDate,
      endDate,
      amount,
      currency,
      description,
      status,
      reminderDays,
    } = body

    if (!contractNumber || !organizationId || !type || !title || !startDate || !endDate) {
      return NextResponse.json(
        { error: "شماره قرارداد، سازمان، نوع، عنوان و تاریخ‌ها الزامی است" },
        { status: 400 }
      )
    }

    // بررسی تکراری نبودن شماره قرارداد
    const existing = await db.contract.findFirst({
      where: { contractNumber: toEnglishDigits(contractNumber) },
    })
    if (existing) {
      return NextResponse.json(
        { error: "این شماره قرارداد قبلاً ثبت شده است" },
        { status: 400 }
      )
    }

    const contract = await db.contract.create({
      data: {
        contractNumber: toEnglishDigits(contractNumber),
        organizationId,
        type,
        title: title.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        amount: amount ? Number(amount) : null,
        currency: currency || "ریال",
        description: description || null,
        status: status || "ACTIVE",
        reminderDays: reminderDays ? Number(reminderDays) : 60,
      },
      include: {
        organization: { select: { id: true, name: true, type: true } },
      },
    })

    return NextResponse.json({
      data: {
        ...contract,
        startDate: contract.startDate.toISOString(),
        endDate: contract.endDate.toISOString(),
        createdAt: contract.createdAt.toISOString(),
        updatedAt: contract.updatedAt.toISOString(),
      },
    })
  } catch (e: any) {
    console.error("POST /api/contracts error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
