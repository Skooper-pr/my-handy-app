"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useSocket } from "./useSocket"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuth()
  const { notifications: socketNotifications } = useSocket()

  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    if (!token) return

    try {
      const response = await fetch(`/api/notifications${unreadOnly ? '?unreadOnly=true' : ''}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        
        if (unreadOnly) {
          setUnreadCount(data.notifications.length)
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  const markAsRead = useCallback(async (notificationIds: string[]) => {
    if (!token) return

    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ notificationIds })
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notificationIds.includes(notification.id) 
              ? { ...notification, isRead: true }
              : notification
          )
        )
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
    }
  }, [token])

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id)
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds)
    }
  }, [notifications, markAsRead])

  // Handle real-time notifications from Socket.IO
  useEffect(() => {
    if (socketNotifications.length > 0) {
      // Add new socket notifications to the list
      const newNotifications = socketNotifications.map(sn => ({
        id: `socket_${Date.now()}_${Math.random()}`,
        title: sn.title,
        message: sn.message,
        type: sn.type,
        isRead: false,
        createdAt: sn.timestamp
      }))
      
      setNotifications(prev => [...newNotifications, ...prev])
      setUnreadCount(prev => prev + newNotifications.length)
    }
  }, [socketNotifications])

  useEffect(() => {
    if (token) {
      fetchNotifications(true)
    }
  }, [token, fetchNotifications])

  // Set up periodic refresh for unread count
  useEffect(() => {
    if (!token) return

    const interval = setInterval(() => {
      fetchNotifications(true)
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [token, fetchNotifications])

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  }
}