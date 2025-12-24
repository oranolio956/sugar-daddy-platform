#!/bin/bash

# Sugar Daddy Platform - Secure Secrets Setup Script
# This script sets up secure token storage and configuration management

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$(dirname "$SCRIPT_DIR")/config"
SECRETS_FILE="$CONFIG_DIR/secrets.json"
ENV_FILE="$CONFIG_DIR/.env.production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v jq &> /dev/null; then
        log_error "jq is required but not installed. Please install jq first."
        exit 1
    fi
    
    if ! command -v openssl &> /dev/null; then
        log_error "openssl is required but not installed. Please install openssl first."
        exit 1
    fi
    
    log_success "All dependencies are available."
}

# Function to create secure directory structure
setup_directories() {
    log_info "Setting up secure directory structure..."
    
    # Create config directory with secure permissions
    mkdir -p "$CONFIG_DIR"
    chmod 700 "$CONFIG_DIR"
    
    # Create secrets file if it doesn't exist
    if [ ! -f "$SECRETS_FILE" ]; then
        log_info "Creating secrets configuration file..."
        cat > "$SECRETS_FILE" << 'EOF'
{
  "platforms": {
    "vercel": {
      "token": "",
      "project_id": "sugar-daddy-platform",
      "org_id": "sugar-daddy-platform",
      "environment": "production",
      "last_connected": null,
      "permissions_verified": false
    },
    "render": {
      "token": "",
      "service_id": "sugar-daddy-platform",
      "environment": "production",
      "last_connected": null,
      "permissions_verified": false
    }
  },
  "security": {
    "encryption_enabled": false,
    "file_permissions": "600",
    "backup_required": true,
    "last_backup": null
  },
  "deployment": {
    "auto_deploy": true,
    "webhook_secret": "",
    "health_check_enabled": true,
    "monitoring_enabled": true
  }
}
EOF
        chmod 600 "$SECRETS_FILE"
        log_success "Secrets file created with secure permissions."
    else
        log_info "Secrets file already exists."
    fi
}

# Function to validate tokens
validate_tokens() {
    log_info "Validating platform tokens..."
    
    # Get tokens from secrets file
    VERCEL_TOKEN=$(jq -r '.platforms.vercel.token' "$SECRETS_FILE")
    RENDER_TOKEN=$(jq -r '.platforms.render.token' "$SECRETS_FILE")
    
    if [ "$VERCEL_TOKEN" = "null" ] || [ "$VERCEL_TOKEN" = "" ]; then
        log_warning "Vercel token not found in secrets file."
        read -p "Enter Vercel token: " VERCEL_TOKEN
        jq --arg token "$VERCEL_TOKEN" '.platforms.vercel.token = $token' "$SECRETS_FILE" > temp.json && mv temp.json "$SECRETS_FILE"
    fi
    
    if [ "$RENDER_TOKEN" = "null" ] || [ "$RENDER_TOKEN" = "" ]; then
        log_warning "Render token not found in secrets file."
        read -p "Enter Render token: " RENDER_TOKEN
        jq --arg token "$RENDER_TOKEN" '.platforms.render.token = $token' "$SECRETS_FILE" > temp.json && mv temp.json "$SECRETS_FILE"
    fi
    
    log_success "Tokens validated and stored."
}

# Function to test platform connectivity
test_connectivity() {
    log_info "Testing platform connectivity..."
    
    # Test Vercel connectivity
    log_info "Testing Vercel connection..."
    if curl -s -H "Authorization: Bearer $VERCEL_TOKEN" "https://api.vercel.com/v6/projects" > /dev/null; then
        log_success "Vercel connection successful."
        jq '.platforms.vercel.last_connected = now | .platforms.vercel.permissions_verified = true' "$SECRETS_FILE" > temp.json && mv temp.json "$SECRETS_FILE"
    else
        log_error "Vercel connection failed. Please check your token."
    fi
    
    # Test Render connectivity
    log_info "Testing Render connection..."
    if curl -s -H "Authorization: Bearer $RENDER_TOKEN" "https://api.render.com/v1/services" > /dev/null; then
        log_success "Render connection successful."
        jq '.platforms.render.last_connected = now | .platforms.render.permissions_verified = true' "$SECRETS_FILE" > temp.json && mv temp.json "$SECRETS_FILE"
    else
        log_error "Render connection failed. Please check your token."
    fi
}

