"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { CreditCard, Smartphone, Building, Shield, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

interface BookingDetails {
  id: string
  serviceType: string
  scheduledDate: string
  price: number
  status: string
  craftsman: {
    name: string
    profession: string
    rating: number
  }
}

interface PaymentMethod {
  id: string
  type: "CARD" | "BANK" | "WALLET"
  last4?: string
  bankName?: string
  walletName?: string
  isDefault: boolean
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "card_1",
    type: "CARD",
    last4: "4242",
    isDefault: true
  },
  {
    id: "bank_1",
    type: "BANK",
    bankName: "الراجحي",
    isDefault: false
  },
  {
    id: "wallet_1",
    type: "WALLET",
    walletName: "Apple Pay",
    isDefault: false
  }
]

const paymentProviders = [
  { id: "LOCAL", name: "الدفع المحلي", icon: Building, fee: "0%" },
  { id: "STRIPE", name: "Stripe", icon: CreditCard, fee: "2.9% + 30¢" },
  { id: "PAYPAL", name: "PayPal", icon: Smartphone, fee: "2.9%" }
]

function PaymentContent() {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [selectedProvider, setSelectedProvider] = useState("LOCAL")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: ""
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [savePaymentMethod, setSavePaymentMethod] = useState(false)
  
  const { user, token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const bookingId = searchParams.get("bookingId")

  useEffect(() => {
    if (!user || user.role !== "CUSTOMER") {
      router.push("/auth")
      return
    }

    if (!bookingId) {
      router.push("/dashboard/customer")
      return
    }

    fetchBookingDetails()
  }, [user, router, bookingId])

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/bookings`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const booking = data.bookings.find((b: any) => b.id === bookingId)
        if (booking) {
          setBookingDetails({
            id: booking.id,
            serviceType: booking.serviceType || booking.service?.name || "خدمة عامة",
            scheduledDate: booking.scheduledDate,
            price: booking.price,
            status: booking.status,
            craftsman: {
              name: booking.craftsman.name,
              profession: booking.craftsman.craftsman?.profession || "حرفي",
              rating: booking.craftsman.craftsman?.rating || 0
            }
          })
        }
      }
    } catch (error) {
      console.error("Error fetching booking details:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في جلب تفاصيل الحجز",
        variant: "destructive"
      })
    }
  }

  const handlePayment = async () => {
    if (!bookingDetails || !selectedPaymentMethod) {
      toast({
        title: "حقول مطلوبة",
        description: "يرجى اختيار طريقة الدفع",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    setPaymentStatus("processing")

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: bookingDetails.id,
          amount: bookingDetails.price,
          currency: "SAR",
          provider: selectedProvider,
          paymentMethodId: selectedPaymentMethod,
          savePaymentMethod
        })
      })

      const data = await response.json()

      if (response.ok) {
        setPaymentStatus("success")
        toast({
          title: "تمت عملية الدفع بنجاح",
          description: `رقم العملية: ${data.payment.transactionId}`,
        })
        
        // Redirect to dashboard after success
        setTimeout(() => {
          router.push("/dashboard/customer")
        }, 3000)
      } else {
        setPaymentStatus("error")
        toast({
          title: "فشلت عملية الدفع",
          description: data.error || "حدث خطأ في معالجة الدفع",
          variant: "destructive"
        })
      }
    } catch (error) {
      setPaymentStatus("error")
      toast({
        title: "فشلت عملية الدفع",
        description: "حدث خطأ في الاتصال بالخادم",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case "CARD": return <CreditCard className="h-5 w-5" />
      case "BANK": return <Building className="h-5 w-5" />
      case "WALLET": return <Smartphone className="h-5 w-5" />
      default: return <CreditCard className="h-5 w-5" />
    }
  }

  const getPaymentMethodName = (method: PaymentMethod) => {
    switch (method.type) {
      case "CARD": return `بطاقة انتهاء بـ ****${method.last4}`
      case "BANK": return `حساب بنكي - ${method.bankName}`
      case "WALLET": return `محفظة إلكترونية - ${method.walletName}`
      default: return "طريقة دفع"
    }
  }

  const calculateFee = (amount: number, provider: string) => {
    const providerConfig = paymentProviders.find(p => p.id === provider)
    if (!providerConfig || provider === "LOCAL") return 0
    
    if (provider === "STRIPE") {
      return (amount * 0.029) + 0.30
    }
    if (provider === "PAYPAL") {
      return amount * 0.029
    }
    return 0
  }

  if (!user || !bookingDetails) {
    return <div>Loading...</div>
  }

  const fee = calculateFee(bookingDetails.price, selectedProvider)
  const totalAmount = bookingDetails.price + fee

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard/customer" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="ml-2 h-4 w-4" />
                العودة للوحة التحكم
              </Link>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">دفع آمن ومشفر</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">إتمام الدفع</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>ملخص الحجز</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الخدمة:</span>
                      <span className="font-medium">{bookingDetails.serviceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الحرفي:</span>
                      <span className="font-medium">{bookingDetails.craftsman.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المهنة:</span>
                      <span className="font-medium">{bookingDetails.craftsman.profession}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">التاريخ:</span>
                      <span className="font-medium">
                        {new Date(bookingDetails.scheduledDate).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>المجموع:</span>
                      <span>{bookingDetails.price} ريال</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Provider Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>اختر طريقة الدفع</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {paymentProviders.map((provider) => (
                      <div
                        key={provider.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedProvider === provider.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedProvider(provider.id)}
                      >
                        <div className="text-center">
                          <provider.icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                          <h3 className="font-medium">{provider.name}</h3>
                          <p className="text-sm text-gray-500">{provider.fee}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>طرق الدفع المتاحة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockPaymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPaymentMethod === method.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            {getPaymentMethodIcon(method.type)}
                            <div>
                              <p className="font-medium">{getPaymentMethodName(method)}</p>
                              {method.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                  الافتراضي
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full">
                            {selectedPaymentMethod === method.id && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full m-1"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      + إضافة طريقة دفع جديدة
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Status */}
              {paymentStatus === "processing" && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-6 text-center">
                    <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      جاري معالجة الدفع...
                    </h3>
                    <p className="text-blue-700">
                      يرجى الانتظار بينما نعالج عملية الدفع الخاصة بك
                    </p>
                  </CardContent>
                </Card>
              )}

              {paymentStatus === "success" && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      تمت عملية الدفع بنجاح!
                    </h3>
                    <p className="text-green-700 mb-4">
                      سيتم تحويلك إلى لوحة التحكم خلال ثوانٍ...
                    </p>
                  </CardContent>
                </Card>
              )}

              {paymentStatus === "error" && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-6 text-center">
                    <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                      فشلت عملية الدفع
                    </h3>
                    <p className="text-red-700 mb-4">
                      يرجى التحقق من معلومات الدفع والمحاولة مرة أخرى
                    </p>
                    <Button onClick={() => setPaymentStatus("idle")} variant="outline">
                      المحاولة مرة أخرى
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Pay Button */}
              {paymentStatus === "idle" && (
                <Button
                  onClick={handlePayment}
                  disabled={!selectedPaymentMethod || isProcessing}
                  className="w-full h-12 text-lg bg-gray-900 hover:bg-gray-800"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      جاري المعالجة...
                    </>
                  ) : (
                    `ادفع ${totalAmount.toFixed(2)} ريال`
                  )}
                </Button>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>تفاصيل الدفع</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">قيمة الخدمة:</span>
                      <span>{bookingDetails.price} ريال</span>
                    </div>
                    {fee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">رسوم المعالجة:</span>
                        <span>{fee.toFixed(2)} ريال</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>المجموع:</span>
                      <span>{totalAmount.toFixed(2)} ريال</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">معلومات الحماية</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li className="flex items-center">
                        <Shield className="h-4 w-4 ml-2 text-green-600" />
                        تشفير SSL 256-bit
                      </li>
                      <li className="flex items-center">
                        <Shield className="h-4 w-4 ml-2 text-green-600" />
                        التوافق مع معايير PCI DSS
                      </li>
                      <li className="flex items-center">
                        <Shield className="h-4 w-4 ml-2 text-green-600" />
                        حماية ضد الاحتيال
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentContent />
    </Suspense>
  )
}