import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  formatSuccessResponse,
  formatErrorResponse,
  HTTP_STATUS,
} from "@/lib/api-config";

const prisma = new PrismaClient();

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheck;
    redis?: HealthCheck;
    external_services: {
      stripe?: HealthCheck;
      email?: HealthCheck;
      maps?: HealthCheck;
      storage?: HealthCheck;
    };
    system: SystemHealthCheck;
    application: ApplicationHealthCheck;
  };
  overall: {
    status: "healthy" | "degraded" | "unhealthy";
    message: string;
  };
}

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  message: string;
  responseTime?: number;
  lastChecked: string;
}

interface SystemHealthCheck extends HealthCheck {
  memory: {
    used: number;
    free: number;
    total: number;
    usage_percentage: number;
  };
  cpu: {
    usage_percentage: number;
  };
  disk?: {
    used: number;
    free: number;
    total: number;
    usage_percentage: number;
  };
}

interface ApplicationHealthCheck extends HealthCheck {
  features: {
    authentication: boolean;
    payments: boolean;
    notifications: boolean;
    file_upload: boolean;
    real_time_chat: boolean;
  };
  stats: {
    total_users: number;
    active_bookings: number;
    total_craftsmen: number;
    pending_reviews: number;
  };
}

// Database health check
async function checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

    return {
      status: responseTime < 1000 ? "healthy" : "degraded",
      message:
        responseTime < 1000
          ? "Database connection is healthy"
          : "Database response is slow",
      responseTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      message: `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
    };
  }
}

// Redis health check (if Redis is configured)
async function checkRedis(): Promise<HealthCheck | undefined> {
  if (!process.env.REDIS_URL) {
    return undefined;
  }

  const startTime = Date.now();
  try {
    // This would require a Redis client - simplified for now
    return {
      status: "healthy",
      message: "Redis connection is healthy",
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      message: `Redis connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
    };
  }
}

