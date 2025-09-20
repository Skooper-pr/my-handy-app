"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, DollarSign, User, Star, ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Navigation } from "@/components/layout/Navigation"

const mockProvider = {
  id: "1",
  name: "Sophia Carter",
  profession: "House Cleaner",
  rating: 4.9,
  reviews: 123,
  experience: 5,
  location: "Downtown",
  priceRange: { min: 40, max: 75 },
  description: "Professional house cleaning services with 5+ years of experience. Specializing in deep cleaning and organization.",
  skills: ["House Cleaning", "Deep Cleaning", "Laundry", "Organization"],
  image: "/api/placeholder/80/80",
  verified: true
}

const mockServices = [
  { id: "1", name: "House Cleaning", description: "Regular home cleaning service", basePrice: 50 },
  { id: "2", name: "Deep Cleaning", description: "Thorough deep cleaning service", basePrice: 75 },
  { id: "3", name: "Laundry", description: "Wash, dry, and fold laundry", basePrice: 40 }
]

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM"
]

function BookingContent() {
  const [selectedService, setSelectedService] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: DateTime, 2: Details
  const [provider, setProvider] = useState(mockProvider)
  const [services, setServices] = useState(mockServices)
  
  const { user, token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!user || user.role !== "CUSTOMER") {
      router.push("/auth")
      return
    }

    const providerId = searchParams.get("providerId")
    if (providerId) {
      // TODO: Fetch provider data from API
      // For now using mock data
    }
  }, [user, router, searchParams])

  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId)
    const service = services.find(s => s.id === serviceId)
    if (service) {
      setPrice(service.basePrice.toString())
    }
  }

  const handleDateTimeSubmit = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Selection Required",
        description: "Please select both date and time",
        variant: "destructive",
      })
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedService || !selectedDate || !selectedTime || !price || !location) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          providerId: provider.id,
          serviceId: selectedService,
          serviceType: services.find(s => s.id === selectedService)?.name,
          description,
          scheduledDate: `${selectedDate.toISOString().split('T')[0]}T${selectedTime}`,
          price: parseFloat(price),
          location: JSON.stringify({
            address: location,
            city: provider.location
          })
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking")
      }

      toast({
        title: "Booking Created",
        description: "Your booking request has been sent to the provider",
      })

      router.push("/dashboard/customer")
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <Link href="/search" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="ml-2 h-4 w-4" />
              Back to Search
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Select date and time</h1>
          <p className="text-gray-600 mb-8">Choose a date and time slot that works best for you.</p>

          {step === 1 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calendar Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="ml-2 h-5 w-5" />
                    Select Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              {/* Time Slots Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="ml-2 h-5 w-5" />
                    Available Time Slots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className="h-12"
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Please select a date first
                    </p>
                  )}
                  
                  {selectedDate && selectedTime && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Selected:</strong> {selectedDate.toLocaleDateString()} at {selectedTime}
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full mt-6 bg-green-600 hover:bg-green-700"
                    onClick={handleDateTimeSubmit}
                    disabled={!selectedDate || !selectedTime}
                  >
                    Continue to Booking
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Provider Info */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Provider Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <Avatar className="h-20 w-20 mx-auto mb-3">
                        <AvatarImage src={provider.image} alt={provider.name} />
                        <AvatarFallback className="text-lg">{provider.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-semibold">{provider.name}</h3>
                      <div className="flex items-center justify-center space-x-2 mt-1">
                        <p className="text-gray-600">{provider.profession}</p>
                        {provider.verified && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Verified Pro
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-center space-x-1 space-x-reverse mt-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{provider.rating}</span>
                        <span className="text-gray-500">({provider.reviews} reviews)</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="ml-2 h-4 w-4" />
                        {provider.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="ml-2 h-4 w-4" />
                        {provider.priceRange.min} - {provider.priceRange.max} ${provider.priceRange.min === provider.priceRange.max ? "/hr" : "/hr"}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Experience:</span> {provider.experience} years on platform
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Services</h4>
                      <div className="space-y-2">
                        {services.map((service) => (
                          <div key={service.id} className="flex justify-between items-center text-sm">
                            <span>{service.name}</span>
                            <span className="font-medium">${service.basePrice}/hr</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Booking Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Selected Date/Time Summary */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Selected Schedule</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <p className="font-medium">{selectedDate?.toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Time:</span>
                            <p className="font-medium">{selectedTime}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="service">Service Required</Label>
                        <Select value={selectedService} onValueChange={handleServiceChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select the service you need" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name} - ${service.basePrice}/hr
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="location">Service Location</Label>
                        <Input
                          id="location"
                          placeholder="Enter your full address"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="price">Estimated Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="Enter estimated price"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Service Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the service you need in detail..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Booking Summary</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Provider:</span>
                            <span>{provider.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Service:</span>
                            <span>{services.find(s => s.id === selectedService)?.name || "Not selected"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Date & Time:</span>
                            <span>{selectedDate?.toLocaleDateString()} {selectedTime}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>${price || "0"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setStep(1)}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          disabled={isLoading}
                        >
                          {isLoading ? "Creating Booking..." : "Confirm Booking"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingContent />
    </Suspense>
  )
}