import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { computeStatus } from "@/lib/persian"

// GET /api/notifications - قراردادهای نزدیک به پایان برای اعلان خودکار
export async function GET() {
  try {
    const contracts = await db.contract.findMany({
      where: { status: "ACTIVE" },
      include: {
        organization: { select: { id: true, name: true, type: true } },
        files: { select: { id: true } },
      },
    })

    const now = new Date()
    const reminders = contracts
      .map((c) => {
        const daysLeft = Math.ceil(
          (new Date(c.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        const st = computeStatus(c.endDate, c.status)
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
          status: st.status,
          statusLabel: st.label,
          tone: st.tone,
          daysLeft,
          reminderDays: c.reminderDays || 60,
          organization: c.organization,
          _count: { files: c.files.length },
        }
      })
      // فقط قراردادهایی که فاصله‌شان کمتر از reminderDays است و هنوز منقضی نشده‌اند
      .filter((c) => c.daysLeft >= 0 && c.daysLeft <= (c.reminderDays || 60))
      .sort((a, b) => a.daysLeft - b.daysLeft)

    return NextResponse.json({ data: reminders })
  } catch (e: any) {
    console.error("GET /api/notifications error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
