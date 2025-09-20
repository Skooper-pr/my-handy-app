import { PrismaClient, UserRole, BookingStatus, PaymentStatus, NotificationType } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

// Sample data for seeding
const serviceCategories = [
  {
    name: 'Home Cleaning',
    description: 'Professional home cleaning services',
    icon: 'home-icon'
  },
  {
    name: 'Plumbing',
    description: 'Expert plumbing services and repairs',
    icon: 'droplets-icon'
  },
  {
    name: 'Electrical',
    description: 'Licensed electrical work and installations',
    icon: 'zap-icon'
  },
  {
    name: 'Painting',
    description: 'Interior and exterior painting services',
    icon: 'paint-bucket-icon'
  },
  {
    name: 'Carpentry',
    description: 'Custom woodwork and furniture',
    icon: 'hammer-icon'
  },
  {
    name: 'Repairs',
    description: 'General home repairs and maintenance',
    icon: 'wrench-icon'
  },
  {
    name: 'Landscaping',
    description: 'Garden design and maintenance',
    icon: 'tree-icon'
  },
  {
    name: 'HVAC',
    description: 'Heating, ventilation, and air conditioning',
    icon: 'thermometer-icon'
  }
]

const sampleUsers = [
  // Admin User
  {
    email: 'admin@handydz.com',
    name: 'System Administrator',
    role: UserRole.ADMIN,
    phone: '+966501234567',
    isVerified: true,
    isBlocked: false,
    password: 'admin123456'
  },
  // Sample Customers
  {
    email: 'ahmed.customer@gmail.com',
    name: 'Ahmed Al-Rashid',
    role: UserRole.CUSTOMER,
    phone: '+966501111111',
    isVerified: true,
    isBlocked: false,
    password: 'customer123',
    address: {
      street: 'King Fahd Road',
      city: 'Riyadh',
      district: 'Al-Malaz',
      zipCode: '11564',
      country: 'Saudi Arabia',
      coordinates: { lat: 24.7136, lng: 46.6753 }
    }
  },
  {
    email: 'fatima.customer@gmail.com',
    name: 'Fatima Al-Zahra',
    role: UserRole.CUSTOMER,
    phone: '+966502222222',
    isVerified: true,
    isBlocked: false,
    password: 'customer123',
    address: {
      street: 'Prince Mohammed Bin Abdulaziz Street',
      city: 'Jeddah',
      district: 'Al-Hamra',
      zipCode: '21514',
      country: 'Saudi Arabia',
      coordinates: { lat: 21.5289, lng: 39.1579 }
    }
  },
  // Sample Craftsmen
  {
    email: 'mohammed.plumber@gmail.com',
    name: 'Mohammed Al-Harthi',
    role: UserRole.CRAFTSMAN,
    phone: '+966503333333',
    isVerified: true,
    isBlocked: false,
    password: 'craftsman123',
    address: {
      street: 'Al-Madinah Road',
      city: 'Riyadh',
      district: 'Al-Naseem',
      zipCode: '11564',
      country: 'Saudi Arabia',
      coordinates: { lat: 24.7136, lng: 46.6753 }
    },
    craftsman: {
      profession: 'Master Plumber',
      experience: 8,
      description: 'Experienced plumber specializing in residential and commercial plumbing systems.',
      skills: ['Pipe Installation', 'Leak Repair', 'Water Heater Installation', 'Drain Cleaning'],
      priceRange: { min: 100, max: 500 },
      availability: {
        sunday: { available: true, hours: '08:00-18:00' },
        monday: { available: true, hours: '08:00-18:00' },
        tuesday: { available: true, hours: '08:00-18:00' },
        wednesday: { available: true, hours: '08:00-18:00' },
        thursday: { available: true, hours: '08:00-18:00' },
        friday: { available: false, hours: null },
        saturday: { available: true, hours: '09:00-15:00' }
      },
      portfolio: [
        'https://example.com/portfolio/plumber1.jpg',
        'https://example.com/portfolio/plumber2.jpg'
      ],
      rating: 4.8,
      reviewsCount: 156,
      isApproved: true
    }
  },
  {
    email: 'salem.electrician@gmail.com',
    name: 'Salem Al-Qarni',
    role: UserRole.CRAFTSMAN,
    phone: '+966504444444',
    isVerified: true,
    isBlocked: false,
    password: 'craftsman123',
    address: {
      street: 'King Abdul Aziz Road',
      city: 'Jeddah',
      district: 'Al-Balad',
      zipCode: '21411',
      country: 'Saudi Arabia',
      coordinates: { lat: 21.5289, lng: 39.1579 }
    },
    craftsman: {
      profession: 'Licensed Electrician',
      experience: 12,
      description: 'Certified electrician with expertise in residential and commercial electrical systems.',
      skills: ['Wiring Installation', 'Circuit Repair', 'Lighting Installation', 'Electrical Maintenance'],
      priceRange: { min: 150, max: 800 },
      availability: {
        sunday: { available: true, hours: '07:00-19:00' },
        monday: { available: true, hours: '07:00-19:00' },
        tuesday: { available: true, hours: '07:00-19:00' },
        wednesday: { available: true, hours: '07:00-19:00' },
        thursday: { available: true, hours: '07:00-19:00' },
        friday: { available: false, hours: null },
        saturday: { available: true, hours: '08:00-16:00' }
      },
      portfolio: [
        'https://example.com/portfolio/electrician1.jpg',
        'https://example.com/portfolio/electrician2.jpg'
      ],
      rating: 4.9,
      reviewsCount: 203,
      isApproved: true
    }
  },
  {
    email: 'nadia.cleaner@gmail.com',
    name: 'Nadia Al-Mansouri',
    role: UserRole.CRAFTSMAN,
    phone: '+966505555555',
    isVerified: true,
    isBlocked: false,
    password: 'craftsman123',
    address: {
      street: 'Prince Sultan Street',
      city: 'Dammam',
      district: 'Al-Ferdaws',
      zipCode: '31441',
      country: 'Saudi Arabia',
      coordinates: { lat: 26.4207, lng: 50.0888 }
    },
    craftsman: {
      profession: 'Professional Cleaner',
      experience: 5,
      description: 'Detailed-oriented cleaner specializing in residential deep cleaning and organization.',
      skills: ['Deep Cleaning', 'Organization', 'Eco-friendly Products', 'Post-construction Cleanup'],
      priceRange: { min: 80, max: 300 },
      availability: {
        sunday: { available: true, hours: '09:00-17:00' },
        monday: { available: true, hours: '09:00-17:00' },
        tuesday: { available: true, hours: '09:00-17:00' },
        wednesday: { available: true, hours: '09:00-17:00' },
        thursday: { available: true, hours: '09:00-17:00' },
        friday: { available: false, hours: null },
        saturday: { available: true, hours: '10:00-15:00' }
      },
      portfolio: [
        'https://example.com/portfolio/cleaner1.jpg',
        'https://example.com/portfolio/cleaner2.jpg'
      ],
      rating: 4.7,
      reviewsCount: 89,
      isApproved: true
    }
  }
]

