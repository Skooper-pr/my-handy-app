# HandyDZ Platform - Production Dockerfile
# Multi-stage build for optimal production deployment

# ===================================
# Stage 1: Base Node.js Image
# ===================================
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies required for native modules
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    ca-certificates \
    && update-ca-certificates

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# ===================================
# Stage 2: Dependencies Installation
# ===================================
FROM base AS deps

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with exact versions for reproducibility
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Install dev dependencies in separate layer for builder
FROM base AS deps-dev
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts && \
    npm cache clean --force

# ===================================
# Stage 3: Application Builder
# ===================================
FROM base AS builder

# Copy dev dependencies
COPY --from=deps-dev /app/node_modules ./node_modules

# Copy source code
COPY . .

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Build the application
# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build the Next.js application
RUN npm run build

# ===================================
# Stage 4: Production Image
# ===================================
FROM base AS production

# Set production environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Create necessary directories
RUN mkdir -p /app/.next
RUN mkdir -p /app/public
RUN mkdir -p /app/logs
RUN mkdir -p /app/uploads

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma files and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy additional necessary files
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/middleware.ts ./middleware.ts
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/package.json ./package.json

# Install tsx for running TypeScript server
RUN npm install --production tsx

# Set proper permissions
RUN chown -R nextjs:nodejs /app
RUN chmod -R 755 /app
RUN chmod -R 777 /app/logs
RUN chmod -R 777 /app/uploads

# Create health check script
RUN echo '#!/bin/sh\n\
curl -f http://localhost:3000/api/health || exit 1' > /app/healthcheck.sh && \
    chmod +x /app/healthcheck.sh

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /app/healthcheck.sh

# Define volumes for persistent data
VOLUME ["/app/logs", "/app/uploads"]

# Start the application
CMD ["npx", "tsx", "server.ts"]

# ===================================
# Development Stage (Optional)
# ===================================
FROM base AS development

# Install all dependencies (including dev)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create development user
USER nextjs

# Expose port
EXPOSE 3000

# Start in development mode
CMD ["npm", "run", "dev"]

# ===================================
# Build Arguments and Labels
# ===================================
ARG BUILD_DATE
ARG VERSION
ARG VCS_REF

LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.name="HandyDZ Platform" \
      org.label-schema.description="A comprehensive platform connecting customers with verified craftsmen" \
      org.label-schema.url="https://handydz.com" \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.vcs-url="https://github.com/handydz/platform" \
      org.label-schema.vendor="HandyDZ Team" \
      org.label-schema.version=$VERSION \
      org.label-schema.schema-version="1.0" \
      maintainer="HandyDZ Team <info@handydz.com>"

# ===================================
# Build Commands Reference
# ===================================
# Production build:
# docker build --target=production -t handydz-platform:latest .
#
# Development build:
# docker build --target=development -t handydz-platform:dev .
#
# Build with arguments:
# docker build \
#   --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
#   --build-arg VERSION=1.0.0 \
#   --build-arg VCS_REF=$(git rev-parse --short HEAD) \
#   --target=production \
#   -t handydz-platform:1.0.0 .
#
# Run production container:
# docker run -p 3000:3000 \
#   -e DATABASE_URL="your-db-url" \
#   -e JWT_SECRET="your-jwt-secret" \
#   -e NEXTAUTH_SECRET="your-nextauth-secret" \
#   -v handydz-logs:/app/logs \
#   -v handydz-uploads:/app/uploads \
#   handydz-platform:latest
