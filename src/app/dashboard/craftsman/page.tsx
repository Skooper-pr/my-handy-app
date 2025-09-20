"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, MapPin, Star, Clock, CheckCircle, XCircle, LogOut, User, Settings, Bell, Plus, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { useRouter } from "next/navigation"

const mockBookings = [
  {
    id: "1",
    customer: "محمد أحمد",
    service: "تصليح خزانة",
    date: "2024-01-15",
    time: "10:00 ص",
    status: "PENDING",
    location: "الرياض",
    price: 250,
    description: "أحتاج إلى تصليح باب الخزانة المنزلية"
  },
  {
    id: "2",
    customer: "عبدالله سالم",
    service: "تركيب أرفف",
    date: "2024-01-18",
    time: "2:00 م",
    status: "CONFIRMED",
    location: "الرياض",
    price: 350,
    description: "تركيب أرفف خشبية في غرفة المعيشة"
  },
  {
    id: "3",
    customer: "سعد خالد",
    service: "صيانة باب",
    date: "2024-01-10",
    time: "11:00 ص",
    status: "COMPLETED",
    location: "الرياض",
    price: 200,
    description: "صيانة باب الغرفة وتغيير المقابض"
  }
]

const mockServices = [
  { id: "1", name: "تصليح أثاث", description: "تصليح جميع أنواع الأثاث الخشبي", basePrice: 200 },
  { id: "2", name: "تركيب خزائن", description: "تركيب خزائن جديدة حسب الطلب", basePrice: 500 },
  { id: "3", name: "صيانة أبواب", description: "صيانة وتركيب الأبواب الداخلية", basePrice: 150 }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING": return "bg-yellow-100 text-yellow-800"
    case "CONFIRMED": return "bg-green-100 text-green-800"
    case "IN_PROGRESS": return "bg-blue-100 text-blue-800"
    case "COMPLETED": return "bg-gray-100 text-gray-800"
    case "CANCELLED": return "bg-red-100 text-red-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "PENDING": return "قيد الانتظار"
    case "CONFIRMED": return "مؤكد"
    case "IN_PROGRESS": return "قيد التنفيذ"
    case "COMPLETED": return "مكتمل"
    case "CANCELLED": return "ملغي"
    default: return status
  }
}