export async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...')

    // Clear existing data in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Cleaning existing data...')

      await prisma.notification.deleteMany()
      await prisma.review.deleteMany()
      await prisma.payment.deleteMany()
      await prisma.booking.deleteMany()
      await prisma.service.deleteMany()
      await prisma.craftsman.deleteMany()
      await prisma.customer.deleteMany()
      await prisma.user.deleteMany()
      await prisma.serviceCategory.deleteMany()

      console.log('✅ Existing data cleaned')
    }

    // Create service categories
    console.log('📂 Creating service categories...')
    const createdCategories = []
    for (const category of serviceCategories) {
      const createdCategory = await prisma.serviceCategory.create({
        data: category
      })
      createdCategories.push(createdCategory)
      console.log(`  ✓ Created category: ${category.name}`)
    }

    // Create users and related data
    console.log('👥 Creating users...')
    const createdUsers = []

    for (const userData of sampleUsers) {
      const { password, craftsman, ...userDataWithoutPassword } = userData

      // Hash password
      const hashedPassword = await bcryptjs.hash(password, 10)

      // Create user
      const user = await prisma.user.create({
        data: {
          ...userDataWithoutPassword,
          password: hashedPassword,
          profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`
        }
      })

      createdUsers.push(user)
      console.log(`  ✓ Created user: ${user.name} (${user.role})`)

      // Create customer or craftsman profile
      if (user.role === UserRole.CUSTOMER) {
        await prisma.customer.create({
          data: {
            userId: user.id
          }
        })
        console.log(`    ✓ Created customer profile`)
      } else if (user.role === UserRole.CRAFTSMAN && craftsman) {
        const createdCraftsman = await prisma.craftsman.create({
          data: {
            userId: user.id,
            ...craftsman
          }
        })
        console.log(`    ✓ Created craftsman profile`)

        // Create services for craftsman
        const relevantCategories = createdCategories.filter(cat => {
          if (craftsman.profession.toLowerCase().includes('plumber')) {
            return cat.name === 'Plumbing'
          } else if (craftsman.profession.toLowerCase().includes('electrician')) {
            return cat.name === 'Electrical'
          } else if (craftsman.profession.toLowerCase().includes('cleaner')) {
            return cat.name === 'Home Cleaning'
          }
          return false
        })

        for (const category of relevantCategories) {
          const service = await prisma.service.create({
            data: {
              name: `${craftsman.profession} Service`,
              description: craftsman.description || 'Professional service',
              basePrice: craftsman.priceRange.min,
              craftsmanId: createdCraftsman.id,
              categoryId: category.id
            }
          })
          console.log(`      ✓ Created service: ${service.name}`)
        }
      }
    }

    // Create sample bookings
    console.log('📋 Creating sample bookings...')
    const customers = createdUsers.filter(u => u.role === UserRole.CUSTOMER)
    const craftsmen = createdUsers.filter(u => u.role === UserRole.CRAFTSMAN)

    if (customers.length > 0 && craftsmen.length > 0) {
      const sampleBookings = [
        {
          customerId: customers[0].id,
          craftsmanId: craftsmen[0].id,
          serviceType: 'Plumbing Repair',
          description: 'Kitchen sink leak repair needed urgently',
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          status: BookingStatus.PENDING,
          price: 200,
          location: {
            address: 'King Fahd Road, Al-Malaz, Riyadh',
            coordinates: { lat: 24.7136, lng: 46.6753 }
          }
        },
        {
          customerId: customers[0].id,
          craftsmanId: craftsmen[1].id,
          serviceType: 'Electrical Installation',
          description: 'Install new light fixtures in living room',
          scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          status: BookingStatus.CONFIRMED,
          price: 350,
          location: {
            address: 'Prince Mohammed Bin Abdulaziz Street, Al-Hamra, Jeddah',
            coordinates: { lat: 21.5289, lng: 39.1579 }
          }
        }
      ]

      for (const bookingData of sampleBookings) {
        const booking = await prisma.booking.create({
          data: bookingData
        })
        console.log(`  ✓ Created booking: ${booking.serviceType}`)

        // Create notifications for the booking
        await prisma.notification.create({
          data: {
            userId: booking.customerId,
            title: 'Booking Created',
            message: `Your booking for ${booking.serviceType} has been created successfully.`,
            type: NotificationType.BOOKING_REQUEST,
            isRead: false
          }
        })

        await prisma.notification.create({
          data: {
            userId: booking.craftsmanId,
            title: 'New Booking Request',
            message: `You have a new booking request for ${booking.serviceType}.`,
            type: NotificationType.BOOKING_REQUEST,
            isRead: false
          }
        })
      }
    }

    // Create sample reviews
    console.log('⭐ Creating sample reviews...')
    const completedBookings = await prisma.booking.findMany({
      where: { status: BookingStatus.CONFIRMED }
    })

    if (completedBookings.length > 0) {
      const review = await prisma.review.create({
        data: {
          bookingId: completedBookings[0].id,
          customerId: completedBookings[0].customerId,
          craftsmanId: completedBookings[0].craftsmanId,
          rating: 5,
          comment: 'Excellent work! Very professional and punctual. Highly recommended!'
        }
      })
      console.log(`  ✓ Created review with rating: ${review.rating}`)
    }

    console.log('✅ Database initialization completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`  - Service Categories: ${serviceCategories.length}`)
    console.log(`  - Users: ${createdUsers.length}`)
    console.log(`  - Customers: ${createdUsers.filter(u => u.role === UserRole.CUSTOMER).length}`)
    console.log(`  - Craftsmen: ${createdUsers.filter(u => u.role === UserRole.CRAFTSMAN).length}`)
    console.log(`  - Admin: ${createdUsers.filter(u => u.role === UserRole.ADMIN).length}`)

    console.log('\n🔐 Default Admin Credentials:')
    console.log('  Email: admin@handydz.com')
    console.log('  Password: admin123456')

  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...')

    await prisma.notification.deleteMany()
    await prisma.review.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.booking.deleteMany()
    await prisma.service.deleteMany()
    await prisma.craftsman.deleteMany()
    await prisma.customer.deleteMany()
    await prisma.user.deleteMany()
    await prisma.serviceCategory.deleteMany()

    console.log('✅ Database reset completed!')

  } catch (error) {
    console.error('❌ Database reset failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection is healthy')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Utility function to get database statistics
export async function getDatabaseStats() {
  try {
    const [
      usersCount,
      customersCount,
      craftsmenCount,
      bookingsCount,
      reviewsCount,
      categoriesCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.customer.count(),
      prisma.craftsman.count(),
      prisma.booking.count(),
      prisma.review.count(),
      prisma.serviceCategory.count()
    ])

    return {
      users: usersCount,
      customers: customersCount,
      craftsmen: craftsmenCount,
      bookings: bookingsCount,
      reviews: reviewsCount,
      categories: categoriesCount
    }
  } catch (error) {
    console.error('❌ Failed to get database stats:', error)
    throw error
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Database initialization script completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Initialization script failed:', error)
      process.exit(1)
    })
}

export default {
  initializeDatabase,
  resetDatabase,
  checkDatabaseHealth,
  getDatabaseStats
}
