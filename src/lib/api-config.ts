import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { NextRequest, NextResponse } from 'next/server'

// API Configuration Constants
export const API_CONFIG = {
  BASE_URL: process.env.APP_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  RATE_LIMIT: {
    MAX_REQUESTS: parseInt(process.env.API_RATE_LIMIT || '1000'),
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'), // 1 hour
  }
}

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    VERIFY_EMAIL: '/api/auth/verify-email',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },

  // Users
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    UPLOAD_AVATAR: '/api/users/avatar',
    DELETE_ACCOUNT: '/api/users/delete',
  },

  // Craftsmen
  CRAFTSMEN: {
    LIST: '/api/craftsmen',
    DETAIL: (id: string) => `/api/craftsmen/${id}`,
    APPLY: '/api/craftsmen/apply',
    UPDATE_PROFILE: '/api/craftsmen/profile',
    SERVICES: (id: string) => `/api/craftsmen/${id}/services`,
    REVIEWS: (id: string) => `/api/craftsmen/${id}/reviews`,
    AVAILABILITY: (id: string) => `/api/craftsmen/${id}/availability`,
  },

  // Bookings
  BOOKINGS: {
    CREATE: '/api/bookings',
    LIST: '/api/bookings',
    DETAIL: (id: string) => `/api/bookings/${id}`,
    UPDATE_STATUS: (id: string) => `/api/bookings/${id}/status`,
    CANCEL: (id: string) => `/api/bookings/${id}/cancel`,
    CUSTOMER_BOOKINGS: '/api/bookings/customer',
    CRAFTSMAN_BOOKINGS: '/api/bookings/craftsman',
  },

  // Reviews
  REVIEWS: {
    CREATE: '/api/reviews',
    LIST: '/api/reviews',
    DETAIL: (id: string) => `/api/reviews/${id}`,
    UPDATE: (id: string) => `/api/reviews/${id}`,
    DELETE: (id: string) => `/api/reviews/${id}`,
  },

  // Payments
  PAYMENTS: {
    PROCESS: '/api/payments/process',
    WEBHOOK: '/api/payments/webhook',
    REFUND: (id: string) => `/api/payments/${id}/refund`,
    HISTORY: '/api/payments/history',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    MARK_READ: (id: string) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: '/api/notifications/read-all',
    DELETE: (id: string) => `/api/notifications/${id}`,
  },

  // Search & Filters
  SEARCH: {
    CRAFTSMEN: '/api/search/craftsmen',
    SERVICES: '/api/search/services',
    SUGGESTIONS: '/api/search/suggestions',
  },

  // Categories
  CATEGORIES: {
    LIST: '/api/categories',
    DETAIL: (id: string) => `/api/categories/${id}`,
  },

  // File Upload
  UPLOAD: {
    IMAGE: '/api/upload/image',
    DOCUMENT: '/api/upload/document',
    PORTFOLIO: '/api/upload/portfolio',
  }
}

// Error Types
export interface APIError {
  code: string
  message: string
  details?: any
  statusCode: number
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: APIError
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Custom Error Classes
export class APIClientError extends Error {
  statusCode: number
  code: string
  details?: any

  constructor(message: string, statusCode: number = 400, code: string = 'CLIENT_ERROR', details?: any) {
    super(message)
    this.name = 'APIClientError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

export class APIServerError extends Error {
  statusCode: number
  code: string

  constructor(message: string, statusCode: number = 500, code: string = 'SERVER_ERROR') {
    super(message)
    this.name = 'APIServerError'
    this.statusCode = statusCode
    this.code = code
  }
}

// Response Formatting Utilities
export const formatSuccessResponse = <T>(
  data: T,
  message?: string,
  pagination?: APIResponse['pagination']
): APIResponse<T> => ({
  success: true,
  data,
  message,
  pagination,
})

export const formatErrorResponse = (
  error: APIError | Error | string,
  statusCode: number = 500
): APIResponse => {
  if (typeof error === 'string') {
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error,
        statusCode,
      },
    }
  }

  if (error instanceof APIClientError || error instanceof APIServerError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: 'details' in error ? error.details : undefined,
      },
    }
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
        statusCode,
      },
    }
  }

  return {
    success: false,
    error: error as APIError,
  }
}

// Request Validation Utilities
export const validateRequiredFields = (data: Record<string, any>, fields: string[]): void => {
  const missingFields = fields.filter(field => !data[field])
  if (missingFields.length > 0) {
    throw new APIClientError(
      `Missing required fields: ${missingFields.join(', ')}`,
      400,
      'VALIDATION_ERROR',
      { missingFields }
    )
  }
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+966|966|0)?[0-9]{9}$/
  return phoneRegex.test(phone.replace(/\s+/g, ''))
}

// Pagination Utilities
export const parsePaginationParams = (request: NextRequest) => {
  const url = new URL(request.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10')))
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

export const createPaginationResponse = (
  total: number,
  page: number,
  limit: number
) => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
})

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

// Request/Response Interceptors Setup
export const createAPIClient = (baseURL?: string): AxiosInstance => {
  const client = axios.create({
    baseURL: baseURL || API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request Interceptor
  client.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      // Add auth token if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }
      }

      // Add request timestamp
      config.metadata = { startTime: Date.now() }

      return config
    },
    (error: AxiosError) => Promise.reject(error)
  )

  // Response Interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response time in development
      if (process.env.NODE_ENV === 'development') {
        const endTime = Date.now()
        const startTime = response.config.metadata?.startTime || endTime
        console.log(`API Call: ${response.config.method?.toUpperCase()} ${response.config.url} - ${endTime - startTime}ms`)
      }

      return response
    },
    async (error: AxiosError) => {
      const { response } = error

      // Handle token expiration
      if (response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/auth/login'
        }
      }

      // Handle rate limiting
      if (response?.status === 429) {
        const retryAfter = response.headers['retry-after']
        console.warn(`Rate limited. Retry after: ${retryAfter} seconds`)
      }

      return Promise.reject(error)
    }
  )

  return client
}

// Rate Limiting Utilities
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export const checkRateLimit = (identifier: string): { allowed: boolean; remaining: number; resetTime: number } => {
  const now = Date.now()
  const windowStart = now - API_CONFIG.RATE_LIMIT.WINDOW_MS

  const current = requestCounts.get(identifier)

  if (!current || current.resetTime < now) {
    const resetTime = now + API_CONFIG.RATE_LIMIT.WINDOW_MS
    requestCounts.set(identifier, { count: 1, resetTime })
    return {
      allowed: true,
      remaining: API_CONFIG.RATE_LIMIT.MAX_REQUESTS - 1,
      resetTime,
    }
  }

  if (current.count >= API_CONFIG.RATE_LIMIT.MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    }
  }

  current.count++
  requestCounts.set(identifier, current)

  return {
    allowed: true,
    remaining: API_CONFIG.RATE_LIMIT.MAX_REQUESTS - current.count,
    resetTime: current.resetTime,
  }
}

// Authentication Helpers
export const extractAuthToken = (request: NextRequest): string | null => {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export const createAuthHeaders = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
})

// File Upload Helpers
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif']

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds limit of ${Math.round(maxSize / 1024 / 1024)}MB`,
    }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    }
  }

  return { valid: true }
}

// Default API Client Instance
export const apiClient = createAPIClient()

// Export commonly used utilities
export {
  HTTP_STATUS as StatusCodes,
  API_CONFIG as Config,
  API_ENDPOINTS as Endpoints,
}
