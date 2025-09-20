import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { db } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const SALT_ROUNDS = 12

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, role } = await request.json()

    if (!name || !email || !password || !phone || !role) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "المستخدم موجود بالفعل" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    // Create user
    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      role: role.toUpperCase(),
      isVerified: false,
      isBlocked: false,
    }

    const user = await db.user.create({
      data: userData,
    })

    // Create role-specific profile
    if (role === "CUSTOMER") {
      await db.customer.create({
        data: {
          userId: user.id,
        }
      })
    } else if (role === "CRAFTSMAN") {
      await db.craftsman.create({
        data: {
          userId: user.id,
          profession: "",
          experience: 0,
          description: "",
          skills: "[]",
          priceRange: JSON.stringify({ min: 0, max: 0 }),
          availability: JSON.stringify({}),
          portfolio: "[]",
          rating: 0,
          reviewsCount: 0,
          isApproved: false,
        }
      })
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
      message: "تم إنشاء الحساب بنجاح",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء الحساب" },
      { status: 500 }
    )
  }
}