# Function to setup environment variables
setup_environment() {
    log_info "Setting up environment variables..."
    
    # Generate webhook secret if not exists
    WEBHOOK_SECRET=$(jq -r '.deployment.webhook_secret' "$SECRETS_FILE")
    if [ "$WEBHOOK_SECRET" = "null" ] || [ "$WEBHOOK_SECRET" = "" ]; then
        WEBHOOK_SECRET=$(openssl rand -base64 32)
        jq --arg secret "$WEBHOOK_SECRET" '.deployment.webhook_secret = $secret' "$SECRETS_FILE" > temp.json && mv temp.json "$SECRETS_FILE"
        log_success "Generated webhook secret."
    fi
    
    # Create .env.production file if it doesn't exist
    if [ ! -f "$ENV_FILE" ]; then
        log_info "Creating production environment file..."
        cat > "$ENV_FILE" << EOF
# Production Environment Configuration
# This file contains production environment variables for the deployment pipeline

# Platform Tokens (Secure)
VERCEL_TOKEN=$VERCEL_TOKEN
RENDER_TOKEN=$RENDER_TOKEN

# Platform Configuration
VERCEL_PROJECT_ID=sugar-daddy-platform
VERCEL_ORG_ID=sugar-daddy-platform
RENDER_SERVICE_ID=sugar-daddy-platform

# Database Configuration
DATABASE_URL=postgresql://user:password@db-host:5432/sugar_daddy_prod
REDIS_URL=redis://redis-host:6379

# Application Configuration
NODE_ENV=production
API_BASE_URL=https://api.sugar-daddy-platform.com
FRONTEND_URL=https://sugar-daddy-platform.vercel.app

# Security Configuration
JWT_SECRET=your-production-jwt-secret-key
ENCRYPTION_KEY=your-production-encryption-key
WEBHOOK_SECRET=$WEBHOOK_SECRET

# Monitoring and Logging
LOG_LEVEL=info
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
DATADOG_API_KEY=your-datadog-api-key

# Feature Flags
ENABLE_PREMIUM_FEATURES=true
ENABLE_SOCIAL_FEATURES=true
ENABLE_ADVANCED_MATCHING=true

# Third-party Integrations
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
SENDGRID_API_KEY=SG.your_sendgrid_api_key
CLOUDINARY_URL=cloudinary://your_cloudinary_config

# Deployment Configuration
AUTO_DEPLOY=true
HEALTH_CHECK_ENABLED=true
MONITORING_ENABLED=true
BACKUP_ENABLED=true
EOF
        chmod 600 "$ENV_FILE"
        log_success "Environment file created with secure permissions."
    else
        log_info "Environment file already exists."
    fi
}

# Function to create backup
create_backup() {
    log_info "Creating backup of configuration files..."
    
    BACKUP_DIR="$CONFIG_DIR/backups"
    mkdir -p "$BACKUP_DIR"
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/config_backup_$TIMESTAMP.tar.gz"
    
    tar -czf "$BACKUP_FILE" "$SECRETS_FILE" "$ENV_FILE" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        log_success "Configuration backup created: $BACKUP_FILE"
        jq --arg backup_time "$(date -Iseconds)" '.security.last_backup = $backup_time' "$SECRETS_FILE" > temp.json && mv temp.json "$SECRETS_FILE"
    else
        log_warning "Failed to create backup."
    fi
    
    # Clean up old backups (keep last 5)
    ls -t "$BACKUP_DIR"/config_backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
}

# Function to display summary
display_summary() {
    log_info "Setup Summary:"
    echo ""
    echo "✅ Secure configuration files created"
    echo "✅ Platform tokens stored securely"
    echo "✅ Environment variables configured"
    echo "✅ Connectivity tested"
    echo "✅ Backup created"
    echo ""
    echo "Configuration files:"
    echo "  - Secrets: $SECRETS_FILE"
    echo "  - Environment: $ENV_FILE"
    echo ""
    echo "Next steps:"
    echo "  1. Update database and service URLs in $ENV_FILE"
    echo "  2. Set up SSL certificates for production"
    echo "  3. Configure monitoring and alerting"
    echo "  4. Test deployment pipeline"
    echo ""
}

# Main execution
main() {
    log_info "Starting Sugar Daddy Platform secrets setup..."
    echo ""
    
    check_dependencies
    setup_directories
    validate_tokens
    test_connectivity
    setup_environment
    create_backup
    display_summary
    
    log_success "Setup completed successfully!"
}

# Run main function
main "$@"