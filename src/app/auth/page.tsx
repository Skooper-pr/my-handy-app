"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, User, Lock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    role: "customer"
  })
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "customer"
  })
  const [isLoading, setIsLoading] = useState(false)
  
  const { login, register } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await login(loginForm.email, loginForm.password, loginForm.role)
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في منصة الحرفيين",
      })
      
      // Redirect based on role
      if (loginForm.role === "customer") {
        router.push("/dashboard/customer")
      } else if (loginForm.role === "craftsman") {
        router.push("/dashboard/craftsman")
      } else if (loginForm.role === "admin") {
        router.push("/dashboard/admin")
      }
    } catch (error: any) {
      toast({
        title: "فشل تسجيل الدخول",
        description: error.message || "حدث خطأ في تسجيل الدخول",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "خطأ في التسجيل",
        description: "كلمات المرور غير متطابقة",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      await register(registerForm)
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "مرحباً بك في منصة الحرفيين",
      })
      
      // Redirect based on role
      if (registerForm.role === "customer") {
        router.push("/dashboard/customer")
      } else if (registerForm.role === "craftsman") {
        router.push("/dashboard/craftsman")
      }
    } catch (error: any) {
      toast({
        title: "فشل إنشاء الحساب",
        description: error.message || "حدث خطأ في إنشاء الحساب",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة للرئيسية
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">مرحباً بك</h1>
            <p className="text-gray-600 mt-2">سجل دخولك أو أنشئ حساباً جديداً</p>
          </div>

          <Card className="shadow-xl">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="register">إنشاء حساب</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <CardHeader>
                  <CardTitle className="text-xl">تسجيل الدخول</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <div className="relative">
                        <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="أدخل بريدك الإلكتروني"
                          className="pr-10"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">كلمة المرور</Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="أدخل كلمة المرور"
                          className="pr-10"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">نوع المستخدم</Label>
                      <Select value={loginForm.role} onValueChange={(value) => setLoginForm({ ...loginForm, role: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع المستخدم" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">عميل</SelectItem>
                          <SelectItem value="craftsman">حرفي</SelectItem>
                          <SelectItem value="admin">مدير</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800" disabled={isLoading}>
                      {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-gray-900">
                      نسيت كلمة المرور؟
                    </Link>
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="register">
                <CardHeader>
                  <CardTitle className="text-xl">إنشاء حساب جديد</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم الكامل</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="أدخل اسمك الكامل"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email">البريد الإلكتروني</Label>
                      <div className="relative">
                        <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="أدخل بريدك الإلكتروني"
                          className="pr-10"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="أدخل رقم هاتفك"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-password">كلمة المرور</Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="أدخل كلمة المرور"
                          className="pr-10"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="أعد إدخال كلمة المرور"
                          className="pr-10"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-role">نوع المستخدم</Label>
                      <Select value={registerForm.role} onValueChange={(value) => setRegisterForm({ ...registerForm, role: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع المستخدم" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">عميل</SelectItem>
                          <SelectItem value="craftsman">حرفي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800" disabled={isLoading}>
                      {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}