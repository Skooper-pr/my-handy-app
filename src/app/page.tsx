"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion"
import { Search, Star, MapPin, Calendar, Users, Award, Clock, CheckCircle, LogIn, UserPlus, Home as HomeIcon, Wrench, Zap, PaintBucket, Hammer, Droplets, Sparkles, ArrowRight, Play, MousePointer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"

const featuredCategories = [
  { name: "Home Cleaning", icon: HomeIcon, description: "Keep your home spotless", gradient: "from-blue-500 to-cyan-400" },
  { name: "Plumbing", icon: Droplets, description: "Expert plumbing services", gradient: "from-blue-600 to-blue-400" },
  { name: "Electrical", icon: Zap, description: "Licensed electricians", gradient: "from-yellow-500 to-orange-400" },
  { name: "Painting", icon: PaintBucket, description: "Professional painting", gradient: "from-purple-500 to-pink-400" },
  { name: "Carpentry", icon: Hammer, description: "Custom woodwork", gradient: "from-amber-600 to-yellow-400" },
  { name: "Repairs", icon: Wrench, description: "Fix anything, anywhere", gradient: "from-green-500 to-emerald-400" }
]

const featuredProviders = [
  {
    id: "1",
    name: "Alex Bennett",
    profession: "Master Plumber",
    rating: 4.9,
    reviews: 123,
    price: 50,
    distance: 5,
    badge: "Top Rated",
    image: "/api/placeholder/80/80",
    experience: "8+ years",
    specialties: ["Emergency repairs", "Installation", "Maintenance"]
  },
  {
    id: "2", 
    name: "Sophia Carter",
    profession: "Cleaning Expert",
    rating: 4.8,
    reviews: 98,
    price: 60,
    distance: 7,
    badge: "Verified",
    image: "/api/placeholder/80/80",
    experience: "5+ years",
    specialties: ["Deep cleaning", "Organization", "Eco-friendly"]
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
    image: "/api/placeholder/80/80",
    experience: "3+ years",
    specialties: ["Residential", "Commercial", "Emergency"]
  }
]

const stats = [
  { number: "10K+", label: "Happy Customers" },
  { number: "500+", label: "Verified Pros" },
  { number: "50K+", label: "Jobs Completed" },
  { number: "98%", label: "Satisfaction Rate" }
]

// Simplified Magnetic Button Component
const MagneticButton = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    setPosition({ x: x * 0.1, y: y * 0.1 }) // Reduced sensitivity
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }} // Reduced springiness
      className="inline-block"
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const router = useRouter()
  
  // Mouse movement tracking for interactive particles
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (location) params.set("city", location)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      
      {/* Enhanced Hero Section with Advanced Parallax and Interactive Effects */}
      <section className="relative h-[600px] overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Simplified Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/3 via-cyan-500/3 to-transparent" />
        
        {/* Simplified Interactive Particles - Reduced Count */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => {
            const angle = (i / 5) * Math.PI * 2
            const radius = 50 + Math.sin(Date.now() * 0.001 + i) * 25
            const x = mousePosition.x + Math.cos(angle) * radius
            const y = mousePosition.y + Math.sin(angle) * radius
            
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-blue-200/10 rounded-full"
                style={{
                  left: x,
                  top: y,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            )
          })}
        </div>
        
        {/* Reduced Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-300/5 to-cyan-300/5 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 10 - 5, 0],
                opacity: [0.05, 0.2, 0.05],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 6 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-12">
            {/* Left Side - Welcome Message Square */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="flex-1 max-w-md"
            >
              <motion.div 
                className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-xl p-6 shadow-lg relative overflow-hidden"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                {/* Simplified Background Pattern */}
                <div className="absolute inset-0 opacity-3">
                  <div 
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  />
                </div>
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full px-4 py-2 mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-semibold">Welcome to FixConnect</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                    Find <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Trustworthy</span> Local Pros
                  </h2>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Get help with any home project, from repairs to renovations. Quality service, guaranteed.
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Verified Professionals</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Quality Guaranteed</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right Side - Search Bar */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex-1 max-w-xl"
            >
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm relative overflow-hidden">
                <CardContent className="p-6 relative z-10">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                      <Input
                        placeholder="What service do you need?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-14 text-base pl-12 pr-4 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200"
                        required
                      />
                    </div>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                      <Input
                        placeholder="Your Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="h-14 text-base pl-12 pr-4 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <span className="flex items-center justify-center">
                        Search
                        <Search className="ml-2 h-5 w-5" />
                      </span>
                    </Button>
                  </form>
                  
                  {/* Quick Search Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {["Plumbing", "Cleaning", "Electrician", "Painting"].map((tag, index) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm rounded-full border border-blue-200 transition-all duration-200"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Simplified Featured Categories Section */}
      <section id="categories" className="py-20 px-4 bg-gray-50">
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-700 rounded-full px-6 py-3 mb-6">
              <Award className="w-5 h-5" />
              <span className="text-sm font-bold">Popular Services</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Featured Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover our curated selection of premium services designed to meet your every need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCategories.map((category, index) => (
              <div
                key={category.name}
                className="group"
              >
                <Card className="h-full border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-8 h-full flex flex-col items-center justify-center text-center">
                    <div className={`w-20 h-20 mb-6 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <category.icon className="h-10 w-10 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    
                    <div className="flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore services
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Top Rated Providers Section with Advanced Animations */}
      <section id="providers" className="py-32 px-4 bg-gradient-to-br from-white via-blue-50 via-purple-50 to-indigo-50 relative overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute w-96 h-96 bg-gradient-to-r from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"
            style={{
              left: "10%",
              top: "20%",
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute w-80 h-80 bg-gradient-to-r from-cyan-200/10 to-blue-200/10 rounded-full blur-3xl"
            style={{
              right: "15%",
              bottom: "30%",
            }}
            animate={{
              x: [0, -25, 0],
              y: [0, 15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-100 via-orange-100 to-yellow-100 text-orange-700 rounded-full px-6 py-3 mb-6 shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Star className="w-5 h-5 fill-current" />
              </motion.div>
              <span className="text-sm font-bold">Top Rated Professionals</span>
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">
              Meet Our Experts
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connect with skilled professionals who are dedicated to delivering exceptional service and quality results
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 80, rotateZ: 5 }}
                whileInView={{ opacity: 1, y: 0, rotateZ: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
                whileHover={{ y: -15 }}
              >
                <Card className="h-full border-0 bg-white/80 backdrop-blur-sm shadow-2xl group-hover:shadow-4xl transition-all duration-500 overflow-hidden relative">
                  {/* Animated Border Effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    animate={{
                      background: [
                        "linear-gradient(to right, #3b82f6, #a855f7, #06b6d4)",
                        "linear-gradient(to right, #06b6d4, #3b82f6, #a855f7)",
                        "linear-gradient(to right, #a855f7, #06b6d4, #3b82f6)"
                      ]
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  <CardContent className="p-8 relative z-10">
                    {/* Provider Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <motion.div 
                          className="relative"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Avatar className="h-16 w-16 border-3 border-white shadow-xl">
                            <AvatarImage src={provider.image} alt={provider.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-lg font-bold">
                              {provider.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {/* Online Status Indicator */}
                          <motion.div 
                            className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-3 border-white rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </motion.div>
                        
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                            {provider.name}
                          </h3>
                          <p className="text-gray-600 font-medium">{provider.profession}</p>
                        </div>
                      </div>
                      
                      {/* Animated Badge */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          provider.badge === "Top Rated" 
                            ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white" 
                            : provider.badge === "Verified" 
                            ? "bg-gradient-to-r from-green-400 to-emerald-400 text-white"
                            : "bg-gradient-to-r from-blue-400 to-cyan-400 text-white"
                        }`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        {provider.badge}
                      </motion.div>
                    </div>
                    
                    {/* Rating and Reviews */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.6 + i * 0.1 + index * 0.1 }}
                            >
                              <Star 
                                className={`w-4 h-4 ${
                                  i < Math.floor(provider.rating) 
                                    ? "text-yellow-400 fill-current" 
                                    : "text-gray-300"
                                }`} 
                              />
                            </motion.div>
                          ))}
                        </div>
                        <span className="text-lg font-bold text-gray-900">{provider.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">{provider.reviews} reviews</span>
                    </div>
                    
                    {/* Experience and Specialties */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Experience</span>
                        <span className="font-semibold text-gray-900">{provider.experience}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Rate</span>
                        <span className="font-bold text-xl text-blue-600">${provider.price}/hr</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Distance</span>
                        <span className="font-semibold text-gray-900">{provider.distance} mi</span>
                      </div>
                      
                      {/* Specialties */}
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mb-2">Specialties:</p>
                        <div className="flex flex-wrap gap-2">
                          {provider.specialties.map((specialty, i) => (
                            <motion.span
                              key={specialty}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.8 + i * 0.1 + index * 0.1 }}
                              className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                              whileHover={{ scale: 1.05 }}
                            >
                              {specialty}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-3 space-x-reverse">
                      <MagneticButton>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          View Profile
                        </Button>
                      </MagneticButton>
                      <MagneticButton>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 font-semibold transition-all duration-300"
                        >
                          Compare
                        </Button>
                      </MagneticButton>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <MagneticButton>
              <Link href="/search">
                <Button 
                  size="lg" 
                  className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg shadow-2xl hover:shadow-3xl transform transition-all duration-300 relative overflow-hidden group"
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400"
                    animate={{
                      x: [-100, 100],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{ opacity: 0.3 }}
                  />
                  <span className="relative z-10 flex items-center">
                    View All Professionals
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </span>
                </Button>
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
