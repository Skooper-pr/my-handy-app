"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, MapPin, DollarSign, Calendar, MessageCircle, BookOpen, Image, MessageSquare, ChevronLeft, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/layout/Navigation"

const mockProvider = {
  id: "1",
  name: "Sophia Carter",
  profession: "House Cleaner",
  rating: 4.9,
  reviews: 123,
  experience: 5,
  location: "Downtown",
  description: "Professional house cleaning services with 5+ years of experience. I specialize in deep cleaning, organization, and creating sparkling clean homes for my clients. Attention to detail and customer satisfaction are my top priorities.",
  image: "/api/placeholder/120/120",
  verified: true,
  contact: {
    email: "sophia.carter@email.com",
    phone: "+1 (555) 123-4567"
  }
}

const services = [
  { id: "1", name: "House Cleaning", description: "Regular home cleaning service", price: 50, duration: "2-3 hours" },
  { id: "2", name: "Deep Cleaning", description: "Thorough deep cleaning service", price: 75, duration: "4-6 hours" },
  { id: "3", name: "Laundry", description: "Wash, dry, and fold laundry", price: 40, duration: "2-3 hours" }
]

const galleryImages = [
  "https://images.unsplash.com/photo-1581578731548-cfc1ca0f3cbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1584017912646-28f0e495bc6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
]

const reviews = [
  {
    id: "1",
    customerName: "Sarah Johnson",
    rating: 5,
    date: "2024-01-15",
    comment: "Sophia did an amazing job cleaning my apartment! She was thorough, professional, and left everything sparkling clean. Highly recommend!",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: "2",
    customerName: "Mike Chen",
    rating: 5,
    date: "2024-01-10",
    comment: "Excellent service! Sophia paid attention to every detail and my house has never been cleaner. Will definitely book again.",
    avatar: "/api/placeholder/40/40"
  }
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("services")
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleBookNow = () => {
    if (!user) {
      router.push("/auth")
      return
    }
    router.push(`/book?providerId=${mockProvider.id}`)
  }

  const handleMessage = () => {
    if (!user) {
      router.push("/auth")
      return
    }
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the provider",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <Link href="/search" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ChevronLeft className="ml-2 h-4 w-4" />
              Back to Search
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Provider Info */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarImage src={mockProvider.image} alt={mockProvider.name} />
                      <AvatarFallback className="text-2xl">{mockProvider.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <h2 className="text-2xl font-bold">{mockProvider.name}</h2>
                      {mockProvider.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Verified Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{mockProvider.profession}</p>
                    
                    <div className="flex items-center justify-center space-x-1 space-x-reverse mb-4">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xl font-semibold">{mockProvider.rating}</span>
                      <span className="text-gray-500">({mockProvider.reviews} reviews)</span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-6">
                      <span className="font-medium">{mockProvider.experience} years on platform</span>
                    </div>

                    <div className="flex space-x-3 mb-6">
                      <Button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={handleBookNow}
                      >
                        <BookOpen className="ml-2 h-4 w-4" />
                        Book Now
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={handleMessage}
                      >
                        <MessageCircle className="ml-2 h-4 w-4" />
                        Message
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="ml-3 h-5 w-5" />
                      <span>{mockProvider.location}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="ml-3 h-5 w-5" />
                      <span>{mockProvider.contact.email}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="ml-3 h-5 w-5" />
                      <span>{mockProvider.contact.phone}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-3">About</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {mockProvider.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Services, Gallery, Reviews */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-0">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
                      <TabsTrigger value="services" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                        Services
                      </TabsTrigger>
                      <TabsTrigger value="gallery" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                        Gallery
                      </TabsTrigger>
                      <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                        Reviews
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="services" className="p-6">
                      <div className="space-y-4">
                        {services.map((service) => (
                          <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                              <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 ml-1" />
                                  <span>${service.price}/hr</span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 ml-1" />
                                  <span>{service.duration}</span>
                                </div>
                              </div>
                            </div>
                            <Button 
                              onClick={handleBookNow}
                              className="ml-4"
                            >
                              Book
                            </Button>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="gallery" className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {galleryImages.map((image, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative group cursor-pointer"
                          >
                            <div className="aspect-square rounded-lg overflow-hidden">
                              <img
                                src={image}
                                alt={`Gallery image ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                              <Image className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" alt="Gallery" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="reviews" className="p-6">
                      <div className="space-y-6">
                        {/* Overall Rating */}
                        <div className="text-center py-6 border-b">
                          <div className="flex items-center justify-center space-x-1 space-x-reverse mb-2">
                            <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                            <span className="text-4xl font-bold">{mockProvider.rating}</span>
                          </div>
                          <p className="text-gray-600">Based on {mockProvider.reviews} reviews</p>
                        </div>

                        {/* Individual Reviews */}
                        <div className="space-y-4">
                          {reviews.map((review) => (
                            <div key={review.id} className="border-b pb-4 last:border-b-0">
                              <div className="flex items-start space-x-3 space-x-reverse">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={review.avatar} alt={review.customerName} />
                                  <AvatarFallback>{review.customerName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold">{review.customerName}</h4>
                                    <div className="flex items-center space-x-1 space-x-reverse">
                                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                      <span className="text-sm font-medium">{review.rating}</span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-500 mb-2">
                                    {new Date(review.date).toLocaleDateString()}
                                  </p>
                                  <p className="text-gray-700">{review.comment}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}