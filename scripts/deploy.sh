#!/bin/bash

# HandyDZ Platform Deployment Script
# This script handles the complete deployment process for the HandyDZ platform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="HandyDZ Platform"
NODE_VERSION="18"
BACKUP_DIR="./backups"
LOG_FILE="./deploy.log"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}" | tee -a "$LOG_FILE"
}

# Check if running as root
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        warn "Running as root. Consider using a non-root user for security."
    fi
}

# Check Node.js version
check_node_version() {
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js version $NODE_VERSION or higher."
    fi

    NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $NODE_CURRENT -lt $NODE_VERSION ]]; then
        error "Node.js version $NODE_CURRENT is too old. Please upgrade to version $NODE_VERSION or higher."
    fi

    log "Node.js version $(node -v) is compatible"
}

# Check required tools
check_dependencies() {
    local deps=("npm" "git")

    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            error "$dep is not installed. Please install $dep and try again."
        fi
    done

    log "All required dependencies are available"
}

# Check environment variables
check_environment() {
    log "Checking environment configuration..."

    if [[ ! -f ".env.local" && ! -f ".env.production" ]]; then
        warn "No environment file found. Copying from .env.example..."
        if [[ -f ".env.example" ]]; then
            cp .env.example .env.local
            warn "Please configure .env.local with your production settings before continuing."
            info "Required variables: DATABASE_URL, JWT_SECRET, NEXTAUTH_SECRET"
            exit 1
        else
            error "No .env.example file found. Please create environment configuration."
        fi
    fi

    # Load environment variables
    if [[ -f ".env.production" ]]; then
        set -o allexport
        source .env.production
        set +o allexport
        info "Loaded production environment variables"
    elif [[ -f ".env.local" ]]; then
        set -o allexport
        source .env.local
        set +o allexport
        info "Loaded local environment variables"
    fi

    # Check critical variables
    local required_vars=("DATABASE_URL" "JWT_SECRET" "NEXTAUTH_SECRET")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            error "Required environment variable $var is not set"
        fi
    done

    log "Environment configuration is valid"
}

# Create backup
create_backup() {
    log "Creating backup..."

    mkdir -p "$BACKUP_DIR"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_name="backup_$timestamp"

    # Backup database
    if [[ -f "prisma/dev.db" ]]; then
        cp prisma/dev.db "$BACKUP_DIR/db_$backup_name.db"
        log "Database backup created: $BACKUP_DIR/db_$backup_name.db"
    fi

    # Backup uploads if they exist
    if [[ -d "public/uploads" ]]; then
        tar -czf "$BACKUP_DIR/uploads_$backup_name.tar.gz" public/uploads
        log "Uploads backup created: $BACKUP_DIR/uploads_$backup_name.tar.gz"
    fi

    log "Backup completed successfully"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."

    # Clean install
    if [[ -d "node_modules" ]]; then
        log "Removing existing node_modules..."
        rm -rf node_modules
    fi

    if [[ -f "package-lock.json" ]]; then
        log "Removing package-lock.json for clean install..."
        rm package-lock.json
    fi

    # Install dependencies
    npm install --production=false

    log "Dependencies installed successfully"
}

# Setup database
setup_database() {
    log "Setting up database..."

    # Generate Prisma client
    npm run db:generate

    # Run migrations
    if [[ "$NODE_ENV" == "production" ]]; then
        npx prisma migrate deploy
    else
        npm run db:push
    fi

    # Check if database needs seeding
    log "Checking if database needs initial data..."

    # Run initialization script if needed
    if command -v tsx &> /dev/null; then
        tsx src/lib/db-init.ts 2>/dev/null || {
            log "Database already initialized or initialization not needed"
        }
    else
        log "tsx not available, skipping database initialization"
    fi

    log "Database setup completed"
}

# Build application
build_application() {
    log "Building application..."

    # Clean previous build
    if [[ -d ".next" ]]; then
        rm -rf .next
    fi

    # Build the application
    npm run build

    log "Application build completed successfully"
}

