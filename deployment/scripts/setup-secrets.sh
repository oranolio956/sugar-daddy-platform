#!/bin/bash

# Setup Secrets Script for Sugar Daddy Platform
# This script helps configure all necessary secrets for deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Generate secure secrets
generate_secret() {
    openssl rand -base64 32
}

# Setup Render secrets
setup_render_secrets() {
    log "Setting up Render secrets..."
    
    echo "Please configure the following secrets in your Render dashboard:"
    echo ""
    
    echo "=== Render Secrets Configuration ==="
    echo "1. JWT_SECRET: $(generate_secret)"
    echo "2. STRIPE_SECRET_KEY: [Your Stripe Secret Key]"
    echo "3. STRIPE_WEBHOOK_SECRET: [Your Stripe Webhook Secret]"
    echo "4. EMAIL_SERVICE_SECRET: $(generate_secret)"
    echo "5. NOTIFICATION_SERVICE_SECRET: $(generate_secret)"
    echo "6. AI_SERVICE_SECRET: $(generate_secret)"
    echo "7. SOCKET_IO_SECRET: $(generate_secret)"
    echo "8. PAYMENT_SERVICE_SECRET: $(generate_secret)"
    echo "9. SMS_SERVICE_SECRET: $(generate_secret)"
    echo "10. PUSH_SERVICE_SECRET: $(generate_secret)"
    echo "11. ENCRYPTION_KEY: $(generate_secret)"
    echo "12. TWO_FA_SECRET: $(generate_secret)"
    echo "13. CLOUDINARY_CLOUD_NAME: [Your Cloudinary Cloud Name]"
    echo "14. CLOUDINARY_API_KEY: [Your Cloudinary API Key]"
    echo "15. CLOUDINARY_API_SECRET: [Your Cloudinary API Secret]"
    echo "16. GEOLOCATION_API_KEY: [Your Geolocation API Key]"
    echo "17. MATCHING_ENGINE_SECRET: $(generate_secret)"
    echo "18. FRAUD_DETECTION_SECRET: $(generate_secret)"
    echo "19. ACCOUNTING_API_SECRET: $(generate_secret)"
    echo "20. ANALYTICS_API_SECRET: $(generate_secret)"
    echo ""
    
    success "Render secrets configuration guide displayed above"
}

# Setup Vercel environment variables
setup_vercel_env() {
    log "Setting up Vercel environment variables..."
    
    echo "Please configure the following environment variables in your Vercel dashboard:"
    echo ""
    
    echo "=== Vercel Environment Variables ==="
    echo "NEXT_PUBLIC_APP_NAME: Sugar Daddy Platform"
    echo "NEXT_PUBLIC_APP_VERSION: 1.0.0"
    echo "NEXT_PUBLIC_ENVIRONMENT: production"
    echo "NEXT_PUBLIC_MAINTENANCE_MODE: false"
    echo "NEXT_PUBLIC_API_URL: https://api-gateway.onrender.com"
    echo "NEXT_PUBLIC_WS_URL: wss://messaging-service.onrender.com"
    echo "NEXT_PUBLIC_APP_URL: https://sugar-daddy-platform.vercel.app"
    echo "NEXT_PUBLIC_FEATURE_PREMIUM: true"
    echo "NEXT_PUBLIC_FEATURE_GIFTS: true"
    echo "NEXT_PUBLIC_FEATURE_MATCHING: true"
    echo "NEXT_PUBLIC_FEATURE_MESSAGING: true"
    echo "NEXT_PUBLIC_FEATURE_PAYMENTS: true"
    echo "NEXT_PUBLIC_FEATURE_NOTIFICATIONS: true"
    echo "NEXT_PUBLIC_FEATURE_SOCIAL: true"
    echo "NEXT_PUBLIC_FEATURE_ANALYTICS: true"
    echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: [Your Stripe Publishable Key]"
    echo "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: [Your Cloudinary Cloud Name]"
    echo "NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: [Your Google Analytics ID]"
    echo "NEXT_PUBLIC_SENTRY_DSN: [Your Sentry DSN]"
    echo "NEXT_PUBLIC_HOTJAR_ID: [Your Hotjar ID]"
    echo "NEXT_PUBLIC_SEGMENT_WRITE_KEY: [Your Segment Write Key]"
    echo "NEXT_PUBLIC_CSP_ENABLED: true"
    echo "NEXT_PUBLIC_HSTS_ENABLED: true"
    echo "NEXT_PUBLIC_REFERRER_POLICY: strict-origin-when-cross-origin"
    echo "NEXT_PUBLIC_CACHE_TTL: 3600"
    echo "NEXT_PUBLIC_IMAGE_OPTIMIZATION: true"
    echo "NEXT_PUBLIC_LAZY_LOADING: true"
    echo "NEXT_PUBLIC_SERVICE_WORKER: true"
    echo "NEXT_PUBLIC_LOG_LEVEL: info"
    echo "NEXT_PUBLIC_ERROR_TRACKING: true"
    echo "NEXT_PUBLIC_PERFORMANCE_MONITORING: true"
    echo "NEXT_PUBLIC_USER_ANALYTICS: true"
    echo "NEXT_PUBLIC_DEBUG: false"
    echo "NEXT_PUBLIC_MOCK_API: false"
    echo "NEXT_PUBLIC_LOCAL_STORAGE_DEBUG: false"
    echo ""
    
    success "Vercel environment variables configuration guide displayed above"
}

