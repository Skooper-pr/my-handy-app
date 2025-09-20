#!/bin/bash

# HandyDZ Platform - Initial Setup Script
# This script sets up the project for the first time

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="HandyDZ Platform"
NODE_VERSION="18"
DATABASE_FILE="prisma/dev.db"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ❌ $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] ℹ️  $1${NC}"
}

success() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')] 🎉 $1${NC}"
}

step() {
    echo -e "${PURPLE}[$(date +'%H:%M:%S')] 🚀 $1${NC}"
}

# Print welcome banner
print_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                  ║"
    echo "║                   🛠️  HandyDZ Platform Setup                     ║"
    echo "║                                                                  ║"
    echo "║          Welcome to the HandyDZ Craftsmen Platform!             ║"
    echo "║                                                                  ║"
    echo "║  This script will set up everything you need to get started.    ║"
    echo "║                                                                  ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    step "Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js version $NODE_VERSION or higher."
    fi

    NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $NODE_CURRENT -lt $NODE_VERSION ]]; then
        error "Node.js version $NODE_CURRENT is too old. Please upgrade to version $NODE_VERSION or higher."
    fi
    log "Node.js version $(node -v) ✅"

    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed. Please install npm."
    fi
    log "npm version $(npm -v) ✅"

    # Check git
    if ! command -v git &> /dev/null; then
        warn "git is not installed. Some features may not work properly."
    else
        log "git version $(git --version | cut -d' ' -f3) ✅"
    fi

    log "All prerequisites are met!"
}

# Setup environment variables
setup_environment() {
    step "Setting up environment variables..."

    if [[ ! -f ".env.local" ]]; then
        if [[ -f ".env.example" ]]; then
            cp .env.example .env.local
            log "Created .env.local from .env.example"
        else
            # Create basic .env.local file
            cat > .env.local << EOF
# Database Configuration
DATABASE_URL="file:./dev.db"

# Authentication & JWT
JWT_SECRET="handydz-super-secret-jwt-key-$(date +%s)"
NEXTAUTH_SECRET="handydz-nextauth-secret-$(date +%s)"
NEXTAUTH_URL="http://localhost:3000"

# App Configuration
NODE_ENV="development"
APP_URL="http://localhost:3000"
APP_NAME="HandyDZ - Craftsmen Platform"

# Feature Flags (Development)
ENABLE_REAL_TIME_CHAT="true"
ENABLE_NOTIFICATIONS="true"
ENABLE_BACKGROUND_CHECKS="false"

# Default Settings
DEFAULT_LANGUAGE="ar"
DEFAULT_CURRENCY="SAR"
DEFAULT_TIMEZONE="Asia/Riyadh"

# Development Database
DATABASE_GUI_PORT="5555"
API_DOCS_ENABLED="true"
EOF
            log "Created basic .env.local file"
        fi
    else
        log "Environment file already exists"
    fi

    # Make sure DATABASE_URL is set correctly
    if ! grep -q "DATABASE_URL=" .env.local; then
        echo 'DATABASE_URL="file:./dev.db"' >> .env.local
        log "Added DATABASE_URL to .env.local"
    fi

    info "Please review .env.local and update configuration as needed"
}

# Create necessary directories
create_directories() {
    step "Creating project directories..."

    local dirs=(
        "logs"
        "uploads"
        "backups"
        "data"
        "data/postgres"
        "data/redis"
        "config"
        "config/nginx"
        "config/nginx/sites"
    )

    for dir in "${dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            mkdir -p "$dir"
            log "Created directory: $dir"
        fi
    done

    # Create .gitkeep files for empty directories
    touch logs/.gitkeep
    touch uploads/.gitkeep
    touch backups/.gitkeep

    log "All directories created successfully"
}

# Install dependencies
install_dependencies() {
    step "Installing project dependencies..."

    # Clean install
    if [[ -d "node_modules" ]]; then
        log "Removing existing node_modules..."
        rm -rf node_modules
    fi

    if [[ -f "package-lock.json" ]]; then
        log "Removing package-lock.json for fresh install..."
        rm package-lock.json
    fi

    log "Installing dependencies (this may take a few minutes)..."
    npm install

    log "Dependencies installed successfully"
}

# Setup database
setup_database() {
    step "Setting up database..."

    # Load environment variables
    export $(grep -v '^#' .env.local | xargs)

    # Generate Prisma client
    log "Generating Prisma client..."
    npm run db:generate

    # Create database and push schema
    log "Creating database schema..."
    npm run db:push

    # Check if database exists and has tables
    if [[ -f "prisma/dev.db" ]]; then
        log "Database file created successfully"

        # Initialize with sample data
        log "Seeding database with initial data..."
        npm run db:seed 2>/dev/null || {
            warn "Database seeding failed, but this is not critical for initial setup"
        }
    else
        error "Database setup failed"
    fi

    log "Database setup completed"
}

