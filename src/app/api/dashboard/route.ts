import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/dashboard - آمار کلی برای داشبورد
export async function GET() {
  try {
    const [organizations, contracts, files] = await Promise.all([
      db.organization.count(),
      db.contract.count(),
      db.contractFile.count(),
    ])

    const allContracts = await db.contract.findMany({
      include: {
        organization: { select: { id: true, name: true, type: true } },
        files: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const now = new Date()
    const purchaseContracts = allContracts.filter((c) => c.type === "PURCHASE").length
    const supportContracts = allContracts.filter((c) => c.type === "SUPPORT").length
    const activeContracts = allContracts.filter(
      (c) => c.status === "ACTIVE" && new Date(c.endDate) >= now
    ).length

    const expiringList = allContracts
      .filter((c) => {
        if (c.status !== "ACTIVE") return false
        const days = Math.ceil(
          (new Date(c.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        return days >= 0 && days <= 60
      })
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())

    const expiredContracts = allContracts.filter((c) => {
      if (c.status === "TERMINATED") return false
      return new Date(c.endDate) < now
    }).length

    const totalAmount = allContracts.reduce((s, c) => s + (c.amount || 0), 0)

    const recentContracts = allContracts.slice(0, 6).map((c) => ({
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

    return NextResponse.json({
      data: {
        totalOrganizations: organizations,
        totalContracts: contracts,
        purchaseContracts,
        supportContracts,
        activeContracts,
        expiringContracts: expiringList.length,
        expiredContracts,
        totalFiles: files,
        totalAmount,
        recentContracts,
        expiringList: expiringList.map((c) => ({
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
        })),
        contractsByType: [
          { type: "PURCHASE", count: purchaseContracts },
          { type: "SUPPORT", count: supportContracts },
        ],
        contractsByStatus: [
          { status: "ACTIVE", count: activeContracts },
          { status: "EXPIRED", count: expiredContracts },
          {
            status: "TERMINATED",
            count: allContracts.filter((c) => c.status === "TERMINATED").length,
          },
        ],
      },
    })
  } catch (e: any) {
    console.error("GET /api/dashboard error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
