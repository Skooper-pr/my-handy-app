# 🚀 HandyDZ - Craftsmen Services Platform

<div align="center">

![HandyDZ Logo](public/logo.png)

**A comprehensive platform connecting customers with verified craftsmen and service providers in Saudi Arabia**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-indigo.svg)](https://www.prisma.io/)

[🌐 Live Demo](https://handydz.com) • [📚 Documentation](https://docs.handydz.com) • [🐛 Report Bug](https://github.com/handydz/platform/issues) • [✨ Request Feature](https://github.com/handydz/platform/issues)

</div>

---

## 🎯 About HandyDZ

HandyDZ is a modern, full-stack platform that revolutionizes how customers connect with skilled craftsmen and service providers. Built specifically for the Saudi Arabian market, it offers a seamless experience for booking home services, from plumbing and electrical work to cleaning and carpentry.

### ✨ Key Features

- 🔍 **Smart Service Discovery** - Advanced search and filtering system
- 👨‍🔧 **Verified Craftsmen** - Rigorous vetting process for service providers
- 📅 **Real-time Booking** - Instant booking with live availability
- ⭐ **Review System** - Transparent rating and review mechanism
- 💳 **Secure Payments** - Multiple payment methods with escrow protection
- 📱 **Mobile Responsive** - Optimized for all device types
- 🌐 **Multi-language** - Arabic and English support
- 🔔 **Real-time Notifications** - Live updates and messaging
- 📊 **Analytics Dashboard** - Comprehensive insights for all users
- 🔒 **Enterprise Security** - Bank-grade security measures

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: TanStack Query + Axios
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: Prisma 6
- **Authentication**: JWT + NextAuth.js
- **Real-time**: Socket.IO
- **File Upload**: Cloudinary / AWS S3

### DevOps & Tools
- **Containerization**: Docker + Docker Compose
- **Process Manager**: PM2
- **Testing**: Jest + Playwright
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry + Analytics

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js** 18.0+ ([Download](https://nodejs.org/))
- **npm** 8.0+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/handydz/platform.git
   cd handydz-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize the database**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Admin Credentials

After seeding the database, you can log in with:
- **Email**: `admin@handydz.com`
- **Password**: `admin123456`

---

## 📖 Usage Guide

### For Customers

1. **Browse Services** - Explore available craftsmen and services
2. **Filter & Search** - Use advanced filters to find the perfect match
3. **View Profiles** - Check ratings, reviews, and portfolios
4. **Book Service** - Schedule appointments with preferred dates
5. **Track Progress** - Monitor booking status in real-time
6. **Pay Securely** - Complete payment through secure gateway
7. **Rate & Review** - Share your experience to help others

### For Craftsmen

1. **Create Profile** - Build a comprehensive professional profile
2. **Verify Account** - Complete the verification process
3. **Set Availability** - Manage your schedule and availability
4. **Receive Bookings** - Get notified of new booking requests
5. **Communicate** - Chat with customers through the platform
6. **Complete Jobs** - Mark services as completed
7. **Get Paid** - Receive payments directly to your account

### For Administrators

1. **User Management** - Manage customers and craftsmen accounts
2. **Verification** - Approve or reject craftsmen applications
3. **Analytics** - View platform statistics and insights
4. **Content Management** - Manage categories and services
5. **Dispute Resolution** - Handle customer-craftsman disputes

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run test:coverage # Generate test coverage

# Code Quality
npm run lint         # Check code style
npm run lint:fix     # Fix lint issues
npm run type-check   # Check TypeScript types
npm run format       # Format code with Prettier

# Deployment
npm run deploy       # Deploy application
npm run health:check # Check application health
```

### Project Structure

```
handydz/
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── scripts/                # Deployment and utility scripts
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # Dashboard pages
│   │   └── ...           # Other pages
│   ├── components/        # Reusable React components
│   │   ├── ui/           # shadcn/ui components
│   │   └── layout/       # Layout components
│   ├── contexts/          # React contexts
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utility functions and configurations
├── .env.example           # Environment variables template
├── .env.local             # Local environment variables
├── ecosystem.config.js    # PM2 configuration
├── docker-compose.yml     # Docker composition
├── Dockerfile             # Docker image configuration
└── README.md             # This file
```

---

## 🌐 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh` | Refresh JWT token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update user profile |
| POST | `/api/users/avatar` | Upload user avatar |
| DELETE | `/api/users/delete` | Delete user account |

### Craftsmen

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/craftsmen` | List all craftsmen |
| GET | `/api/craftsmen/:id` | Get craftsman details |
| POST | `/api/craftsmen/apply` | Apply as craftsman |
| PUT | `/api/craftsmen/profile` | Update craftsman profile |
| GET | `/api/craftsmen/:id/reviews` | Get craftsman reviews |
| PUT | `/api/craftsmen/:id/availability` | Update availability |

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create new booking |
| GET | `/api/bookings` | List user bookings |
| GET | `/api/bookings/:id` | Get booking details |
| PUT | `/api/bookings/:id/status` | Update booking status |
| DELETE | `/api/bookings/:id/cancel` | Cancel booking |

### Example API Usage

```javascript
// Create a new booking
const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    craftsmanId: 'craftsman-id',
    serviceType: 'Plumbing',
    description: 'Fix kitchen sink leak',
    scheduledDate: '2024-01-20T10:00:00Z',
    location: {
      address: 'King Fahd Road, Riyadh',
      coordinates: { lat: 24.7136, lng: 46.6753 }
    }
  })
});

