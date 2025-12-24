#!/bin/bash

# Health Check Script for Sugar Daddy Platform
# This script performs comprehensive health checks on all deployed services

set -e

# Configuration
SERVICES=(
    "api-gateway:https://api-gateway.onrender.com"
    "user-service:https://user-service.onrender.com"
    "matching-service:https://matching-service.onrender.com"
    "messaging-service:https://messaging-service.onrender.com"
    "payment-service:https://payment-service.onrender.com"
    "notification-service:https://notification-service.onrender.com"
    "frontend:https://sugar-daddy-platform.vercel.app"
    "api-gateway-vercel:https://api-gateway.vercel.app"
)

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

# Check HTTP status
check_http_status() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    log "Checking $service_name at $url"
    
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url/health" 2>/dev/null || echo "000")
    
    if [ "$HTTP_STATUS" == "$expected_status" ]; then
        success "$service_name is healthy (HTTP $HTTP_STATUS)"
        return 0
    else
        error "$service_name is unhealthy (HTTP $HTTP_STATUS, expected $expected_status)"
        return 1
    fi
}

# Check response time
check_response_time() {
    local service_name=$1
    local url=$2
    local max_response_time=${3:-2000}
    
    log "Checking response time for $service_name"
    
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$url/health" 2>/dev/null || echo "9999")
    RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc)
    
    if [ "$(echo "$RESPONSE_TIME_MS <= $max_response_time" | bc)" -eq 1 ]; then
        success "$service_name response time: ${RESPONSE_TIME_MS}ms (within ${max_response_time}ms limit)"
        return 0
    else
        warning "$service_name response time: ${RESPONSE_TIME_MS}ms (exceeds ${max_response_time}ms limit)"
        return 1
    fi
}

# Check API endpoints
check_api_endpoints() {
    local service_name=$1
    local base_url=$2
    
    log "Checking API endpoints for $service_name"
    
    # Check specific endpoints based on service
    case $service_name in
        "api-gateway")
            ENDPOINTS=("/api/v1/health" "/api/v1/status")
            ;;
        "user-service")
            ENDPOINTS=("/api/v1/users/health" "/api/v1/auth/health")
            ;;
        "matching-service")
            ENDPOINTS=("/api/v1/matching/health" "/api/v1/matches/health")
            ;;
        "messaging-service")
            ENDPOINTS=("/api/v1/messages/health" "/api/v1/conversations/health")
            ;;
        "payment-service")
            ENDPOINTS=("/api/v1/payments/health" "/api/v1/transactions/health")
            ;;
        "notification-service")
            ENDPOINTS=("/api/v1/notifications/health" "/api/v1/subscriptions/health")
            ;;
        "frontend")
            ENDPOINTS=("/api/health")
            ;;
        *)
            ENDPOINTS=("/health")
            ;;
    esac
    
    local failed_endpoints=0
    
    for endpoint in "${ENDPOINTS[@]}"; do
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$base_url$endpoint" 2>/dev/null || echo "000")
        
        if [ "$HTTP_STATUS" == "200" ]; then
            success "$service_name$endpoint is accessible"
        else
            error "$service_name$endpoint failed with HTTP $HTTP_STATUS"
            ((failed_endpoints++))
        fi
    done
    
    if [ $failed_endpoints -eq 0 ]; then
        success "All API endpoints for $service_name are healthy"
        return 0
    else
        error "$failed_endpoints API endpoints failed for $service_name"
        return 1
    fi
}

# Check database connectivity (for backend services)
check_database_connectivity() {
    local service_name=$1
    local base_url=$2
    
    log "Checking database connectivity for $service_name"
    
    # Check database health endpoint if available
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$base_url/health/db" 2>/dev/null || echo "000")
    
    if [ "$HTTP_STATUS" == "200" ]; then
        success "$service_name database connectivity is healthy"
        return 0
    else
        warning "$service_name database connectivity check failed (HTTP $HTTP_STATUS)"
        return 1
    fi
}