# Setup GitHub secrets
setup_github_secrets() {
    log "Setting up GitHub secrets..."
    
    echo "Please configure the following secrets in your GitHub repository settings:"
    echo ""
    
    echo "=== GitHub Repository Secrets ==="
    echo "RENDER_API_KEY: [Your Render API Key]"
    echo "VERCEL_TOKEN: [Your Vercel Token]"
    echo "VERCEL_ORG_ID: [Your Vercel Organization ID]"
    echo "VERCEL_PROJECT_ID: [Your Vercel Project ID for Frontend]"
    echo "VERCEL_API_GATEWAY_PROJECT_ID: [Your Vercel Project ID for API Gateway]"
    echo ""
    
    success "GitHub secrets configuration guide displayed above"
}

# Create .env files with example values
create_env_files() {
    log "Creating example .env files..."
    
    # Create backend service .env files
    SERVICES=("api-gateway" "user-service" "matching-service" "messaging-service" "payment-service" "notification-service")
    
    for service in "${SERVICES[@]}"; do
        if [ ! -f "backend/$service/.env" ]; then
            cp "backend/$service/.env.example" "backend/$service/.env" 2>/dev/null || true
            log "Created .env file for $service"
        fi
    done
    
    # Create frontend .env file
    if [ ! -f "frontend/web-app/.env" ]; then
        cp "frontend/web-app/.env.example" "frontend/web-app/.env" 2>/dev/null || true
        log "Created .env file for frontend"
    fi
    
    success "Environment files created"
}

# Validate secret configuration
validate_secrets() {
    log "Validating secret configuration..."
    
    # Check if required files exist
    if [ ! -f "deployment/render/render.yaml" ]; then
        error "Render configuration file not found"
        return 1
    fi
    
    if [ ! -f "deployment/vercel/vercel.json" ]; then
        error "Vercel configuration file not found"
        return 1
    fi
    
    success "Secret configuration validation passed"
}

# Display deployment checklist
show_checklist() {
    log "Deployment Checklist:"
    echo ""
    echo "=== Pre-Deployment Checklist ==="
    echo "□ Generate all required secrets"
    echo "□ Configure Render secrets in dashboard"
    echo "□ Configure Vercel environment variables"
    echo "□ Configure GitHub repository secrets"
    echo "□ Create database instances on Render"
    echo "□ Update service URLs in configuration files"
    echo "□ Test local development environment"
    echo "□ Run security scan on secrets"
    echo ""
    
    echo "=== Post-Deployment Checklist ==="
    echo "□ Verify all services are running"
    echo "□ Run health checks on all services"
    echo "□ Test API endpoints"
    echo "□ Test frontend functionality"
    echo "□ Configure monitoring and alerting"
    echo "□ Set up backup procedures"
    echo "□ Document deployment process"
    echo "□ Notify team of deployment completion"
    echo ""
}

# Main setup function
main() {
    log "Starting secrets setup for Sugar Daddy Platform..."
    
    validate_secrets
    setup_render_secrets
    setup_vercel_env
    setup_github_secrets
    create_env_files
    show_checklist
    
    success "Secrets setup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Configure the secrets in your respective dashboards"
    echo "2. Update configuration files with your specific values"
    echo "3. Run the deployment scripts"
    echo "4. Monitor the deployment process"
}

# Run main function
main "$@"