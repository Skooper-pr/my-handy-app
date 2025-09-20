import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function middleware(request: NextRequest) {
  // Security headers
  const response = NextResponse.next();

  // Add security headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  // Add performance headers
  const requestStart = request.headers.get("x-request-start");
  const responseTime = requestStart
    ? `${Date.now() - parseInt(requestStart)}ms`
    : "0ms";
  response.headers.set("X-Response-Time", responseTime);

  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
  }

  // Get token from Authorization header
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1]; // Bearer token

  // Protected routes that require authentication
  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/bookings",
    "/api/bookings",
    "/api/reviews",
    "/api/notifications",
  ];

  // Check if current path is protected
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  // If path is protected and no token, redirect to login
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // If token exists, verify it
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };

      // Add user info to request headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("userId", decoded.userId);
      requestHeaders.set("userRole", decoded.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Token is invalid, redirect to login
      if (isProtectedPath) {
        return NextResponse.redirect(new URL("/auth", request.url));
      }
    }
  }

  // Rate limiting simulation (basic)
  const clientIP =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Add client info to headers for monitoring
  response.headers.set("X-Client-IP", clientIP);
  response.headers.set("X-User-Agent", userAgent.substring(0, 100));

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