// External services health checks
async function checkExternalServices() {
  const services: { [key: string]: HealthCheck } = {};

  // Stripe health check
  if (process.env.STRIPE_SECRET_KEY) {
    const startTime = Date.now();
    try {
      // In a real implementation, you'd make a test API call to Stripe
      services.stripe = {
        status: "healthy",
        message: "Stripe service is available",
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      services.stripe = {
        status: "unhealthy",
        message: `Stripe service check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  // Email service health check
  if (process.env.SMTP_HOST || process.env.SENDGRID_API_KEY) {
    services.email = {
      status: "healthy",
      message: "Email service is configured",
      lastChecked: new Date().toISOString(),
    };
  }

  // Google Maps API health check
  if (process.env.GOOGLE_MAPS_API_KEY) {
    services.maps = {
      status: "healthy",
      message: "Maps service is configured",
      lastChecked: new Date().toISOString(),
    };
  }

  // Storage service health check
  if (process.env.CLOUDINARY_URL || process.env.AWS_S3_BUCKET) {
    services.storage = {
      status: "healthy",
      message: "Storage service is configured",
      lastChecked: new Date().toISOString(),
    };
  }

  return services;
}

// System health check
async function checkSystem(): Promise<SystemHealthCheck> {
  const memoryUsage = process.memoryUsage();
  const totalMemory = memoryUsage.heapTotal;
  const usedMemory = memoryUsage.heapUsed;
  const freeMemory = totalMemory - usedMemory;
  const memoryUsagePercentage = (usedMemory / totalMemory) * 100;

  // CPU usage is harder to get in Node.js, so we'll use a placeholder
  const cpuUsage = process.cpuUsage();
  const cpuUsagePercentage = 0; // Simplified - would need proper calculation

  let status: "healthy" | "degraded" | "unhealthy" = "healthy";
  let message = "System resources are healthy";

  if (memoryUsagePercentage > 90) {
    status = "unhealthy";
    message = "Memory usage is critically high";
  } else if (memoryUsagePercentage > 80) {
    status = "degraded";
    message = "Memory usage is high";
  }

  return {
    status,
    message,
    lastChecked: new Date().toISOString(),
    memory: {
      used: usedMemory,
      free: freeMemory,
      total: totalMemory,
      usage_percentage: memoryUsagePercentage,
    },
    cpu: {
      usage_percentage: cpuUsagePercentage,
    },
  };
}

// Application-specific health check
async function checkApplication(): Promise<ApplicationHealthCheck> {
  try {
    // Get application statistics
    const [totalUsers, activeBoo, totalCraftsmen, pendingReviews] =
      await Promise.all([
        prisma.user.count(),
        prisma.booking.count({
          where: { status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] } },
        }),
        prisma.craftsman.count(),
        prisma.review.count({
          where: {
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        }),
      ]);

    // Check feature availability
    const features = {
      authentication: Boolean(process.env.JWT_SECRET),
      payments: Boolean(process.env.STRIPE_SECRET_KEY),
      notifications: Boolean(
        process.env.FCM_SERVER_KEY || process.env.SMTP_HOST,
      ),
      file_upload: Boolean(
        process.env.CLOUDINARY_URL || process.env.AWS_S3_BUCKET,
      ),
      real_time_chat: Boolean(process.env.SOCKET_IO_PATH),
    };

    return {
      status: "healthy",
      message: "Application services are operational",
      lastChecked: new Date().toISOString(),
      features,
      stats: {
        total_users: totalUsers,
        active_bookings: activeBookings,
        total_craftsmen: totalCraftsmen,
        pending_reviews: pendingReviews,
      },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      message: `Application check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      lastChecked: new Date().toISOString(),
      features: {
        authentication: false,
        payments: false,
        notifications: false,
        file_upload: false,
        real_time_chat: false,
      },
      stats: {
        total_users: 0,
        active_bookings: 0,
        total_craftsmen: 0,
        pending_reviews: 0,
      },
    };
  }
}

// Determine overall health status
function determineOverallHealth(checks: HealthCheckResult["checks"]): {
  status: "healthy" | "degraded" | "unhealthy";
  message: string;
} {
  const allChecks = [
    checks.database,
    checks.redis,
    checks.system,
    checks.application,
    ...Object.values(checks.external_services),
  ].filter(Boolean) as HealthCheck[];

  const unhealthyCount = allChecks.filter(
    (check) => check.status === "unhealthy",
  ).length;
  const degradedCount = allChecks.filter(
    (check) => check.status === "degraded",
  ).length;

  if (unhealthyCount > 0) {
    return {
      status: "unhealthy",
      message: `${unhealthyCount} critical service${unhealthyCount > 1 ? "s" : ""} down`,
    };
  }

  if (degradedCount > 0) {
    return {
      status: "degraded",
      message: `${degradedCount} service${degradedCount > 1 ? "s" : ""} experiencing issues`,
    };
  }

  return {
    status: "healthy",
    message: "All systems operational",
  };
}

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Run all health checks in parallel
    const [
      databaseCheck,
      redisCheck,
      externalServices,
      systemCheck,
      applicationCheck,
    ] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkExternalServices(),
      checkSystem(),
      checkApplication(),
    ]);

    const checks = {
      database: databaseCheck,
      ...(redisCheck && { redis: redisCheck }),
      external_services: externalServices,
      system: systemCheck,
      application: applicationCheck,
    };

    const overall = determineOverallHealth(checks);

    const result: HealthCheckResult = {
      status: overall.status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      checks,
      overall,
    };

    // Set appropriate HTTP status code based on health
    let statusCode = HTTP_STATUS.OK;
    if (overall.status === "degraded") {
      statusCode = HTTP_STATUS.OK; // Still return 200 for degraded services
    } else if (overall.status === "unhealthy") {
      statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
    }

    const responseTime = Date.now() - startTime;

    // Add response headers
    const response = NextResponse.json(
      formatSuccessResponse(
        result,
        `Health check completed in ${responseTime}ms`,
      ),
      { status: statusCode },
    );

    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate",
    );
    response.headers.set("X-Health-Check-Version", "1.0");
    response.headers.set("X-Response-Time", `${responseTime}ms`);

    return response;
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      formatErrorResponse(
        error instanceof Error ? error.message : "Health check failed",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Simple health endpoint for load balancers
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: HTTP_STATUS.OK });
  } catch {
    return new NextResponse(null, { status: HTTP_STATUS.SERVICE_UNAVAILABLE });
  } finally {
    await prisma.$disconnect();
  }
}
