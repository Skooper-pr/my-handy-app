"use client"

import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useAuth } from "@/contexts/AuthContext"

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  notifications: any[]
  bookingUpdates: any[]
  messages: any[]
  clearNotifications: () => void
}

export function useSocket(): UseSocketReturn {
  const { token, user } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [bookingUpdates, setBookingUpdates] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    if (!token || !user) {
      return
    }

    // Initialize socket connection
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      auth: {
        token: token
      }
    })

    socketRef.current = socket

    // Connection events
    socket.on("connect", () => {
      console.log("Connected to socket server")
      setIsConnected(true)
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server")
      setIsConnected(false)
    })

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      setIsConnected(false)
    })

    // Notification events
    socket.on("notification", (data) => {
      console.log("Received notification:", data)
      setNotifications(prev => [data, ...prev])
    })

    // Booking update events
    socket.on("booking_notification", (data) => {
      console.log("Received booking update:", data)
      setBookingUpdates(prev => [data, ...prev])
    })

    // Message events
    socket.on("new_message", (data) => {
      console.log("Received new message:", data)
      setMessages(prev => [data, ...prev])
    })

    // Craftsman location updates
    socket.on("craftsman_location", (data) => {
      console.log("Received craftsman location:", data)
      // Handle location updates (e.g., update map, show ETA)
    })

    // Welcome message
    socket.on("connected", (data) => {
      console.log("Welcome message:", data)
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
      setIsConnected(false)
    }
  }, [token, user])

  const clearNotifications = () => {
    setNotifications([])
    setBookingUpdates([])
    setMessages([])
  }

  return {
    socket: socketRef.current,
    isConnected,
    notifications,
    bookingUpdates,
    messages,
    clearNotifications
  }
}