# Verify installation
verify_installation() {
    step "Verifying installation..."

    # Check if build works
    log "Testing build process..."
    npm run build > /dev/null 2>&1 || {
        error "Build test failed. Please check the logs."
    }

    # Check if health endpoint works
    log "Testing application health..."
    npm run health:check > /dev/null 2>&1 || {
        warn "Health check failed, but this is normal for initial setup"
    }

    log "Installation verification completed"
}

# Generate configuration files
generate_configs() {
    step "Generating configuration files..."

    # Create PM2 ecosystem file
    if [[ ! -f "ecosystem.config.js" ]]; then
        cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'handydz-platform',
    script: 'server.ts',
    interpreter: 'tsx',
    instances: 1,
    exec_mode: 'fork',
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
    time: true,
    autorestart: true,
    max_restarts: 10,
    restart_delay: 1000
  }]
};
EOF
        log "Created PM2 ecosystem configuration"
    fi

    # Create basic nginx config for reference
    if [[ ! -f "config/nginx/sites/handydz.conf" ]]; then
        cat > config/nginx/sites/handydz.conf << 'EOF'
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF
        log "Created nginx configuration template"
    fi

    # Create Redis config
    if [[ ! -f "config/redis.conf" ]]; then
        cat > config/redis.conf << 'EOF'
# Redis configuration for HandyDZ Platform
port 6379
bind 0.0.0.0
protected-mode no
timeout 0
tcp-keepalive 300
daemonize no
supervised no
pidfile /var/run/redis_6379.pid
loglevel notice
logfile ""
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir ./
maxmemory 256mb
maxmemory-policy allkeys-lru
EOF
        log "Created Redis configuration"
    fi

    log "Configuration files generated"
}

# Print success message and next steps
print_success() {
    echo ""
    success "🎉 HandyDZ Platform setup completed successfully!"
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                          🚀 Next Steps                           ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}1. Start the development server:${NC}"
    echo -e "   ${YELLOW}npm run dev${NC}"
    echo ""
    echo -e "${CYAN}2. Open your browser and visit:${NC}"
    echo -e "   ${YELLOW}http://localhost:3000${NC}"
    echo ""
    echo -e "${CYAN}3. Default admin credentials:${NC}"
    echo -e "   ${YELLOW}Email: admin@handydz.com${NC}"
    echo -e "   ${YELLOW}Password: admin123456${NC}"
    echo ""
    echo -e "${CYAN}4. Useful commands:${NC}"
    echo -e "   ${YELLOW}npm run db:studio${NC}      # Open database GUI"
    echo -e "   ${YELLOW}npm run build${NC}          # Build for production"
    echo -e "   ${YELLOW}npm run test${NC}           # Run tests"
    echo -e "   ${YELLOW}npm run lint${NC}           # Check code style"
    echo ""
    echo -e "${CYAN}5. For production deployment:${NC}"
    echo -e "   ${YELLOW}bash scripts/deploy.sh${NC}"
    echo ""
    echo -e "${BLUE}📚 Documentation: https://docs.handydz.com${NC}"
    echo -e "${BLUE}💬 Support: https://github.com/handydz/platform/issues${NC}"
    echo ""
    echo -e "${GREEN}Happy coding! 🎯${NC}"
}

# Main setup function
main() {
    clear
    print_banner

    log "Starting HandyDZ Platform setup..."

    check_prerequisites
    setup_environment
    create_directories
    install_dependencies
    setup_database
    generate_configs
    verify_installation

    print_success

    # Ask if user wants to start the development server
    echo ""
    read -p "Would you like to start the development server now? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Starting development server..."
        npm run dev
    else
        info "You can start the development server later with: npm run dev"
    fi
}

# Handle script interruption
trap 'echo -e "\n${RED}Setup interrupted. You may need to run the setup again.${NC}"; exit 1' INT

# Show help if requested
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    echo "HandyDZ Platform Setup Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --help, -h    Show this help message"
    echo "  --force       Force setup even if already configured"
    echo ""
    echo "This script will:"
    echo "  ✅ Check system prerequisites"
    echo "  ✅ Set up environment variables"
    echo "  ✅ Create necessary directories"
    echo "  ✅ Install dependencies"
    echo "  ✅ Initialize database"
    echo "  ✅ Generate configuration files"
    echo "  ✅ Verify installation"
    echo ""
    exit 0
fi

# Check if already set up (unless --force is used)
if [[ -f ".env.local" ]] && [[ -f "prisma/dev.db" ]] && [[ -d "node_modules" ]] && [[ "${1:-}" != "--force" ]]; then
    warn "Project appears to be already set up."
    echo "Use --force to run setup anyway, or --help for more options."
    exit 0
fi

# Run main setup
main "$@"
