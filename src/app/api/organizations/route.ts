import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toEnglishDigits } from "@/lib/persian"

// GET /api/organizations - لیست سازمان‌ها با آمار + جستجو
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get("q") || "").trim()
    const type = searchParams.get("type") || ""
    const contractType = searchParams.get("contractType") || "" // PURCHASE | SUPPORT

    const where: any = {}
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { economicCode: { contains: q } },
        { nationalId: { contains: q } },
        { contactPerson: { contains: q } },
      ]
    }
    if (type) where.type = type

    const organizations = await db.organization.findMany({
      where,
      include: {
        contracts: {
          select: {
            id: true,
            type: true,
            status: true,
            endDate: true,
            amount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    let result = organizations.map((org) => {
      const purchaseCount = org.contracts.filter((c) => c.type === "PURCHASE").length
      const supportCount = org.contracts.filter((c) => c.type === "SUPPORT").length
      const now = new Date()
      const activeCount = org.contracts.filter(
        (c) => c.status === "ACTIVE" && new Date(c.endDate) >= now
      ).length
      const expiringCount = org.contracts.filter((c) => {
        if (c.status !== "ACTIVE") return false
        const days = Math.ceil(
          (new Date(c.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        return days >= 0 && days <= 60
      }).length
      const totalAmount = org.contracts.reduce((s, c) => s + (c.amount || 0), 0)

      return {
        id: org.id,
        name: org.name,
        type: org.type,
        economicCode: org.economicCode,
        nationalId: org.nationalId,
        phone: org.phone,
        email: org.email,
        address: org.address,
        contactPerson: org.contactPerson,
        notes: org.notes,
        createdAt: org.createdAt.toISOString(),
        updatedAt: org.updatedAt.toISOString(),
        _count: { contracts: org.contracts.length },
        purchaseCount,
        supportCount,
        activeCount,
        expiringCount,
        totalAmount,
      }
    })

    if (contractType === "PURCHASE") {
      result = result.filter((o) => o.purchaseCount > 0)
    } else if (contractType === "SUPPORT") {
      result = result.filter((o) => o.supportCount > 0)
    }

    return NextResponse.json({ data: result })
  } catch (e: any) {
    console.error("GET /api/organizations error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/organizations - ایجاد سازمان جدید
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      type,
      economicCode,
      nationalId,
      phone,
      email,
      address,
      contactPerson,
      notes,
    } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "نام سازمان الزامی است" }, { status: 400 })
    }

    const org = await db.organization.create({
      data: {
        name: name.trim(),
        type: type || null,
        economicCode: economicCode ? toEnglishDigits(economicCode) : null,
        nationalId: nationalId ? toEnglishDigits(nationalId) : null,
        phone: phone ? toEnglishDigits(phone) : null,
        email: email || null,
        address: address || null,
        contactPerson: contactPerson || null,
        notes: notes || null,
      },
    })

    return NextResponse.json({ data: org })
  } catch (e: any) {
    console.error("POST /api/organizations error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