const booking = await response.json();
```

---

## 🗄️ Database Schema

### Core Models

- **User** - Base user model for all user types
- **Customer** - Customer-specific data
- **Craftsman** - Craftsman profiles and credentials
- **Service** - Individual services offered
- **ServiceCategory** - Service categorization
- **Booking** - Service bookings and appointments
- **Review** - Customer reviews and ratings
- **Payment** - Payment transactions
- **Notification** - User notifications

### Key Relationships

```mermaid
erDiagram
    User ||--|| Customer : has
    User ||--|| Craftsman : has
    Craftsman ||--o{ Service : offers
    Service }o--|| ServiceCategory : belongs_to
    Customer ||--o{ Booking : creates
    Craftsman ||--o{ Booking : receives
    Booking ||--o| Review : has
    Booking ||--o{ Payment : involves
    User ||--o{ Notification : receives
```

---

## 🚀 Deployment

### Production Deployment

1. **Prepare environment**
   ```bash
   cp .env.example .env.production
   # Configure production variables
   ```

2. **Deploy using script**
   ```bash
   npm run deploy:production
   ```

3. **Manual deployment**
   ```bash
   npm ci
   npm run build
   npm run db:migrate:deploy
   npm run start
   ```

### Docker Deployment

1. **Build and run with Docker**
   ```bash
   docker-compose up -d
   ```

2. **Scale services**
   ```bash
   docker-compose up -d --scale app=3
   ```

### Environment Variables

Key production variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/handydz"

# Security
JWT_SECRET="your-production-jwt-secret"
NEXTAUTH_SECRET="your-production-nextauth-secret"

# External Services
STRIPE_SECRET_KEY="sk_live_..."
GOOGLE_MAPS_API_KEY="your-maps-key"
CLOUDINARY_URL="cloudinary://..."

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

---

## 🧪 Testing

### Unit Tests
```bash
npm run test                 # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Generate coverage report
```

### End-to-End Tests
```bash
npm run test:e2e            # Run E2E tests
npm run test:e2e:headed     # Run with browser UI
```

### Test Coverage

We maintain high test coverage across:
- ✅ API endpoints (>90%)
- ✅ Core business logic (>95%)
- ✅ UI components (>85%)
- ✅ Integration flows (>80%)

---

## 🔒 Security

### Security Measures

- 🔐 **JWT Authentication** with secure token rotation
- 🛡️ **CSRF Protection** on all state-changing operations
- 🔒 **Data Encryption** for sensitive information
- 🚫 **Rate Limiting** to prevent abuse
- 👥 **Role-based Access Control** (RBAC)
- 🔍 **Input Validation** and sanitization
- 📝 **Audit Logging** for critical actions

### Security Headers

```javascript
// Automatically added by middleware
{
  "Strict-Transport-Security": "max-age=63072000",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
}
```

---

## 🌍 Internationalization

HandyDZ supports multiple languages:

- 🇸🇦 **Arabic** (Primary)
- 🇺🇸 **English** (Secondary)

### Adding New Languages

1. Add locale to `src/i18n/locales/`
2. Update `next.config.js`
3. Add translations to components

---

## 📊 Performance

### Optimization Features

- ⚡ **Server-Side Rendering** (SSR)
- 🎯 **Static Site Generation** (SSG) for public pages
- 🖼️ **Image Optimization** with Next.js Image component
- 📦 **Bundle Splitting** and lazy loading
- 🗄️ **Database Query Optimization**
- 🚀 **CDN Integration** for static assets
- 💾 **Caching Strategies** at multiple levels

### Performance Metrics

- **Lighthouse Score**: 95+ (Performance)
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Cumulative Layout Shift**: <0.1

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Contribution Guidelines

- ✅ Follow TypeScript best practices
- ✅ Write comprehensive tests
- ✅ Update documentation
- ✅ Follow commit convention
- ✅ Ensure all checks pass

### Code Style

We use ESLint and Prettier for consistent code style:

```bash
npm run lint:fix      # Fix linting issues
npm run format        # Format code
```

---

## 📋 Roadmap

### Version 1.1 (Q2 2024)
- [ ] Video calling for consultations
- [ ] Advanced AI-powered matching
- [ ] Mobile app (React Native)
- [ ] Multi-city expansion

### Version 1.2 (Q3 2024)
- [ ] Subscription plans for craftsmen
- [ ] Advanced analytics dashboard
- [ ] White-label solution
- [ ] API marketplace

### Version 2.0 (Q4 2024)
- [ ] Blockchain-based reviews
- [ ] IoT device integration
- [ ] AR/VR service previews
- [ ] International expansion

---

## 🆘 Support

### Getting Help

- 📚 [Documentation](https://docs.handydz.com)
- 💬 [Discord Community](https://discord.gg/handydz)
- 🐛 [Issue Tracker](https://github.com/handydz/platform/issues)
- 📧 [Email Support](mailto:support@handydz.com)

### FAQ

**Q: How do I become a verified craftsman?**
A: Register as a craftsman, complete your profile, upload required documents, and wait for admin approval.

**Q: What payment methods are supported?**
A: We support major credit cards, bank transfers, and digital wallets.

**Q: Is there a mobile app?**
A: Currently, we offer a mobile-optimized web app. Native apps are coming in Q2 2024.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 HandyDZ Platform

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Prisma](https://prisma.io/) - Next-generation ORM for Node.js
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Framer Motion](https://www.framer.com/motion/) - Production-ready motion library
- All the amazing [contributors](https://github.com/handydz/platform/contributors)

---

## 📞 Contact

- **Website**: [https://handydz.com](https://handydz.com)
- **Email**: info@handydz.com
- **Support**: support@handydz.com
- **Business**: business@handydz.com

---

<div align="center">

**Built with ❤️ in Saudi Arabia**

[🌟 Star us on GitHub](https://github.com/handydz/platform) • [🐦 Follow on Twitter](https://twitter.com/handydz) • [💼 LinkedIn](https://linkedin.com/company/handydz)

</div>