export default function CraftsmanDashboard() {
  const [bookings, setBookings] = useState(mockBookings)
  const [services, setServices] = useState(mockServices)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    profession: "نجار",
    experience: "15",
    description: "خبير في تصليح وتركيب الأثاث الخشبي مع أكثر من 15 عاماً من الخبرة",
    skills: "تصليح الأثاث, تركيب الخزائن, صيانة الأبواب, النجارة الدقيقة",
    minPrice: "200",
    maxPrice: "500"
  })
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== "CRAFTSMAN") {
      router.push("/auth")
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك بنجاح",
    })
    router.push("/")
  }

  const handleBookingAction = (bookingId: string, action: 'confirm' | 'cancel') => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: action === 'confirm' ? 'CONFIRMED' : 'CANCELLED' }
        : booking
    ))
    
    toast({
      title: action === 'confirm' ? "تم تأكيد الحجز" : "تم إلغاء الحجز",
      description: action === 'confirm' 
        ? "تم تأكيد حجز العميل بنجاح" 
        : "تم إلغاء حجز العميل",
    })
  }

  const handleSaveProfile = () => {
    setIsEditingProfile(false)
    toast({
      title: "تم تحديث الملف الشخصي",
      description: "تم تحديث معلوماتك بنجاح",
    })
  }

  const handleAddService = () => {
    // TODO: Implement add service functionality
    toast({
      title: "إضافة خدمة",
      description: "سيتم فتح نموذج إضافة خدمة جديدة",
    })
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">لوحة التحكم</h1>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <NotificationDropdown />
              <Button variant="outline" size="sm">
                <Settings className="ml-2 h-4 w-4" />
                الإعدادات
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="ml-2 h-4 w-4" />
                تسجيل الخروج
              </Button>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImage} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            مرحباً بك، {user.name}
          </h2>
          <p className="text-gray-600">إدارة ملفك الشخصي وحجوزاتك</p>
        </motion.div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings">طلبات الحجز</TabsTrigger>
            <TabsTrigger value="services">الخدمات</TabsTrigger>
            <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bookings List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="ml-2 h-5 w-5" />
                      طلبات الحجز الواردة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                                <h3 className="font-semibold">{booking.customer}</h3>
                                <Badge className={getStatusColor(booking.status)}>
                                  {getStatusText(booking.status)}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-2">{booking.service}</p>
                              <p className="text-sm text-gray-500 mb-3">{booking.description}</p>
                              <div className="flex items-center text-sm text-gray-500 space-x-4 space-x-reverse">
                                <div className="flex items-center">
                                  <Calendar className="ml-1 h-4 w-4" />
                                  {booking.date}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="ml-1 h-4 w-4" />
                                  {booking.time}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="ml-1 h-4 w-4" />
                                  {booking.location}
                                </div>
                              </div>
                            </div>
                            <div className="text-left space-y-2">
                              <p className="font-semibold text-lg">{booking.price} ريال</p>
                              {booking.status === "PENDING" && (
                                <div className="space-y-2">
                                  <Button 
                                    size="sm" 
                                    className="w-full"
                                    onClick={() => handleBookingAction(booking.id, 'confirm')}
                                  >
                                    <CheckCircle className="ml-1 h-4 w-4" />
                                    تأكيد
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => handleBookingAction(booking.id, 'cancel')}
                                  >
                                    <XCircle className="ml-1 h-4 w-4" />
                                    رفض
                                  </Button>
                                </div>
                              )}
                              {booking.status === "CONFIRMED" && (
                                <Button size="sm" className="w-full">
                                  بدء العمل
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>إحصائيات سريعة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
                      <p className="text-sm text-blue-600">إجمالي الطلبات</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {bookings.filter(b => b.status === "PENDING").length}
                      </p>
                      <p className="text-sm text-yellow-600">قيد الانتظار</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {bookings.filter(b => b.status === "COMPLETED").length}
                      </p>
                      <p className="text-sm text-green-600">مكتملة</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {bookings.reduce((sum, b) => sum + b.price, 0)}
                      </p>
                      <p className="text-sm text-purple-600">إجمالي الدخل</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="services">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">الخدمات المقدمة</h3>
                <Button onClick={handleAddService}>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة خدمة
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {service.name}
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{service.description}</p>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{service.basePrice} ريال</p>
                          <p className="text-sm text-gray-500">السعر الأساسي</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    الملف الشخصي
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                    >
                      <Edit className="ml-2 h-4 w-4" />
                      {isEditingProfile ? "إلغاء" : "تعديل"}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditingProfile ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="profession">المهنة</Label>
                        <Select value={profileForm.profession} onValueChange={(value) => setProfileForm({...profileForm, profession: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="نجار">نجار</SelectItem>
                            <SelectItem value="سباك">سباك</SelectItem>
                            <SelectItem value="كهربائي">كهربائي</SelectItem>
                            <SelectItem value="نقاش">نقاش</SelectItem>
                            <SelectItem value="حداد">حداد</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="experience">سنوات الخبرة</Label>
                        <Input
                          id="experience"
                          value={profileForm.experience}
                          onChange={(e) => setProfileForm({...profileForm, experience: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">الوصف</Label>
                        <Textarea
                          id="description"
                          value={profileForm.description}
                          onChange={(e) => setProfileForm({...profileForm, description: e.target.value})}
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="skills">المهارات (مفصولة بفواصل)</Label>
                        <Input
                          id="skills"
                          value={profileForm.skills}
                          onChange={(e) => setProfileForm({...profileForm, skills: e.target.value})}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="minPrice">أقل سعر</Label>
                          <Input
                            id="minPrice"
                            value={profileForm.minPrice}
                            onChange={(e) => setProfileForm({...profileForm, minPrice: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxPrice">أعلى سعر</Label>
                          <Input
                            id="maxPrice"
                            value={profileForm.maxPrice}
                            onChange={(e) => setProfileForm({...profileForm, maxPrice: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <Button onClick={handleSaveProfile} className="w-full">
                        حفظ التغييرات
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={user.profileImage} alt={user.name} />
                          <AvatarFallback className="text-lg">{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-semibold">{user.name}</h3>
                          <p className="text-gray-600">{profileForm.profession}</p>
                          <div className="flex items-center space-x-1 space-x-reverse mt-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">4.8</span>
                            <span className="text-gray-500">(127 تقييم)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">عني</h4>
                        <p className="text-gray-600">{profileForm.description}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">المهارات</h4>
                        <div className="flex flex-wrap gap-2">
                          {profileForm.skills.split(',').map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill.trim()}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">نطاق السعر</h4>
                        <p className="text-gray-600">{profileForm.minPrice} - {profileForm.maxPrice} ريال</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>معرض الأعمال</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">صورة {item}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    إضافة صور
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}