"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, Check, Clock, Info, AlertCircle, Star, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useNotifications } from "@/hooks/useNotifications"
import { useAuth } from "@/contexts/AuthContext"

interface NotificationDropdownProps {
  onClose?: () => void
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "BOOKING_REQUEST":
      return <Calendar className="h-4 w-4" />
    case "BOOKING_CONFIRMED":
      return <Check className="h-4 w-4" />
    case "BOOKING_CANCELLED":
      return <X className="h-4 w-4" />
    case "BOOKING_COMPLETED":
      return <Star className="h-4 w-4" />
    case "REVIEW_RECEIVED":
      return <Star className="h-4 w-4" />
    case "SYSTEM":
      return <Info className="h-4 w-4" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case "BOOKING_REQUEST":
      return "bg-blue-50 text-blue-600 border-blue-200"
    case "BOOKING_CONFIRMED":
      return "bg-green-50 text-green-600 border-green-200"
    case "BOOKING_CANCELLED":
      return "bg-red-50 text-red-600 border-red-200"
    case "BOOKING_COMPLETED":
      return "bg-purple-50 text-purple-600 border-purple-200"
    case "REVIEW_RECEIVED":
      return "bg-yellow-50 text-yellow-600 border-yellow-200"
    case "SYSTEM":
      return "bg-gray-50 text-gray-600 border-gray-200"
    default:
      return "bg-gray-50 text-gray-600 border-gray-200"
  }
}

const getTypeText = (type: string) => {
  switch (type) {
    case "BOOKING_REQUEST":
      return "طلب حجز"
    case "BOOKING_CONFIRMED":
      return "تأكيد حجز"
    case "BOOKING_CANCELLED":
      return "إلغاء حجز"
    case "BOOKING_COMPLETED":
      return "إكمال حجز"
    case "REVIEW_RECEIVED":
      return "تقييم جديد"
    case "SYSTEM":
      return "نظام"
    default:
      return "إشعار"
  }
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const { user } = useAuth()

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead([notificationId])
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "الآن"
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `منذ ${diffInDays} أيام`
    
    return date.toLocaleDateString('ar-SA')
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="ml-2 h-4 w-4" />
        الإشعارات
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setIsOpen(false)
                onClose?.()
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 mt-2 w-80 z-50"
            >
              <Card className="shadow-lg border">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">الإشعارات</h3>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="text-xs"
                      >
                        تعيين الكل كمقروء
                      </Button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>لا توجد إشعارات</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                            !notification.isRead ? "bg-blue-50/30" : ""
                          }`}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3 space-x-reverse">
                            <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-sm truncate">
                                  {notification.title}
                                </h4>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <Badge variant="outline" className="text-xs">
                                    {getTypeText(notification.type)}
                                  </Badge>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{formatTime(notification.createdAt)}</span>
                                {notification.isRead && (
                                  <span className="flex items-center">
                                    <Check className="h-3 w-3 ml-1" />
                                    مقروء
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t bg-gray-50 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setIsOpen(false)
                        onClose?.()
                      }}
                    >
                      عرض جميع الإشعارات
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}