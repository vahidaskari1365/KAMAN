import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { deleteFile, fileKind, readFileBuffer } from "@/lib/file-storage"

interface Params {
  params: Promise<{ id: string }>
}

// GET /api/files/[id]?download=1 - مشاهده inline یا دانلود فایل
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const download = searchParams.get("download") === "1"

    const file = await db.contractFile.findUnique({ where: { id } })
    if (!file) {
      return NextResponse.json({ error: "فایل یافت نشد" }, { status: 404 })
    }

    const buffer = await readFileBuffer(file.filepath)
    const kind = fileKind(file.fileType, file.originalName)

    // برای PDF و تصاویر inline نمایش بده، در غیر اینصورت دانلود
    const inline = !download && (kind === "image" || kind === "pdf")

    const headers: Record<string, string> = {
      "Content-Type": file.fileType || "application/octet-stream",
      "Content-Length": String(buffer.length),
      "Content-Disposition": inline
        ? `inline; filename="${encodeURIComponent(file.originalName)}"`
        : `attachment; filename="${encodeURIComponent(file.originalName)}"`,
      "Cache-Control": "private, max-age=3600",
    }

    return new NextResponse(buffer as any, { headers })
  } catch (e: any) {
    console.error("GET /api/files/[id] error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/files/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const file = await db.contractFile.findUnique({ where: { id } })
    if (!file) {
      return NextResponse.json({ error: "فایل یافت نشد" }, { status: 404 })
    }
    await deleteFile(file.filepath)
    await db.contractFile.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("DELETE /api/files/[id] error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PUT /api/files/[id] - ویرایش دسته فایل
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()
    const { category } = body
    const updated = await db.contractFile.update({
      where: { id },
      data: { category: category || null },
    })
    return NextResponse.json({
      data: { ...updated, uploadedAt: updated.uploadedAt.toISOString() },
    })
  } catch (e: any) {
    console.error("PUT /api/files/[id] error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
