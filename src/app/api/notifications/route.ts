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

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "غير مصرح به" }, { status: 401 })
    }

    const url = new URL(request.url)
    const unreadOnly = url.searchParams.get("unreadOnly") === "true"

    let whereClause: any = { userId: user.userId }

    if (unreadOnly) {
      whereClause.isRead = false
    }

    const notifications = await db.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في جلب الإشعارات" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح به" }, { status: 401 })
    }

    const { userId, title, message, type } = await request.json()

    if (!userId || !title || !message || !type) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      )
    }

    // Check if user exists
    const targetUser = await db.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      )
    }

    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type
      }
    })

    // TODO: Send real-time notification via Socket.IO

    return NextResponse.json({
      message: "تم إرسال الإشعار بنجاح",
      notification
    })
  } catch (error) {
    console.error("Create notification error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في إرسال الإشعار" },
      { status: 500 }
    )
  }
}