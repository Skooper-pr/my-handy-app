"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name?: string
  phone?: string
  role: "CUSTOMER" | "CRAFTSMAN" | "ADMIN"
  profileImage?: string
  isVerified: boolean
  isBlocked: boolean
  createdAt: string
  updatedAt: string
  customer?: any
  craftsman?: any
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string, role: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "فشل تسجيل الدخول")
      }

      setToken(data.token)
      setUser(data.user)
      
      // Save to localStorage
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: any) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "فشل إنشاء الحساب")
      }

      setToken(data.token)
      setUser(data.user)
      
      // Save to localStorage
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}