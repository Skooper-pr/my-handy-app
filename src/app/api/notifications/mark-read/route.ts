import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Helper function to get user from token
function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.split(" ")[1] // Bearer token

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      role: string
    }
    return decoded
  } catch (error) {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "غير مصرح به" }, { status: 401 })
    }

    const { notificationIds } = await request.json()

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "معرفات الإشعارات مطلوبة" },
        { status: 400 }
      )
    }

    // Mark notifications as read
    await db.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: user.userId
      },
      data: { isRead: true }
    })

    return NextResponse.json({
      message: "تم تحديث الإشعارات بنجاح"
    })
  } catch (error) {
    console.error("Mark notifications read error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في تحديث الإشعارات" },
      { status: 500 }
    )
  }
}