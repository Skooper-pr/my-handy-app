"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Calendar, Star, TrendingUp, LogOut, Settings, Bell, UserCheck, UserX, Search, Filter, MoreHorizontal, Ban, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { useRouter } from "next/navigation"

const mockUsers = [
  {
    id: "1",
    name: "أحمد محمد",
    email: "ahmed@example.com",
    role: "CUSTOMER",
    isVerified: true,
    isBlocked: false,
    createdAt: "2024-01-01",
    bookingsCount: 5
  },
  {
    id: "2",
    name: "عبدالله خالد",
    email: "abdullah@example.com",
    role: "CRAFTSMAN",
    isVerified: true,
    isBlocked: false,
    createdAt: "2024-01-02",
    bookingsCount: 12
  },
  {
    id: "3",
    name: "محمد علي",
    email: "mohamed@example.com",
    role: "CRAFTSMAN",
    isVerified: false,
    isBlocked: false,
    createdAt: "2024-01-03",
    bookingsCount: 0
  },
  {
    id: "4",
    name: "سعد عبدالله",
    email: "saad@example.com",
    role: "CUSTOMER",
    isVerified: true,
    isBlocked: true,
    createdAt: "2024-01-04",
    bookingsCount: 3
  }
]

const mockStats = {
  totalUsers: 1247,
  totalCraftsmen: 342,
  totalCustomers: 905,
  totalBookings: 2156,
  totalRevenue: 542300,
  pendingApprovals: 23,
  activeBookings: 156
}

const mockRecentActivity = [
  {
    id: "1",
    user: "أحمد محمد",
    action: "إنشاء حجز جديد",
    details: "حجز خدمة نجارة مع عبدالله خالد",
    time: "منذ ساعتين"
  },
  {
    id: "2",
    user: "عبدالله خالد",
    action: "تحديث الملف الشخصي",
    details: "إضافة مهارات جديدة",
    time: "منذ 3 ساعات"
  },
  {
    id: "3",
    user: "محمد علي",
    action: "تسجيل جديد",
    details: "تسجيل كحرفي (قيد الانتظار)",
    time: "منذ 5 ساعات"
  },
  {
    id: "4",
    user: "سعد عبدالله",
    action: "إلغاء حجز",
    details: "إلغاء حجز الخدمة رقم 45",
    time: "منذ يوم"
  }
]

const getRoleText = (role: string) => {
  switch (role) {
    case "CUSTOMER": return "عميل"
    case "CRAFTSMAN": return "حرفي"
    case "ADMIN": return "مدير"
    default: return role
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "CUSTOMER": return "bg-blue-100 text-blue-800"
    case "CRAFTSMAN": return "bg-green-100 text-green-800"
    case "ADMIN": return "bg-purple-100 text-purple-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

export default function AdminDashboard() {
  const [users, setUsers] = useState(mockUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
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

  const handleUserAction = (userId: string, action: 'block' | 'unblock' | 'verify' | 'approve') => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { 
            ...u, 
            isBlocked: action === 'block' ? true : action === 'unblock' ? false : u.isBlocked,
            isVerified: action === 'verify' ? true : u.isVerified
          }
        : u
    ))
    
    const actionMessages = {
      block: "تم حظر المستخدم",
      unblock: "تم فك حظر المستخدم",
      verify: "تم توثيق المستخدم",
      approve: "تم قبول الحرفي"
    }
    
    toast({
      title: actionMessages[action],
      description: "تم تنفيذ الإجراء بنجاح",
    })
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

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
              <h1 className="text-xl font-bold text-gray-900">لوحة تحكم المدير</h1>
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
          <p className="text-gray-600">إدارة المنصة والتحكم في جميع المستخدمين</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "إجمالي المستخدمين", value: mockStats.totalUsers, icon: Users, color: "bg-blue-500" },
            { title: "إجمالي الحرفيين", value: mockStats.totalCraftsmen, icon: UserCheck, color: "bg-green-500" },
            { title: "إجمالي الحجوزات", value: mockStats.totalBookings, icon: Calendar, color: "bg-purple-500" },
            { title: "الإيرادات", value: `${mockStats.totalRevenue.toLocaleString()} ريال`, icon: TrendingUp, color: "bg-yellow-500" }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">المستخدمون</TabsTrigger>
            <TabsTrigger value="activity">النشاطات</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Users className="ml-2 h-5 w-5" />
                    إدارة المستخدمين
                  </CardTitle>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="relative">
                      <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="بحث عن مستخدم..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10 w-64"
                      />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">الكل</SelectItem>
                        <SelectItem value="CUSTOMER">عملاء</SelectItem>
                        <SelectItem value="CRAFTSMAN">حرفيين</SelectItem>
                        <SelectItem value="ADMIN">مديرين</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المستخدم</TableHead>
                      <TableHead>البريد الإلكتروني</TableHead>
                      <TableHead>الدور</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الحجوزات</TableHead>
                      <TableHead>تاريخ الإنشاء</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.profileImage || undefined} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {getRoleText(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-x-1 space-x-reverse">
                            {user.isVerified && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                موثق
                              </Badge>
                            )}
                            {user.isBlocked && (
                              <Badge variant="destructive">
                                محظور
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{user.bookingsCount}</TableCell>
                        <TableCell>{user.createdAt}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {user.role === "CRAFTSMAN" && !user.isVerified && (
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, 'approve')}>
                                  <Check className="ml-2 h-4 w-4" />
                                  قبول الحرفي
                                </DropdownMenuItem>
                              )}
                              {!user.isVerified && (
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, 'verify')}>
                                  <Check className="ml-2 h-4 w-4" />
                                  توثيق الحساب
                                </DropdownMenuItem>
                              )}
                              {user.isBlocked ? (
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, 'unblock')}>
                                  <UserCheck className="ml-2 h-4 w-4" />
                                  فك الحظر
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, 'block')}>
                                  <UserX className="ml-2 h-4 w-4" />
                                  حظر المستخدم
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>النشاطات الحديثة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRecentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 space-x-reverse">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{activity.user}</p>
                            <span className="text-sm text-gray-500">{activity.time}</span>
                          </div>
                          <p className="text-sm text-gray-600">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ملخص سريع</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <UserCheck className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">قيد الانتظار</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">{mockStats.pendingApprovals}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <span className="font-medium">حجوزات نشطة</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{mockStats.activeBookings}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Star className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">متوسط التقييم</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">4.7</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>نمو المستخدمين</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">مخطط نمو المستخدمين</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الحجوزات الشهرية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">مخطط الحجوزات الشهرية</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>توزيع المستخدمين</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">مخطط توزيع المستخدمين</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الإيرادات الشهرية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">مخطط الإيرادات الشهرية</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}