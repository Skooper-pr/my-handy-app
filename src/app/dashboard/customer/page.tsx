"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Calendar, MapPin, Star, Clock, LogOut, User, Settings, Bell, Gift, HelpCircle, CreditCard, MessageSquare, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/layout/Navigation"

interface Booking {
  id: string
  provider: {
    id: string
    name: string
    profession: string
    rating: number
    profileImage?: string
  }
  service: {
    name: string
    basePrice: number
  }
  scheduledDate: string
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  location: {
    address: string
    city: string
  }
  price: number
  review?: any
}

export default function CustomerDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const { user, logout, token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== "CUSTOMER") {
      router.push("/auth")
      return
    }

    fetchBookings()
  }, [user, router])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    })
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  const upcomingBookings = bookings.filter(booking => 
    ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(booking.status)
  )
  
  const pastBookings = bookings.filter(booking => 
    booking.status === "COMPLETED"
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {user.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationDropdown />
              <Button variant="outline" size="sm">
                <Settings className="ml-2 h-4 w-4" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="ml-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="ml-2 h-5 w-5" />
                  Upcoming Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading bookings...</p>
                  </div>
                ) : upcomingBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">No upcoming bookings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">{booking.provider.name}</h3>
                              <Badge variant="secondary">{booking.provider.profession}</Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{booking.service.name}</p>
                            <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                              <div className="flex items-center">
                                <Calendar className="ml-1 h-4 w-4" />
                                {formatDate(booking.scheduledDate)}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="ml-1 h-4 w-4" />
                                {booking.location.city}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  <Star className="ml-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium">{booking.provider.rating}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <CreditCard className="ml-1 h-4 w-4" />
                                  <span>${booking.price}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="font-semibold text-lg">${booking.price}</p>
                            <div className="flex flex-col space-y-1">
                              {booking.status === "PENDING" && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      // Cancel booking logic
                                      toast({
                                        title: "Booking Cancelled",
                                        description: "Your booking has been cancelled",
                                      })
                                    }}
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                  >
                                    Cancel
                                  </Button>
                                  <Link href={`/payment?bookingId=${booking.id}`}>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                      Pay Now
                                    </Button>
                                  </Link>
                                </>
                              )}
                              {booking.status === "CONFIRMED" && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    toast({
                                      title: "Contact Provider",
                                      description: "Messaging feature coming soon",
                                    })
                                  }}
                                >
                                  <MessageSquare className="ml-1 h-3 w-3" />
                                  Contact
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Past Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="ml-2 h-5 w-5" />
                  Past Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading bookings...</p>
                  </div>
                ) : pastBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">No past bookings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastBookings.map((booking) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">{booking.service.name}</h3>
                              <Badge variant="outline">Completed</Badge>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                              <div className="flex items-center">
                                <Calendar className="ml-1 h-4 w-4" />
                                {formatDate(booking.scheduledDate)}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="ml-1 h-4 w-4" />
                                {booking.location.city}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                <Star className="ml-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{booking.provider.rating}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <CreditCard className="ml-1 h-4 w-4" />
                                <span>${booking.price}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">${booking.price}</p>
                            {!booking.review && (
                              <Link href={`/review?bookingId=${booking.id}`}>
                                <Button size="sm" className="mt-2 bg-yellow-500 hover:bg-yellow-600">
                                  <Star className="ml-1 h-3 w-3" />
                                  Review
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Refer a Friend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="ml-2 h-5 w-5" />
                  Refer a Friend, Earn Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Invite your friends and earn $25 credit for each successful referral.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Invite Friends
                </Button>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Your referral code:</strong> FRIEND25
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="ml-2 h-5 w-5" />
                  Help & Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/help" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <HelpCircle className="h-4 w-4 ml-2 text-gray-600" />
                      <span className="text-sm">Help Center</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                  
                  <Link href="/contact" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 ml-2 text-gray-600" />
                      <span className="text-sm">Contact Support</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                  
                  <Link href="/faq" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <HelpCircle className="h-4 w-4 ml-2 text-gray-600" />
                      <span className="text-sm">FAQs</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/search">
                    <Button variant="outline" className="w-full justify-start">
                      <Search className="ml-2 h-4 w-4" />
                      Find Services
                    </Button>
                  </Link>
                  <Link href="/book">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="ml-2 h-4 w-4" />
                      Book a Service
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="ml-2 h-4 w-4" />
                      My Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}