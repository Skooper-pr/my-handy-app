"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { Search, Star, MapPin, DollarSign, Grid, List, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Navigation } from "@/components/layout/Navigation"

interface Provider {
  id: string
  name: string
  profession: string
  rating: number
  reviews: number
  price: number
  distance: number
  badge: "Top Rated" | "Verified" | "New"
  image: string
}

const mockProviders: Provider[] = [
  {
    id: "1",
    name: "Alex Bennett",
    profession: "Plumber",
    rating: 4.9,
    reviews: 123,
    price: 50,
    distance: 5,
    badge: "Top Rated",
    image: "/api/placeholder/80/80"
  },
  {
    id: "2", 
    name: "Sophia Carter",
    profession: "House Cleaner",
    rating: 4.8,
    reviews: 98,
    price: 60,
    distance: 7,
    badge: "Verified",
    image: "/api/placeholder/80/80"
  },
  {
    id: "3",
    name: "Ethan Davis",
    profession: "Electrician", 
    rating: 4.7,
    reviews: 45,
    price: 45,
    distance: 3,
    badge: "New",
    image: "/api/placeholder/80/80"
  },
  {
    id: "4",
    name: "Michael Rodriguez",
    profession: "Carpenter",
    rating: 4.6,
    reviews: 67,
    price: 55,
    distance: 8,
    badge: "Verified",
    image: "/api/placeholder/80/80"
  },
  {
    id: "5",
    name: "Emma Thompson",
    profession: "Painter",
    rating: 4.9,
    reviews: 89,
    price: 40,
    distance: 4,
    badge: "Top Rated",
    image: "/api/placeholder/80/80"
  },
  {
    id: "6",
    name: "James Wilson",
    profession: "Handyman",
    rating: 4.5,
    reviews: 34,
    price: 35,
    distance: 6,
    badge: "New",
    image: "/api/placeholder/80/80"
  }
]

function SearchContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [providers, setProviders] = useState<Provider[]>(mockProviders)
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>(mockProviders)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  
  // Filter states
  const [minRating, setMinRating] = useState(0)
  const [priceRange, setPriceRange] = useState([0, 200])
  const [maxDistance, setMaxDistance] = useState(50)
  const [availability, setAvailability] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("rating")
  
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Load initial search from URL
    const query = searchParams.get("q") || ""
    const loc = searchParams.get("location") || ""
    
    setSearchQuery(query)
    setLocation(loc)
    
    if (query) {
      filterProviders()
    }
  }, [searchParams])

  const filterProviders = () => {
    let filtered = [...providers]
    
    // Filter by rating
    if (minRating > 0) {
      filtered = filtered.filter(p => p.rating >= minRating)
    }
    
    // Filter by price
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    
    // Filter by distance
    filtered = filtered.filter(p => p.distance <= maxDistance)
    
    // Sort
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "distance":
        filtered.sort((a, b) => a.distance - b.distance)
        break
    }
    
    setFilteredProviders(filtered)
  }

  useEffect(() => {
    filterProviders()
  }, [minRating, priceRange, maxDistance, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    filterProviders()
    
    // Update URL
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (location) params.set("location", location)
    
    router.push(`/search?${params.toString()}`, { scroll: false })
  }

  const handleProviderSelect = (providerId: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    )
  }

  const handleBookNow = (providerId: string) => {
    if (!user) {
      router.push("/auth")
      return
    }
    router.push(`/book?providerId=${providerId}`)
  }

  const resetFilters = () => {
    setMinRating(0)
    setPriceRange([0, 200])
    setMaxDistance(50)
    setAvailability([])
    setSortBy("rating")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Plumbers near you</h1>
          <p className="text-gray-600">Find and compare the best plumbers in your area</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-3 block">Rating</label>
                  <Select value={minRating.toString()} onValueChange={(value) => setMinRating(parseFloat(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">All Ratings</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-3 block">Price Range ($/hr)</label>
                  <div className="px-3">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={200}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Distance Filter */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-3 block">Distance (miles)</label>
                  <Select value={maxDistance.toString()} onValueChange={(value) => setMaxDistance(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Within 5 miles</SelectItem>
                      <SelectItem value="10">Within 10 miles</SelectItem>
                      <SelectItem value="25">Within 25 miles</SelectItem>
                      <SelectItem value="50">Within 50 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Availability Filter */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-3 block">Availability</label>
                  <div className="space-y-2">
                    {["Today", "This Week", "Next Week"].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox 
                          id={option}
                          checked={availability.includes(option)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAvailability(prev => [...prev, option])
                            } else {
                              setAvailability(prev => prev.filter(a => a !== option))
                            }
                          }}
                        />
                        <label htmlFor={option} className="text-sm">{option}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compare Button */}
                <Button 
                  variant="outline" 
                  className="w-full mb-4"
                  disabled={selectedProviders.length < 2}
                >
                  Compare Providers ({selectedProviders.length})
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Sort Bar */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex-1">
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <Input
                        placeholder="Search providers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Location..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-48"
                      />
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Top Rated</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="distance">Distance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                {filteredProviders.length} providers found
              </p>
            </div>

            {/* Providers Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4 space-x-reverse">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProviders.map((provider, index) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4 space-x-reverse">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={provider.image} alt={provider.name} />
                            <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold">{provider.name}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                provider.badge === "Top Rated" ? "bg-yellow-100 text-yellow-800" :
                                provider.badge === "Verified" ? "bg-green-100 text-green-800" :
                                "bg-blue-100 text-blue-800"
                              }`}>
                                {provider.badge}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 mb-3">{provider.profession}</p>
                            
                            <div className="flex items-center justify-between text-sm mb-4">
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{provider.rating}</span>
                                <span className="text-gray-500">({provider.reviews})</span>
                              </div>
                              <div className="text-gray-600">
                                ${provider.price}/hr
                              </div>
                              <div className="text-gray-600">
                                {provider.distance} mi
                              </div>
                            </div>
                            
                            <div className="flex space-x-2 space-x-reverse">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleProviderSelect(provider.id)}
                              >
                                {selectedProviders.includes(provider.id) ? "Selected" : "Compare"}
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleBookNow(provider.id)}
                              >
                                View Profile
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <h3 className="text-lg font-semibold mb-2">No providers found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search criteria</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}