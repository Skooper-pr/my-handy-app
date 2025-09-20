"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Search, LogIn, UserPlus, Bell, User, ChevronDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useNotifications } from "@/hooks/useNotifications"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown"

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (location) params.set("city", location)
    router.push(`/search?${params.toString()}`)
    setIsSearchOpen(false)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const navigationLinks = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Find Services" },
    { href: "/#categories", label: "Services" },
    { href: "/#providers", label: "Top Pros" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100" 
          : "bg-transparent"
      } ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Enhanced Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 space-x-reverse group">
                <motion.div 
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
                >
                  <Sparkles className="text-white h-5 w-5" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    FixConnect
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Service Marketplace</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8 space-x-reverse">
              {navigationLinks.map((link, index) => (
                <motion.div key={link.href} whileHover={{ y: -2 }}>
                  <Link
                    href={link.href}
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 relative group"
                  >
                    {link.label}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4 space-x-reverse">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </motion.div>

              {user ? (
                <>
                  <NotificationDropdown />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-50">
                          <Avatar className="h-9 w-9 border-2 border-white shadow-md">
                            <AvatarImage src={user.profileImage || undefined} alt={user.name || "User"} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                              {user.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          {/* Online indicator */}
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-3 p-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profileImage || undefined} alt={user.name || "User"} />
                          <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="w-[200px] truncate text-sm text-gray-500">
                            {user.email}
                          </p>
                          <Badge variant="secondary" className="w-fit text-xs">
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={user.role === "CRAFTSMAN" ? "/dashboard/craftsman" : "/dashboard/customer"}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/profile">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/settings">
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 hover:text-red-700">
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/auth">
                      <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50">
                        <LogIn className="ml-2 h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/auth">
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold shadow-lg">
                        <UserPlus className="ml-2 h-4 w-4" />
                        Become a Pro
                      </Button>
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2 space-x-reverse">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                  className="text-gray-600"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </motion.div>
              {user && (
                <div className="relative">
                  <NotificationDropdown />
                </div>
              )}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-600"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white border-t border-gray-100 shadow-lg"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigationLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {!user && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="pt-4 pb-3 border-t border-gray-200"
                  >
                    <div className="flex items-center px-4 mb-3">
                      <Link href="/auth" onClick={() => setIsMenuOpen(false)} className="w-full">
                        <Button variant="outline" size="sm" className="w-full justify-center border-gray-300">
                          <LogIn className="ml-2 h-4 w-4" />
                          Login
                        </Button>
                      </Link>
                    </div>
                    <div className="px-4">
                      <Link href="/auth" onClick={() => setIsMenuOpen(false)} className="w-full">
                        <Button size="sm" className="w-full justify-center bg-gradient-to-r from-blue-600 to-cyan-500">
                          <UserPlus className="ml-2 h-4 w-4" />
                          Become a Pro
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -50 }}
              className="fixed inset-x-4 top-20 z-50"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Find Your Service</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsSearchOpen(false)}
                      className="hover:bg-gray-100"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        placeholder="What service do you need?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-14 text-lg pl-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <Input
                        placeholder="Your Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="h-14 text-lg pl-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold text-lg shadow-lg"
                    >
                      <Search className="ml-2 h-6 w-6" />
                      Search Services
                    </Button>
                  </form>
                  
                  {/* Quick search suggestions */}
                  <div className="mt-6">
                    <p className="text-sm text-gray-600 mb-3">Popular searches:</p>
                    <div className="flex flex-wrap gap-2">
                      {["Plumbing", "House Cleaning", "Electrician", "Painting", "Carpentry"].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setSearchQuery(suggestion)
                            setTimeout(() => {
                              const params = new URLSearchParams()
                              params.set("q", suggestion)
                              if (location) params.set("city", location)
                              router.push(`/search?${params.toString()}`)
                              setIsSearchOpen(false)
                            }, 100)
                          }}
                          className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 text-sm rounded-full transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}