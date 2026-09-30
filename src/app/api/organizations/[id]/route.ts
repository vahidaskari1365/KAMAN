import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toEnglishDigits } from "@/lib/persian"

interface Params {
  params: Promise<{ id: string }>
}

// GET /api/organizations/[id] - جزئیات سازمان با قراردادها و فایل‌ها
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const org = await db.organization.findUnique({
      where: { id },
      include: {
        contracts: {
          include: {
            files: {
              select: {
                id: true,
                originalName: true,
                fileType: true,
                fileSize: true,
                category: true,
                uploadedAt: true,
              },
            },
          },
          orderBy: { startDate: "desc" },
        },
      },
    })

    if (!org) {
      return NextResponse.json({ error: "سازمان یافت نشد" }, { status: 404 })
    }

    const purchaseContracts = org.contracts.filter((c) => c.type === "PURCHASE")
    const supportContracts = org.contracts.filter((c) => c.type === "SUPPORT")

    return NextResponse.json({
      data: {
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
        contracts: org.contracts.map((c) => ({
          ...c,
          startDate: c.startDate.toISOString(),
          endDate: c.endDate.toISOString(),
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
          files: c.files.map((f) => ({
            ...f,
            uploadedAt: f.uploadedAt.toISOString(),
          })),
        })),
        purchaseContracts: purchaseContracts.map((c) => ({
          ...c,
          startDate: c.startDate.toISOString(),
          endDate: c.endDate.toISOString(),
          files: c.files.map((f) => ({ ...f, uploadedAt: f.uploadedAt.toISOString() })),
        })),
        supportContracts: supportContracts.map((c) => ({
          ...c,
          startDate: c.startDate.toISOString(),
          endDate: c.endDate.toISOString(),
          files: c.files.map((f) => ({ ...f, uploadedAt: f.uploadedAt.toISOString() })),
        })),
      },
    })
  } catch (e: any) {
    console.error("GET /api/organizations/[id] error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PUT /api/organizations/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
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

    const org = await db.organization.update({
      where: { id },
      data: {
        name: name?.trim(),
        type: type ?? null,
        economicCode: economicCode ? toEnglishDigits(economicCode) : null,
        nationalId: nationalId ? toEnglishDigits(nationalId) : null,
        phone: phone ? toEnglishDigits(phone) : null,
        email: email ?? null,
        address: address ?? null,
        contactPerson: contactPerson ?? null,
        notes: notes ?? null,
      },
    })

    return NextResponse.json({ data: org })
  } catch (e: any) {
    console.error("PUT /api/organizations/[id] error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/organizations/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    // فایل‌های فیزیکی را هم پاک کن
    const files = await db.contractFile.findMany({
      where: { contract: { organizationId: id } },
      select: { filepath: true },
    })
    const { deleteFile } = await import("@/lib/file-storage")
    for (const f of files) {
      await deleteFile(f.filepath)
    }
    await db.organization.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("DELETE /api/organizations/[id] error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
