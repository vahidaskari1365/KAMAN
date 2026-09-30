import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { saveFile } from "@/lib/file-storage"

interface Params {
  params: Promise<{ id: string }>
}

// GET /api/contracts/[id]/files - لیست فایل‌های قرارداد
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const files = await db.contractFile.findMany({
      where: { contractId: id },
      orderBy: { uploadedAt: "desc" },
    })
    return NextResponse.json({
      data: files.map((f) => ({
        ...f,
        uploadedAt: f.uploadedAt.toISOString(),
      })),
    })
  } catch (e: any) {
    console.error("GET /api/contracts/[id]/files error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/contracts/[id]/files - آپلود فایل (multipart)
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const contract = await db.contract.findUnique({ where: { id } })
    if (!contract) {
      return NextResponse.json({ error: "قرارداد یافت نشد" }, { status: 404 })
    }

    const formData = await req.formData()
    const files = formData.getAll("files")
    const category = (formData.get("category") as string) || null

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "فایلی ارسال نشده" }, { status: 400 })
    }

    const saved: any[] = []
    for (const file of files) {
      if (!(file instanceof File)) continue
      const buffer = Buffer.from(await file.arrayBuffer())
      const meta = await saveFile(buffer, file.name, file.type || "application/octet-stream")
      const rec = await db.contractFile.create({
        data: {
          contractId: id,
          filename: meta.filename,
          originalName: file.name,
          filepath: meta.filepath,
          fileType: meta.fileType || file.type,
          fileSize: meta.fileSize,
          category,
        },
      })
      saved.push({
        ...rec,
        uploadedAt: rec.uploadedAt.toISOString(),
      })
    }

    return NextResponse.json({ data: saved })
  } catch (e: any) {
    console.error("POST /api/contracts/[id]/files error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
