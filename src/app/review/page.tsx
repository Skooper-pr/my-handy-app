"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { Star, Calendar, MapPin, User, ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

function ReviewContent() {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [booking, setBooking] = useState<any>(null)
  const [craftsman, setCraftsman] = useState<any>(null)
  
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

    if (bookingId) {
      // TODO: Fetch booking data from API
      // Mock data for now
      setBooking({
        id: bookingId,
        serviceType: "تصليح خزانة",
        scheduledDate: "2024-01-10",
        price: 250,
        status: "COMPLETED",
        location: "الرياض"
      })

      setCraftsman({
        id: "1",
        name: "أحمد محمد",
        profession: "نجار",
        rating: 4.8,
        reviews: 127,
        image: "/api/placeholder/80/80"
      })
    }
  }, [user, router, bookingId])

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast({
        title: "التقييم مطلوب",
        description: "يرجى اختيار تقييم من 1 إلى 5 نجوم",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId,
          rating,
          comment: comment.trim() || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "فشل إضافة التقييم")
      }

      toast({
        title: "شكراً لتقييمك",
        description: "تم إضافة تقييمك بنجاح ومشاركته تساعد الآخرين",
      })

      router.push("/dashboard/customer")
    } catch (error: any) {
      toast({
        title: "فشل إضافة التقييم",
        description: error.message || "حدث خطأ في إضافة التقييم",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1 space-x-reverse">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`p-1 rounded-full transition-colors ${
              star <= (hoverRating || rating)
                ? "text-yellow-400"
                : "text-gray-300 hover:text-yellow-300"
            }`}
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          >
            <Star className={`h-8 w-8 ${star <= (hoverRating || rating) ? "fill-current" : ""}`} />
          </button>
        ))}
      </div>
    )
  }

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "سيء جداً"
      case 2: return "سيء"
      case 3: return "مقبول"
      case 4: return "جيد"
      case 5: return "ممتاز"
      default: return ""
    }
  }

  if (!user || !booking || !craftsman) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">منصة الحرفيين</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <Link href="/dashboard/customer" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة للوحة التحكم
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">تقييم الخدمة</h1>

          <div className="space-y-6">
            {/* Booking Info */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الحجز</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">الخدمة</Label>
                    <p className="text-lg font-semibold">{booking.serviceType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">التاريخ</Label>
                    <p className="text-lg font-semibold">{booking.scheduledDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">الموقع</Label>
                    <p className="text-lg font-semibold">{booking.location}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">السعر</Label>
                    <p className="text-lg font-semibold">{booking.price} ريال</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Craftsman Info */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الحرفي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={craftsman.image} alt={craftsman.name} />
                    <AvatarFallback>{craftsman.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{craftsman.name}</h3>
                    <p className="text-gray-600">{craftsman.profession}</p>
                    <div className="flex items-center space-x-1 space-x-reverse mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{craftsman.rating}</span>
                      <span className="text-gray-500">({craftsman.reviews} تقييم)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rating Form */}
            <Card>
              <CardHeader>
                <CardTitle>تقييم الخدمة</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      كيف كانت تجربتك مع الخدمة؟
                    </Label>
                    <div className="flex items-center space-x-4 space-x-reverse">
                      {renderStars()}
                      {rating > 0 && (
                        <span className="text-lg font-medium text-gray-700">
                          {getRatingText(rating)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="comment">أضف تعليقاً (اختياري)</Label>
                    <Textarea
                      id="comment"
                      placeholder="شارك تجربتك مع الخدمة لمساعدة الآخرين..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {comment.length}/500 حرف
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">نصائح لكتابة تقييم مفيد:</h4>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>صف جودة الخدمة التي تلقيتها</li>
                      <li>اذكر مدى التزام الحرفي بالمواعيد</li>
                      <li>تحدث عن التعامل والاحترافية</li>
                      <li>شارك إذا كنت ستوصي بالحرفي للآخرين</li>
                    </ul>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gray-900 hover:bg-gray-800"
                    disabled={isLoading || rating === 0}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                        جاري إرسال التقييم...
                      </>
                    ) : (
                      <>
                        <Save className="ml-2 h-4 w-4" />
                        إرسال التقييم
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <ReviewContent />
    </Suspense>
  )
}