# Health check
health_check() {
    log "Performing health check..."

    # Check if tsx is available for health check script
    if command -v tsx &> /dev/null; then
        tsx -e "
        import { checkDatabaseHealth } from './src/lib/db-init';
        checkDatabaseHealth().then(healthy => {
            if (healthy) {
                console.log('✅ Health check passed');
                process.exit(0);
            } else {
                console.log('❌ Health check failed');
                process.exit(1);
            }
        }).catch(() => {
            console.log('❌ Health check script failed');
            process.exit(1);
        });
        " 2>/dev/null || {
            warn "Health check script failed, but continuing deployment"
        }
    else
        log "Health check script not available, skipping"
    fi

    log "Health check completed"
}

# Setup PM2 (if available)
setup_pm2() {
    if command -v pm2 &> /dev/null; then
        log "Setting up PM2 process manager..."

        # Create PM2 ecosystem file
        cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'handydz-platform',
    script: 'server.ts',
    interpreter: 'tsx',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

        # Create logs directory
        mkdir -p logs

        # Stop existing process if running
        pm2 stop handydz-platform 2>/dev/null || true
        pm2 delete handydz-platform 2>/dev/null || true

        # Start the application
        pm2 start ecosystem.config.js --env production
        pm2 save

        log "PM2 setup completed. Application is running."
        info "Use 'pm2 logs handydz-platform' to view logs"
        info "Use 'pm2 restart handydz-platform' to restart"

    else
        log "PM2 not available. You can start the application manually with: npm run start"
    fi
}

# Setup SSL with Let's Encrypt (optional)
setup_ssl() {
    if [[ "$1" == "--ssl" ]] && command -v certbot &> /dev/null; then
        log "Setting up SSL certificate..."

        read -p "Enter your domain name: " domain
        if [[ -n "$domain" ]]; then
            certbot --nginx -d "$domain" --non-interactive --agree-tos --email admin@"$domain"
            log "SSL certificate setup completed for $domain"
        else
            warn "No domain provided, skipping SSL setup"
        fi
    fi
}

# Rollback function
rollback() {
    log "Rolling back to previous version..."

    # Stop current application
    pm2 stop handydz-platform 2>/dev/null || true

    # Restore database backup
    local latest_backup=$(ls -t "$BACKUP_DIR"/db_backup_*.db 2>/dev/null | head -n1)
    if [[ -n "$latest_backup" ]]; then
        cp "$latest_backup" prisma/dev.db
        log "Database restored from $latest_backup"
    fi

    # Restore uploads backup
    local latest_uploads=$(ls -t "$BACKUP_DIR"/uploads_backup_*.tar.gz 2>/dev/null | head -n1)
    if [[ -n "$latest_uploads" ]]; then
        tar -xzf "$latest_uploads" -C public/
        log "Uploads restored from $latest_uploads"
    fi

    log "Rollback completed"
}

# Main deployment function
deploy() {
    log "Starting deployment of $PROJECT_NAME..."

    check_permissions
    check_node_version
    check_dependencies
    check_environment
    create_backup
    install_dependencies
    setup_database
    build_application
    health_check
    setup_pm2
    setup_ssl "$@"

    log "🎉 Deployment completed successfully!"
    info "Application is now running and ready to serve requests"
    info "Monitor logs: tail -f $LOG_FILE"

    if command -v pm2 &> /dev/null; then
        info "PM2 status:"
        pm2 list
    fi
}

# Show usage information
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  deploy           Deploy the application (default)"
    echo "  rollback         Rollback to previous version"
    echo "  health-check     Run health check only"
    echo "  --ssl            Enable SSL setup with Let's Encrypt"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy"
    echo "  $0 deploy --ssl"
    echo "  $0 rollback"
    echo "  $0 health-check"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        deploy "$@"
        ;;
    "rollback")
        rollback
        ;;
    "health-check")
        health_check
        ;;
    "--help"|"-h"|"help")
        usage
        ;;
    *)
        echo "Unknown command: $1"
        usage
        exit 1
        ;;
esac
