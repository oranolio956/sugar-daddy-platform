#!/bin/bash

# Vercel Deployment Script for Sugar Daddy Platform
# This script automates the deployment of frontend and API Gateway to Vercel

set -e

# Configuration
VERCEL_TOKEN="${VERCEL_TOKEN}"
VERCEL_ORG_ID="${VERCEL_ORG_ID}"
VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID}"
VERCEL_API_GATEWAY_PROJECT_ID="${VERCEL_API_GATEWAY_PROJECT_ID}"

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
    
    if [ -z "$VERCEL_TOKEN" ]; then
        error "VERCEL_TOKEN environment variable is required"
        exit 1
    fi
    
    if [ -z "$VERCEL_ORG_ID" ]; then
        error "VERCEL_ORG_ID environment variable is required"
        exit 1
    fi
    
    if [ -z "$VERCEL_PROJECT_ID" ]; then
        error "VERCEL_PROJECT_ID environment variable is required"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        warning "Vercel CLI not found, installing..."
        npm install -g vercel
    fi
    
    success "Prerequisites check passed"
}

# Validate Vercel configuration
validate_configuration() {
    log "Validating Vercel configuration..."
    
    if [ ! -f "deployment/vercel/vercel.json" ]; then
        error "Vercel configuration file not found at deployment/vercel/vercel.json"
        exit 1
    fi
    
    if [ ! -f "frontend/web-app/package.json" ]; then
        error "Frontend package.json not found"
        exit 1
    fi
    
    success "Configuration validation passed"
}

# Deploy frontend to Vercel
deploy_frontend() {
    log "Deploying frontend to Vercel..."
    
    cd frontend/web-app
    
    # Set Vercel environment variables
    vercel env add VERCEL_TOKEN production <<< "$VERCEL_TOKEN"
    vercel env add NEXT_PUBLIC_API_URL production <<< "https://api-gateway.onrender.com"
    vercel env add NEXT_PUBLIC_WS_URL production <<< "wss://messaging-service.onrender.com"
    vercel env add NEXT_PUBLIC_APP_URL production <<< "https://sugar-daddy-platform.vercel.app"
    
    # Deploy to production
    DEPLOY_OUTPUT=$(vercel --prod --token "$VERCEL_TOKEN" --yes)
    
    # Extract deployment URL
    FRONTEND_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^ ]*.vercel.app')
    
    if [ -n "$FRONTEND_URL" ]; then
        success "Frontend deployed to: $FRONTEND_URL"
    else
        error "Frontend deployment failed"
        echo "$DEPLOY_OUTPUT"
        exit 1
    fi
    
    cd ../..
}

# Deploy API Gateway to Vercel
deploy_api_gateway() {
    log "Deploying API Gateway to Vercel..."
    
    cd backend/api-gateway
    
    # Set Vercel environment variables
    vercel env add VERCEL_TOKEN production <<< "$VERCEL_TOKEN"
    vercel env add NODE_ENV production <<< "production"
    vercel env add PORT production <<< "3000"
    
    # Deploy to production
    DEPLOY_OUTPUT=$(vercel --prod --token "$VERCEL_TOKEN" --yes)
    
    # Extract deployment URL
    API_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^ ]*.vercel.app')
    
    if [ -n "$API_URL" ]; then
        success "API Gateway deployed to: $API_URL"
    else
        error "API Gateway deployment failed"
        echo "$DEPLOY_OUTPUT"
        exit 1
    fi
    
    cd ../..
}

# Health check deployed applications
health_check() {
    log "Performing health checks..."
    
    # Health check frontend
    log "Health checking frontend..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://sugar-daddy-platform.vercel.app/health")
    
    if [ "$HTTP_STATUS" == "200" ]; then
        success "Frontend health check passed"
    else
        error "Frontend health check failed with status $HTTP_STATUS"
        exit 1
    fi
    
    # Health check API Gateway
    log "Health checking API Gateway..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://api-gateway.vercel.app/health")
    
    if [ "$HTTP_STATUS" == "200" ]; then
        success "API Gateway health check passed"
    else
        error "API Gateway health check failed with status $HTTP_STATUS"
        exit 1
    fi
}

# Run integration tests
run_integration_tests() {
    log "Running integration tests..."
    
    if [ -f "deployment/tests/api-integration-tests.json" ]; then
        log "Running API integration tests..."
        
        # Install newman if not present
        if ! command -v newman &> /dev/null; then
            npm install -g newman
        fi
        
        # Run Postman collection
        newman run deployment/tests/api-integration-tests.json \
            --environment deployment/tests/test-environment.json \
            --reporters cli,json \
            --reporter-json-export deployment/tests/reports/api-test-results.json
        
        success "Integration tests completed"
    else
        warning "Integration test file not found, skipping tests"
    fi
}

# Display deployment summary
show_summary() {
    log "Deployment Summary:"
    echo ""
    echo -e "${GREEN}Frontend:${NC} https://sugar-daddy-platform.vercel.app"
    echo -e "${GREEN}API Gateway:${NC} https://api-gateway.vercel.app"
    echo ""
    success "Vercel deployment completed successfully!"
}

# Main deployment function
main() {
    log "Starting Vercel deployment for Sugar Daddy Platform..."
    
    check_prerequisites
    validate_configuration
    deploy_frontend
    deploy_api_gateway
    health_check
    run_integration_tests
    show_summary
    
    success "Vercel deployment completed successfully!"
}

# Run main function
main "$@"