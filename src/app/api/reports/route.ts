import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/reports - گزارش‌ساز با فیلترهای پیشرفته
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || ""
    const status = searchParams.get("status") || ""
    const organizationId = searchParams.get("organizationId") || ""
    const expiringInDays = searchParams.get("expiringInDays") // عدد روز
    const expiredOnly = searchParams.get("expiredOnly") === "1"
    const dateFrom = searchParams.get("dateFrom") || ""
    const dateTo = searchParams.get("dateTo") || ""
    const minAmount = searchParams.get("minAmount")
    const maxAmount = searchParams.get("maxAmount")

    const where: any = {}
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
      where.endDate = { lt: now }
      where.status = { not: "TERMINATED" }
    } else {
      const dateRange: any = {}
      if (dateFrom) dateRange.gte = new Date(dateFrom)
      if (dateTo) dateRange.lte = new Date(dateTo)
      if (Object.keys(dateRange).length) where.endDate = dateRange
    }

    if (minAmount || maxAmount) {
      where.amount = {}
      if (minAmount) where.amount.gte = Number(minAmount)
      if (maxAmount) where.amount.lte = Number(maxAmount)
    }

    const contracts = await db.contract.findMany({
      where,
      include: {
        organization: { select: { id: true, name: true, type: true } },
        files: { select: { id: true, fileSize: true } },
      },
      orderBy: { endDate: "asc" },
    })

    const data = contracts.map((c) => {
      const daysLeft = Math.ceil(
        (new Date(c.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      return {
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
        totalFileSize: c.files.reduce((s, f) => s + f.fileSize, 0),
        daysLeft,
      }
    })

    // خلاصه گزارش
    const summary = {
      count: data.length,
      totalAmount: data.reduce((s, c) => s + (c.amount || 0), 0),
      purchaseCount: data.filter((c) => c.type === "PURCHASE").length,
      supportCount: data.filter((c) => c.type === "SUPPORT").length,
      expiringCount: data.filter((c) => c.daysLeft >= 0 && c.daysLeft <= 60).length,
      expiredCount: data.filter((c) => c.daysLeft < 0).length,
      totalFiles: data.reduce((s, c) => s + c._count.files, 0),
    }

    return NextResponse.json({ data, summary })
  } catch (e: any) {
    console.error("GET /api/reports error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
