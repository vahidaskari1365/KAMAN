import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params {
  params: Promise<{ id: string }>
}

// PUT /api/users/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, username, password, role, email, phone, active } = body

    if (username) {
      const exists = await db.user.findFirst({
        where: { username, NOT: { id } },
      })
      if (exists) {
        return NextResponse.json({ error: "این نام کاربری قبلاً ثبت شده" }, { status: 400 })
      }
    }

    const data: any = {}
    if (name !== undefined) data.name = name.trim()
    if (username !== undefined) data.username = username.trim()
    if (password) data.password = password
    if (role !== undefined) data.role = role
    if (email !== undefined) data.email = email || null
    if (phone !== undefined) data.phone = phone || null
    if (active !== undefined) data.active = active

    const user = await db.user.update({ where: { id }, data })
    return NextResponse.json({
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        email: user.email,
        phone: user.phone,
        active: user.active,
        createdAt: user.createdAt.toISOString(),
      },
    })
  } catch (e: any) {
    console.error("PUT /api/users/[id] error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/users/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const count = await db.user.count()
    if (count <= 1) {
      return NextResponse.json(
        { error: "حداقل یک کاربر باید باقی بماند" },
        { status: 400 }
      )
    }
    await db.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("DELETE /api/users/[id] error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
