#!/bin/bash

# Render Deployment Script for Sugar Daddy Platform
# This script automates the deployment of all services to Render.com

set -e

# Configuration
RENDER_API_KEY="${RENDER_API_KEY}"
RENDER_APP_ID="${RENDER_APP_ID}"
SERVICES=("api-gateway" "user-service" "matching-service" "messaging-service" "payment-service" "notification-service")
DATABASES=("sugar-daddy-db" "redis-cache")

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

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if [ -z "$RENDER_API_KEY" ]; then
        error "RENDER_API_KEY environment variable is required"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        error "jq is required but not installed"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Validate Render configuration
validate_configuration() {
    log "Validating Render configuration..."
    
    if [ ! -f "deployment/render/render.yaml" ]; then
        error "Render configuration file not found at deployment/render/render.yaml"
        exit 1
    fi
    
    # Validate YAML syntax
    if ! python3 -c "import yaml; yaml.safe_load(open('deployment/render/render.yaml'))" 2>/dev/null; then
        error "Invalid YAML syntax in render.yaml"
        exit 1
    fi
    
    success "Configuration validation passed"
}

# Deploy services to Render
deploy_services() {
    log "Deploying services to Render..."
    
    for service in "${SERVICES[@]}"; do
        log "Deploying $service..."
        
        # Check if service exists
        SERVICE_ID=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
            "https://api.render.com/v1/services?name=$service" | \
            jq -r '.[0].id')
        
        if [ "$SERVICE_ID" != "null" ] && [ -n "$SERVICE_ID" ]; then
            # Trigger deployment
            DEPLOY_RESPONSE=$(curl -s -X POST \
                -H "Authorization: Bearer $RENDER_API_KEY" \
                -H "Content-Type: application/json" \
                -d '{"deployType":"git"}' \
                "https://api.render.com/v1/services/$SERVICE_ID/deploy")
            
            DEPLOY_ID=$(echo "$DEPLOY_RESPONSE" | jq -r '.id')
            
            if [ "$DEPLOY_ID" != "null" ]; then
                success "$service deployment triggered (ID: $DEPLOY_ID)"
            else
                error "$service deployment failed"
                echo "$DEPLOY_RESPONSE"
                exit 1
            fi
        else
            warning "Service $service not found, skipping deployment"
        fi
    done
}

# Wait for services to be ready
wait_for_services() {
    log "Waiting for services to be ready..."
    
    for service in "${SERVICES[@]}"; do
        log "Waiting for $service to be live..."
        
        for i in {1..60}; do
            STATUS=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
                "https://api.render.com/v1/services?name=$service" | \
                jq -r '.[0].status')
            
            if [ "$STATUS" == "live" ]; then
                success "$service is live"
                break
            fi
            
            if [ $i -eq 60 ]; then
                error "Timeout waiting for $service to be live"
                exit 1
            fi
            
            sleep 10
        done
    done
}

# Health check all services
health_check() {
    log "Performing health checks..."
    
    for service in "${SERVICES[@]}"; do
        log "Health checking $service..."
        
        # Get service URL
        SERVICE_URL=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
            "https://api.render.com/v1/services?name=$service" | \
            jq -r '.[0].serviceDetails.url')
        
        if [ "$SERVICE_URL" == "null" ] || [ -z "$SERVICE_URL" ]; then
            error "Could not get URL for $service"
            exit 1
        fi
        
        # Health check
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/health")
        
        if [ "$HTTP_STATUS" == "200" ]; then
            success "$service health check passed"
        else
            error "$service health check failed with status $HTTP_STATUS"
            exit 1
        fi
    done
}

# Display deployment summary
show_summary() {
    log "Deployment Summary:"
    echo ""
    
    for service in "${SERVICES[@]}"; do
        SERVICE_URL=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
            "https://api.render.com/v1/services?name=$service" | \
            jq -r '.[0].serviceDetails.url')
        
        echo -e "${GREEN}$service:${NC} $SERVICE_URL"
    done
    
    echo ""
    success "All services deployed successfully!"
}

# Main deployment function
main() {
    log "Starting Render deployment for Sugar Daddy Platform..."
    
    check_prerequisites
    validate_configuration
    deploy_services
    wait_for_services
    health_check
    show_summary
    
    success "Render deployment completed successfully!"
}

# Run main function
main "$@"