# Check service dependencies
check_service_dependencies() {
    local service_name=$1
    local base_url=$2
    
    log "Checking service dependencies for $service_name"
    
    # Check if service can reach other services
    case $service_name in
        "api-gateway")
            # API Gateway should be able to reach all services
            DEPENDENCIES=("user-service" "matching-service" "messaging-service" "payment-service" "notification-service")
            ;;
        "user-service")
            # User service depends on notification service
            DEPENDENCIES=("notification-service")
            ;;
        "matching-service")
            # Matching service depends on user service
            DEPENDENCIES=("user-service")
            ;;
        "messaging-service")
            # Messaging service depends on user service
            DEPENDENCIES=("user-service")
            ;;
        "payment-service")
            # Payment service depends on user service
            DEPENDENCIES=("user-service")
            ;;
        "notification-service")
            # Notification service depends on user service
            DEPENDENCIES=("user-service")
            ;;
        *)
            DEPENDENCIES=()
            ;;
    esac
    
    local failed_dependencies=0
    
    for dependency in "${DEPENDENCIES[@]}"; do
        # Find dependency URL
        DEPENDENCY_URL=""
        for service in "${SERVICES[@]}"; do
            if [[ "$service" == "$dependency:"* ]]; then
                DEPENDENCY_URL="${service#*:}"
                break
            fi
        done
        
        if [ -n "$DEPENDENCY_URL" ]; then
            HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPENDENCY_URL/health" 2>/dev/null || echo "000")
            
            if [ "$HTTP_STATUS" == "200" ]; then
                success "$service_name can reach $dependency"
            else
                error "$service_name cannot reach $dependency (HTTP $HTTP_STATUS)"
                ((failed_dependencies++))
            fi
        else
            warning "$service_name dependency $dependency URL not found"
            ((failed_dependencies++))
        fi
    done
    
    if [ $failed_dependencies -eq 0 ]; then
        success "All service dependencies for $service_name are healthy"
        return 0
    else
        error "$failed_dependencies service dependencies failed for $service_name"
        return 1
    fi
}

# Generate health check report
generate_report() {
    local total_services=$1
    local healthy_services=$2
    local failed_services=$3
    
    log "Generating health check report..."
    
    echo ""
    echo "========================================"
    echo "SUGAR DADDY PLATFORM HEALTH CHECK REPORT"
    echo "========================================"
    echo "Timestamp: $(date)"
    echo "Total Services: $total_services"
    echo "Healthy Services: $healthy_services"
    echo "Failed Services: $failed_services"
    echo "Health Score: $(echo "scale=2; $healthy_services * 100 / $total_services" | bc)%"
    echo "========================================"
    
    if [ $failed_services -eq 0 ]; then
        success "All services are healthy!"
        return 0
    else
        error "$failed_services services are failing!"
        return 1
    fi
}

# Main health check function
main() {
    log "Starting health check for Sugar Daddy Platform..."
    
    local total_services=0
    local healthy_services=0
    local failed_services=0
    
    for service in "${SERVICES[@]}"; do
        service_name="${service%%:*}"
        service_url="${service#*:}"
        
        ((total_services++))
        
        log "Health checking $service_name..."
        
        # Run all health checks
        local service_healthy=true
        
        # HTTP status check
        if ! check_http_status "$service_name" "$service_url"; then
            service_healthy=false
        fi
        
        # Response time check
        if ! check_response_time "$service_name" "$service_url"; then
            service_healthy=false
        fi
        
        # API endpoints check
        if ! check_api_endpoints "$service_name" "$service_url"; then
            service_healthy=false
        fi
        
        # Database connectivity check (for backend services)
        if [[ "$service_name" != "frontend" ]] && ! check_database_connectivity "$service_name" "$service_url"; then
            service_healthy=false
        fi
        
        # Service dependencies check (for backend services)
        if [[ "$service_name" != "frontend" ]] && ! check_service_dependencies "$service_name" "$service_url"; then
            service_healthy=false
        fi
        
        # Update counters
        if [ "$service_healthy" = true ]; then
            ((healthy_services++))
            success "$service_name health check passed"
        else
            ((failed_services++))
            error "$service_name health check failed"
        fi
        
        echo ""
    done
    
    # Generate final report
    generate_report $total_services $healthy_services $failed_services
    
    if [ $failed_services -eq 0 ]; then
        success "Health check completed successfully!"
        exit 0
    else
        error "Health check completed with failures!"
        exit 1
    fi
}

# Run main function
main "$@"