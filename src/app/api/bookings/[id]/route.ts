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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "غير مصرح به" }, { status: 401 })
    }

    const { status, price } = await request.json()
    const bookingId = params.id

    if (!status) {
      return NextResponse.json(
        { error: "حالة الحجز مطلوبة" },
        { status: 400 }
      )
    }

    // Get the booking
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        craftsman: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "الحجز غير موجود" },
        { status: 404 }
      )
    }

    // Check permissions
    const isCustomer = booking.customerId === user.userId
    const isCraftsman = booking.craftsmanId === user.userId

    if (!isCustomer && !isCraftsman && user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح به" }, { status: 403 })
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      "PENDING": ["CONFIRMED", "CANCELLED"],
      "CONFIRMED": ["IN_PROGRESS", "CANCELLED"],
      "IN_PROGRESS": ["COMPLETED", "CANCELLED"],
      "COMPLETED": [],
      "CANCELLED": []
    }

    const currentStatus = booking.status
    const allowedTransitions = validTransitions[currentStatus]

    if (!allowedTransitions.includes(status)) {
      return NextResponse.json(
        { error: "لا يمكن تغيير الحالة إلى الحالة المطلوبة" },
        { status: 400 }
      )
    }

    // Additional permission checks
    if (status === "CONFIRMED" && !isCraftsman && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "فقط الحرفي يمكنه تأكيد الحجز" },
        { status: 403 }
      )
    }

    if (status === "CANCELLED") {
      if (!isCustomer && !isCraftsman && user.role !== "ADMIN") {
        return NextResponse.json({ error: "غير مصرح به" }, { status: 403 })
      }
    }

    // Update booking
    const updateData: any = { status }
    if (price) {
      updateData.price = parseFloat(price)
    }

    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: updateData,
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
      }
    })

    // Send notifications based on status change
    const statusMessages = {
      "CONFIRMED": {
        customer: "تم تأكيد حجزك من قبل الحرفي",
        craftsman: "تم تأكيد الحجز الجديد"
      },
      "IN_PROGRESS": {
        customer: "الحرفي بدأ في تنفيذ الخدمة",
        craftsman: "بدأت في تنفيذ الخدمة"
      },
      "COMPLETED": {
        customer: "تم إكمال الخدمة بنجاح",
        craftsman: "تم إكمال الخدمة"
      },
      "CANCELLED": {
        customer: "تم إلغاء الحجز",
        craftsman: "تم إلغاء الحجز"
      }
    }

    const notificationTypeMap = {
      "CONFIRMED": "BOOKING_CONFIRMED",
      "IN_PROGRESS": "BOOKING_CONFIRMED",
      "COMPLETED": "BOOKING_COMPLETED",
      "CANCELLED": "BOOKING_CANCELLED"
    }

    const notificationType = (notificationTypeMap[status as keyof typeof notificationTypeMap] || "BOOKING_REQUEST") as "BOOKING_REQUEST" | "BOOKING_CONFIRMED" | "BOOKING_CANCELLED" | "BOOKING_COMPLETED" | "REVIEW_RECEIVED" | "PAYMENT_CONFIRMED" | "PAYMENT_RECEIVED" | "SYSTEM"

    // Notify customer
    if (statusMessages[status]?.customer) {
      await createNotification(
        booking.customerId,
        "تحديث حالة الحجز",
        statusMessages[status].customer,
        notificationType
      )
      await sendRealTimeNotification(
        booking.customerId,
        "تحديث حالة الحجز",
        statusMessages[status].customer,
        notificationType
      )
    }

    // Notify craftsman (if not the one who made the change)
    if (statusMessages[status]?.craftsman && user.userId !== booking.craftsmanId) {
      await createNotification(
        booking.craftsmanId,
        "تحديث حالة الحجز",
        statusMessages[status].craftsman,
        notificationType
      )
      await sendRealTimeNotification(
        booking.craftsmanId,
        "تحديث حالة الحجز",
        statusMessages[status].craftsman,
        notificationType
      )
    }

    return NextResponse.json({
      message: "تم تحديث الحجز بنجاح",
      booking: updatedBooking
    })
  } catch (error) {
    console.error("Update booking error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في تحديث الحجز" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "غير مصرح به" }, { status: 401 })
    }

    const bookingId = params.id

    // Get the booking
    const booking = await db.booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "الحجز غير موجود" },
        { status: 404 }
      )
    }

    // Check permissions
    const isCustomer = booking.customerId === user.userId
    const isCraftsman = booking.craftsmanId === user.userId

    if (!isCustomer && !isCraftsman && user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح به" }, { status: 403 })
    }

    // Only allow deletion of pending bookings or by admin
    if (booking.status !== "PENDING" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "لا يمكن حذف الحجز في هذه الحالة" },
        { status: 400 }
      )
    }

    // Delete booking
    await db.booking.delete({
      where: { id: bookingId }
    })

    return NextResponse.json({
      message: "تم حذف الحجز بنجاح"
    })
  } catch (error) {
    console.error("Delete booking error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في حذف الحجز" },
      { status: 500 }
    )
  }
}