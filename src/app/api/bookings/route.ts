import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/lib/db"
import { getSocketServer } from "@/lib/socket-server"

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

// Helper function to create notifications
async function createNotification(
  userId: string, 
  title: string, 
  message: string, 
  type: "BOOKING_REQUEST" | "BOOKING_CONFIRMED" | "BOOKING_CANCELLED" | "BOOKING_COMPLETED" | "REVIEW_RECEIVED" | "PAYMENT_CONFIRMED" | "PAYMENT_RECEIVED" | "SYSTEM"
) {
  try {
    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type
      }
    })
    return notification
  } catch (error) {
    console.error("Error creating notification:", error)
    return null
  }
}

// Helper function to send real-time notification
async function sendRealTimeNotification(
  userId: string,
  title: string,
  message: string,
  type: "BOOKING_REQUEST" | "BOOKING_CONFIRMED" | "BOOKING_CANCELLED" | "BOOKING_COMPLETED" | "REVIEW_RECEIVED" | "PAYMENT_CONFIRMED" | "PAYMENT_RECEIVED" | "SYSTEM"
) {
  try {
    // Get Socket.IO server instance
    const io = getSocketServer()
    
    if (io) {
      // Emit real-time notification
      io.to(`user_${userId}`).emit('notification', {
        title,
        message,
        type,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error("Error sending real-time notification:", error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "غير مصرح به" }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get("status")

    let whereClause: any = {}
    
    if (user.role === "CUSTOMER") {
      whereClause.customerId = user.userId
    } else if (user.role === "CRAFTSMAN") {
      whereClause.craftsmanId = user.userId
    }

    if (status) {
      whereClause.status = status
    }

    const bookings = await db.booking.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        craftsman: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            craftsman: {
              select: {
                profession: true,
                rating: true
              }
            }
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            basePrice: true
          }
        },
        review: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Get bookings error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في جلب الحجوزات" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user || user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "غير مصرح به" }, { status: 401 })
    }

    const {
      craftsmanId,
      serviceId,
      serviceType,
      description,
      scheduledDate,
      price,
      location
    } = await request.json()

    if (!craftsmanId || !scheduledDate || !price) {
      return NextResponse.json(
        { error: "جميع الحقول المطلوبة يجب ملؤها" },
        { status: 400 }
      )
    }

    // Check if craftsman exists and is approved
    const craftsman = await db.user.findUnique({
      where: { id: craftsmanId },
      include: { craftsman: true }
    })

    if (!craftsman || craftsman.role !== "CRAFTSMAN") {
      return NextResponse.json(
        { error: "الحرفي غير موجود" },
        { status: 404 }
      )
    }

    if (craftsman.craftsman && !craftsman.craftsman.isApproved) {
      return NextResponse.json(
        { error: "الحرفي غير معتمد بعد" },
        { status: 400 }
      )
    }

    // Create booking
    const booking = await db.booking.create({
      data: {
        customerId: user.userId,
        craftsmanId,
        serviceId,
        serviceType,
        description,
        scheduledDate: new Date(scheduledDate),
        status: "PENDING",
        price: parseFloat(price),
        location: location ? JSON.parse(location) : null
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        craftsman: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            craftsman: {
              select: {
                profession: true,
                rating: true
              }
            }
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            basePrice: true
          }
        }
      }
    })

    // Send notifications to craftsman about new booking
    await createNotification(
      craftsmanId,
      "حجز جديد",
      `لديك حجز جديد من ${user.email} للخدمة: ${serviceType || 'خدمة عامة'}`,
      "BOOKING_REQUEST"
    )
    await sendRealTimeNotification(
      craftsmanId,
      "حجز جديد",
      `لديك حجز جديد من ${user.email} للخدمة: ${serviceType || 'خدمة عامة'}`,
      "BOOKING_REQUEST"
    )

    return NextResponse.json({
      message: "تم إنشاء الحجز بنجاح",
      booking
    })
  } catch (error) {
    console.error("Create booking error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء الحجز" },
      { status: 500 }
    )
  }
}