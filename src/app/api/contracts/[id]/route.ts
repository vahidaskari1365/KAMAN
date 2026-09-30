import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toEnglishDigits } from "@/lib/persian"
import { deleteFile } from "@/lib/file-storage"

interface Params {
  params: Promise<{ id: string }>
}

// GET /api/contracts/[id] - جزئیات قرارداد با فایل‌ها
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const contract = await db.contract.findUnique({
      where: { id },
      include: {
        organization: true,
        files: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    })

    if (!contract) {
      return NextResponse.json({ error: "قرارداد یافت نشد" }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        id: contract.id,
        contractNumber: contract.contractNumber,
        organizationId: contract.organizationId,
        type: contract.type,
        title: contract.title,
        startDate: contract.startDate.toISOString(),
        endDate: contract.endDate.toISOString(),
        amount: contract.amount,
        currency: contract.currency,
        description: contract.description,
        status: contract.status,
        reminderDays: contract.reminderDays,
        createdAt: contract.createdAt.toISOString(),
        updatedAt: contract.updatedAt.toISOString(),
        organization: contract.organization
          ? {
              ...contract.organization,
              createdAt: contract.organization.createdAt.toISOString(),
              updatedAt: contract.organization.updatedAt.toISOString(),
            }
          : null,
        files: contract.files.map((f) => ({
          ...f,
          uploadedAt: f.uploadedAt.toISOString(),
        })),
      },
    })
  } catch (e: any) {
    console.error("GET /api/contracts/[id] error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PUT /api/contracts/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
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

    const contract = await db.contract.update({
      where: { id },
      data: {
        contractNumber: contractNumber ? toEnglishDigits(contractNumber) : undefined,
        organizationId: organizationId || undefined,
        type: type || undefined,
        title: title?.trim(),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        amount: amount !== undefined ? (amount === null ? null : Number(amount)) : undefined,
        currency: currency || undefined,
        description: description ?? undefined,
        status: status || undefined,
        reminderDays: reminderDays !== undefined ? Number(reminderDays) : undefined,
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
    console.error("PUT /api/contracts/[id] error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/contracts/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    // پاک کردن فایل‌های فیزیکی
    const files = await db.contractFile.findMany({
      where: { contractId: id },
      select: { filepath: true },
    })
    for (const f of files) {
      await deleteFile(f.filepath)
    }
    await db.contract.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("DELETE /api/contracts/[id] error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
