import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/users
export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({
      data: users.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        role: u.role,
        email: u.email,
        phone: u.phone,
        active: u.active,
        createdAt: u.createdAt.toISOString(),
      })),
    })
  } catch (e: any) {
    console.error("GET /api/users error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/users
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, username, password, role, email, phone } = body
    if (!name || !username || !password) {
      return NextResponse.json(
        { error: "نام، نام کاربری و رمز عبور الزامی است" },
        { status: 400 }
      )
    }
    const exists = await db.user.findUnique({ where: { username } })
    if (exists) {
      return NextResponse.json({ error: "این نام کاربری قبلاً ثبت شده" }, { status: 400 })
    }
    const user = await db.user.create({
      data: {
        name: name.trim(),
        username: username.trim(),
        password, // در محیط دمو به صورت ساده ذخیره می‌شود
        role: role || "USER",
        email: email || null,
        phone: phone || null,
      },
    })
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
    console.error("POST /api/users error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
