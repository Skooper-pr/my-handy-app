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

// Mock payment providers
const PAYMENT_PROVIDERS = {
  STRIPE: "stripe",
  PAYPAL: "paypal", 
  LOCAL: "local"
}

// Mock payment processing
async function processPayment(paymentData: {
  amount: number
  currency: string
  provider: string
  paymentMethodId: string
  bookingId: string
}) {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  // Simulate random failure (5% chance)
  if (Math.random() < 0.05) {
    throw new Error("فشلت عملية الدفع، يرجى المحاولة مرة أخرى")
  }

  // Generate mock transaction ID
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return {
    success: true,
    transactionId,
    amount: paymentData.amount,
    currency: paymentData.currency,
    provider: paymentData.provider,
    status: "COMPLETED",
    timestamp: new Date().toISOString()
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user || user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "غير مصرح به" }, { status: 401 })
    }

    const {
      bookingId,
      amount,
      currency = "SAR",
      provider = "LOCAL",
      paymentMethodId,
      savePaymentMethod = false
    } = await request.json()

    if (!bookingId || !amount || !paymentMethodId) {
      return NextResponse.json(
        { error: "جميع الحقول المطلوبة يجب ملؤها" },
        { status: 400 }
      )
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: "المبلغ يجب أن يكون أكبر من صفر" },
        { status: 400 }
      )
    }

    // Get booking details
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

    // Check if user owns the booking
    if (booking.customerId !== user.userId) {
      return NextResponse.json(
        { error: "غير مصرح لك بالدفع لهذا الحجز" },
        { status: 403 }
      )
    }

    // Check if booking is in a payable state
    if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "لا يمكن الدفع للحجز في هذه الحالة" },
        { status: 400 }
      )
    }

    // Check if payment already exists
    const existingPayment = await db.payment.findFirst({
      where: { 
        bookingId,
        status: "COMPLETED"
      }
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: "تم الدفع لهذا الحجز مسبقاً" },
        { status: 400 }
      )
    }

    // Process payment
    try {
      const paymentResult = await processPayment({
        amount,
        currency,
        provider,
        paymentMethodId,
        bookingId
      })

      // Create payment record
      const payment = await db.payment.create({
        data: {
          bookingId,
          customerId: user.userId,
          craftsmanId: booking.craftsmanId,
          amount,
          currency,
          provider,
          transactionId: paymentResult.transactionId,
          status: "COMPLETED",
          paymentMethodId,
          metadata: JSON.stringify({
            processedAt: paymentResult.timestamp,
            gatewayResponse: paymentResult
          })
        }
      })

      // Update booking status to CONFIRMED if it was PENDING
      if (booking.status === "PENDING") {
        await db.booking.update({
          where: { id: bookingId },
          data: { status: "CONFIRMED" }
        })
      }

      // Send notifications
      await createNotification(
        user.userId,
        "تم تأكيد الدفع",
        `تم تأكيد دفع مبلغ ${amount} ${currency} للحجز`,
        "PAYMENT_CONFIRMED"
      )
      await sendRealTimeNotification(
        user.userId,
        "تم تأكيد الدفع",
        `تم تأكيد دفع مبلغ ${amount} ${currency} للحجز`,
        "PAYMENT_CONFIRMED"
      )

      await createNotification(
        booking.craftsmanId,
        "دفع جديد",
        `تم دفع مبلغ ${amount} ${currency} للحجز ${bookingId}`,
        "PAYMENT_RECEIVED"
      )
      await sendRealTimeNotification(
        booking.craftsmanId,
        "دفع جديد",
        `تم دفع مبلغ ${amount} ${currency} للحجز ${bookingId}`,
        "PAYMENT_RECEIVED"
      )

      return NextResponse.json({
        message: "تمت عملية الدفع بنجاح",
        payment: {
          id: payment.id,
          transactionId: payment.transactionId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          timestamp: paymentResult.timestamp
        }
      })

    } catch (paymentError: any) {
      // Create failed payment record for tracking
      const failedTransactionId = `failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await db.payment.create({
        data: {
          bookingId,
          customerId: user.userId,
          craftsmanId: booking.craftsmanId,
          amount,
          currency,
          provider,
          transactionId: failedTransactionId,
          status: "FAILED",
          paymentMethodId,
          metadata: JSON.stringify({
            error: paymentError.message,
            failedAt: new Date().toISOString()
          })
        }
      })

      return NextResponse.json(
        { error: paymentError.message || "فشلت عملية الدفع" },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في معالجة الدفع" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "غير مصرح به" }, { status: 401 })
    }

    const url = new URL(request.url)
    const bookingId = url.searchParams.get("bookingId")

    let whereClause: any = {}
    
    if (user.role === "CUSTOMER") {
      whereClause.customerId = user.userId
    } else if (user.role === "CRAFTSMAN") {
      whereClause.craftsmanId = user.userId
    }

    if (bookingId) {
      whereClause.bookingId = bookingId
    }

    const payments = await db.payment.findMany({
      where: whereClause,
      include: {
        booking: {
          select: {
            id: true,
            serviceType: true,
            scheduledDate: true,
            status: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        craftsman: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Get payments error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في جلب المدفوعات" },
      { status: 500 }
    )
  }
}