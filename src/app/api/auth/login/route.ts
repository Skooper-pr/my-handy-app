import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { db } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "البريد الإلكتروني وكلمة المرور ونوع المستخدم مطلوبان" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
      include: {
        customer: role === "CUSTOMER",
        craftsman: role === "CRAFTSMAN",
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      )
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return NextResponse.json(
        { error: "الحساب محظور" },
        { status: 403 }
      )
    }

    // Check user role
    if (user.role !== role.toUpperCase()) {
      return NextResponse.json(
        { error: "نوع المستخدم غير صحيح" },
        { status: 403 }
      )
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "كلمة المرور غير صحيحة" },
        { status: 401 }
      )
    }

    // For craftsmen, check if approved
    if (role === "CRAFTSMAN" && user.craftsman && !user.craftsman.isApproved) {
      return NextResponse.json(
        { error: "الحساب قيد المراجعة" },
        { status: 403 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في تسجيل الدخول" },
      { status: 500 }
    )
  }
}