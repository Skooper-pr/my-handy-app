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
    const url = new URL(request.url)
    const craftsmanId = url.searchParams.get("craftsmanId")
    const bookingId = url.searchParams.get("bookingId")

    let whereClause: any = {}

    if (craftsmanId) {
      whereClause.craftsmanId = craftsmanId
    }

    if (bookingId) {
      whereClause.bookingId = bookingId
    }

    const reviews = await db.review.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        booking: {
          select: {
            id: true,
            serviceType: true,
            scheduledDate: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("Get reviews error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في جلب التقييمات" },
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

    const { bookingId, rating, comment } = await request.json()

    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "بيانات التقييم غير صحيحة" },
        { status: 400 }
      )
    }

    // Get the booking
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        craftsman: true,
        review: true,
        service: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "الحجز غير موجود" },
        { status: 404 }
      )
    }

    // Check if user owns the booking
    if (booking.customerId !== user.userId) {
      return NextResponse.json(
        { error: "غير مصرح لك بتقييم هذا الحجز" },
        { status: 403 }
      )
    }

    // Check if booking is completed
    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "يمكن تقييم الحجوزات المكتملة فقط" },
        { status: 400 }
      )
    }

    // Check if review already exists
    if (booking.review) {
      return NextResponse.json(
        { error: "تم تقييم هذا الحجز مسبقاً" },
        { status: 400 }
      )
    }

    // Create review
    const review = await db.review.create({
      data: {
        bookingId,
        customerId: user.userId,
        craftsmanId: booking.craftsmanId,
        rating,
        comment: comment || null
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        booking: {
          select: {
            id: true,
            serviceType: true,
            scheduledDate: true
          }
        }
      }
    })

    // Update craftsman rating
    const allReviews = await db.review.findMany({
      where: { craftsmanId: booking.craftsmanId }
    })

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
    const averageRating = totalRating / allReviews.length

    await db.craftsman.update({
      where: { userId: booking.craftsmanId },
      data: {
        rating: averageRating,
        reviewsCount: allReviews.length
      }
    })

    // Send notification to craftsman about new review
    await createNotification(
      booking.craftsmanId,
      "تقييم جديد",
      `قيمك العميل ${user.email} بـ ${rating} نجوم`,
      "REVIEW_RECEIVED"
    )
    await sendRealTimeNotification(
      booking.craftsmanId,
      "تقييم جديد",
      `قيمك العميل ${user.email} بـ ${rating} نجوم`,
      "REVIEW_RECEIVED"
    )

    return NextResponse.json({
      message: "تم إضافة التقييم بنجاح",
      review
    })
  } catch (error) {
    console.error("Create review error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في إضافة التقييم" },
      { status: 500 }
    )
  }
}