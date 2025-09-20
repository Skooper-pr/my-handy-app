import { motion } from "framer-motion"
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube, Linkedin, Clock, Shield, Heart, Sparkles, ArrowRight, Star } from "lucide-react"
import Link from "next/link"

export function Footer() {
  const footerLinks = {
    Services: [
      { href: "/search", label: "Find Professionals" },
      { href: "/#services", label: "All Services" },
      { href: "/book", label: "Book a Service" },
      { href: "/payment", label: "Payment Methods" },
    ],
    Company: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
      { href: "/careers", label: "Careers" },
      { href: "/press", label: "Press Kit" },
    ],
    MyAccount: [
      { href: "/auth", label: "Sign In" },
      { href: "/auth", label: "Register" },
      { href: "/dashboard/customer", label: "Dashboard" },
      { href: "/profile", label: "My Profile" },
    ],
    Support: [
      { href: "/help", label: "Help Center" },
      { href: "/faq", label: "FAQs" },
      { href: "/support", label: "Customer Support" },
      { href: "/feedback", label: "Feedback" },
    ],
  }

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ]

  const testimonials = [
    { text: "Amazing service! Found the perfect plumber in minutes.", author: "Sarah M." },
    { text: "Professional, reliable, and affordable. Highly recommended!", author: "John D." },
    { text: "Made home renovations so much easier. Thank you!", author: "Emily R." }
  ]

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section with CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-semibold">Join Our Community</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and professional service providers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg shadow-xl">
                  Get Started as Customer
                </button>
              </motion.div>
            </Link>
            <Link href="/auth">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300">
                  Become a Service Pro
                  <ArrowRight className="ml-2 w-5 h-5 inline" />
                </button>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Logo and Description */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-center space-x-3 space-x-reverse mb-6">
                <motion.div 
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="text-white h-6 w-6" />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    FixConnect
                  </h2>
                  <p className="text-sm text-gray-400">Service Marketplace</p>
                </div>
              </div>
              <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                Your trusted platform for finding the best local professionals and home services. 
                We connect customers with skilled service providers for exceptional quality and reliability.
              </p>

              {/* Testimonials */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white mb-3">What Our Customers Say</h4>
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4"
                  >
                    <p className="text-gray-300 text-sm mb-2 italic">"{testimonial.text}"</p>
                    <p className="text-blue-400 text-sm font-medium">- {testimonial.author}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold text-white mb-4">Get in Touch</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 space-x-reverse text-gray-300 group">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <Phone className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Call Us</p>
                    <p className="text-sm">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse text-gray-300 group">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Email</p>
                    <p className="text-sm">support@fixconnect.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse text-gray-300 group">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <MapPin className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Location</p>
                    <p className="text-sm">New York, NY & Surrounding Areas</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([category, links], index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <h3 className="text-xl font-bold mb-6 text-white group-hover:text-blue-400 transition-colors">
                  {category}
                </h3>
                <ul className="space-y-3">
                  {links.map((link, linkIndex) => (
                    <motion.li key={link.href} whileHover={{ x: 5 }}>
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-all duration-200 text-sm flex items-center group"
                      >
                        <span className="group-hover:text-blue-400 transition-colors">{link.label}</span>
                        <ArrowRight className="ml-2 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Social Links and Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 pt-8 border-t border-white/10"
        >
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-8 lg:space-y-0">
            {/* Social Links */}
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <h4 className="text-lg font-semibold text-white">Follow Us</h4>
              <div className="flex space-x-4 space-x-reverse">
                {socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center text-gray-300 hover:bg-blue-600 hover:text-white hover:scale-110 transition-all duration-300 group"
                    aria-label={social.label}
                  >
                    <social.icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-col items-center space-y-4">
              <h4 className="text-lg font-semibold text-white">Why Choose Us</h4>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                  <Heart className="h-5 w-5 text-red-400" />
                  <span>Customer Loved</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span>Top Rated</span>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="flex flex-col items-center lg:items-end space-y-4">
              <h4 className="text-lg font-semibold text-white">Stay Updated</h4>
              <div className="flex space-x-2 space-x-reverse">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/20"
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-black/30 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-gray-400 text-sm text-center md:text-left"
            >
              © {new Date().getFullYear()} FixConnect. All rights reserved.
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-wrap items-center justify-center space-x-6 space-x-reverse text-sm text-gray-400"
            >
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
              <Link href="/sitemap" className="hover:text-white transition-colors">
                Sitemap
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-400 text-sm text-center md:text-right"
            >
              Made with <Heart className="inline text-red-400 h-4 w-4" /> by FixConnect Team
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  )
}