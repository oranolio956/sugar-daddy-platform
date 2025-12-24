#!/bin/bash

# Deployment Validation Script for Sugar Daddy Platform
# This script validates the complete deployment setup

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

# Validate configuration files
validate_config_files() {
    log "Validating configuration files..."
    
    local config_files=(
        "deployment/render/render.yaml"
        "deployment/render/api-gateway.yaml"
        "deployment/render/user-service.yaml"
        "deployment/render/matching-service.yaml"
        "deployment/render/messaging-service.yaml"
        "deployment/render/payment-service.yaml"
        "deployment/render/notification-service.yaml"
        "deployment/vercel/vercel.json"
        "deployment/vercel/vercel.env"
        ".github/workflows/deploy-render.yml"
        ".github/workflows/deploy-vercel.yml"
        "deployment/scripts/deploy-render.sh"
        "deployment/scripts/deploy-vercel.sh"
        "deployment/scripts/health-check.sh"
        "deployment/scripts/setup-secrets.sh"
        "deployment/tests/api-integration-tests.json"
        "deployment/tests/test-environment.json"
    )
    
    local missing_files=0
    
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            success "Found: $file"
        else
            error "Missing: $file"
            ((missing_files++))
        fi
    done
    
    if [ $missing_files -eq 0 ]; then
        success "All configuration files are present"
        return 0
    else
        error "$missing_files configuration files are missing"
        return 1
    fi
}

# Validate YAML syntax
validate_yaml_syntax() {
    log "Validating YAML syntax..."
    
    local yaml_files=(
        "deployment/render/render.yaml"
        "deployment/render/api-gateway.yaml"
        "deployment/render/user-service.yaml"
        "deployment/render/matching-service.yaml"
        "deployment/render/messaging-service.yaml"
        "deployment/render/payment-service.yaml"
        "deployment/render/notification-service.yaml"
        "deployment/vercel/vercel.json"
        ".github/workflows/deploy-render.yml"
        ".github/workflows/deploy-vercel.yml"
    )
    
    local invalid_yaml=0
    
    for file in "${yaml_files[@]}"; do
        if python3 -c "import yaml; yaml.safe_load(open('$file'))" 2>/dev/null; then
            success "Valid YAML: $file"
        else
            error "Invalid YAML: $file"
            ((invalid_yaml++))
        fi
    done
    
    if [ $invalid_yaml -eq 0 ]; then
        success "All YAML files have valid syntax"
        return 0
    else
        error "$invalid_yaml YAML files have invalid syntax"
        return 1
    fi
}

# Validate JSON syntax
validate_json_syntax() {
    log "Validating JSON syntax..."
    
    local json_files=(
        "deployment/tests/api-integration-tests.json"
        "deployment/tests/test-environment.json"
    )
    
    local invalid_json=0
    
    for file in "${json_files[@]}"; do
        if python3 -c "import json; json.load(open('$file'))" 2>/dev/null; then
            success "Valid JSON: $file"
        else
            error "Invalid JSON: $file"
            ((invalid_json++))
        fi
    done
    
    if [ $invalid_json -eq 0 ]; then
        success "All JSON files have valid syntax"
        return 0
    else
        error "$invalid_json JSON files have invalid syntax"
        return 1
    fi
}

# Validate script permissions
validate_script_permissions() {
    log "Validating script permissions..."
    
    local scripts=(
        "deployment/scripts/deploy-render.sh"
        "deployment/scripts/deploy-vercel.sh"
        "deployment/scripts/health-check.sh"
        "deployment/scripts/setup-secrets.sh"
        "deployment/scripts/validate-deployment.sh"
    )
    
    local missing_permissions=0
    
    for script in "${scripts[@]}"; do
        if [ -x "$script" ]; then
            success "Executable: $script"
        else
            error "Not executable: $script"
            ((missing_permissions++))
        fi
    done
    
    if [ $missing_permissions -eq 0 ]; then
        success "All scripts have proper permissions"
        return 0
    else
        error "$missing_permissions scripts need executable permissions"
        return 1
    fi
}

# Validate environment setup
validate_environment_setup() {
    log "Validating environment setup..."
    
    # Check if Node.js is installed
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        success "Node.js installed: $NODE_VERSION"
    else
        error "Node.js is not installed"
        return 1
    fi
    
    # Check if npm is installed
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        success "npm installed: $NPM_VERSION"
    else
        error "npm is not installed"
        return 1
    fi
    
    # Check if curl is installed
    if command -v curl &> /dev/null; then
        success "curl is installed"
    else
        error "curl is not installed"
        return 1
    fi
    
    # Check if jq is installed
    if command -v jq &> /dev/null; then
        success "jq is installed"
    else
        error "jq is not installed"
        return 1
    fi
    
    # Check if Python 3 is installed
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        success "Python 3 installed: $PYTHON_VERSION"
    else
        error "Python 3 is not installed"
        return 1
    fi
    
    success "Environment setup is valid"
    return 0
}

# Validate package.json files
validate_package_json() {
    log "Validating package.json files..."
    
    local package_files=(
        "backend/api-gateway/package.json"
        "backend/user-service/package.json"
        "backend/matching-service/package.json"
        "backend/messaging-service/package.json"
        "backend/payment-service/package.json"
        "backend/notification-service/package.json"
        "frontend/web-app/package.json"
    )
    
    local invalid_packages=0
    
    for file in "${package_files[@]}"; do
        if [ -f "$file" ]; then
            if python3 -c "import json; json.load(open('$file'))" 2>/dev/null; then
                success "Valid package.json: $file"
            else
                error "Invalid package.json: $file"
                ((invalid_packages++))
            fi
        else
            error "Missing package.json: $file"
            ((invalid_packages++))
        fi
    done
    
    if [ $invalid_packages -eq 0 ]; then
        success "All package.json files are valid"
        return 0
    else
        error "$invalid_packages package.json files are invalid"
        return 1
    fi
}

# Validate Docker files
validate_docker_files() {
    log "Validating Docker files..."
    
    local docker_files=(
        "deployment/docker/api-gateway.Dockerfile"
        "deployment/docker/user-service.Dockerfile"
        "deployment/docker/matching-service.Dockerfile"
        "deployment/docker/messaging-service.Dockerfile"
        "deployment/docker/payment-service.Dockerfile"
        "deployment/docker/notification-service.Dockerfile"
        "deployment/docker/frontend.Dockerfile"
        "deployment/docker/docker-compose.prod.yml"
    )
    
    local missing_docker_files=0
    
    for file in "${docker_files[@]}"; do
        if [ -f "$file" ]; then
            success "Found Docker file: $file"
        else
            error "Missing Docker file: $file"
            ((missing_docker_files++))
        fi
    done
    
    if [ $missing_docker_files -eq 0 ]; then
        success "All Docker files are present"
        return 0
    else
        error "$missing_docker_files Docker files are missing"
        return 1
    fi
}

# Validate documentation
validate_documentation() {
    log "Validating documentation..."
    
    local docs=(
        "DEPLOYMENT_GUIDE.md"
        "ENVIRONMENT_SETUP_GUIDE.md"
        "DEPLOYMENT_CONFIG.md"
        "ENVIRONMENT_FILES_SUMMARY.md"
    )
    
    local missing_docs=0
    
    for doc in "${docs[@]}"; do
        if [ -f "$doc" ]; then
            success "Found documentation: $doc"
        else
            error "Missing documentation: $doc"
            ((missing_docs++))
        fi
    done
    
    if [ $missing_docs -eq 0 ]; then
        success "All documentation files are present"
        return 0
    else
        error "$missing_docs documentation files are missing"
        return 1
    fi
}

# Generate validation report
generate_validation_report() {
    local total_checks=$1
    local passed_checks=$2
    local failed_checks=$3
    
    log "Generating validation report..."
    
    echo ""
    echo "========================================"
    echo "SUGAR DADDY PLATFORM DEPLOYMENT VALIDATION REPORT"
    echo "========================================"
    echo "Timestamp: $(date)"
    echo "Total Checks: $total_checks"
    echo "Passed Checks: $passed_checks"
    echo "Failed Checks: $failed_checks"
    echo "Validation Score: $(echo "scale=2; $passed_checks * 100 / $total_checks" | bc)%"
    echo "========================================"
    
    if [ $failed_checks -eq 0 ]; then
        success "All validation checks passed! Deployment is ready."
        return 0
    else
        error "$failed_checks validation checks failed! Please fix the issues before deploying."
        return 1
    fi
}

# Main validation function
main() {
    log "Starting deployment validation for Sugar Daddy Platform..."
    
    local total_checks=0
    local passed_checks=0
    local failed_checks=0
    
    # Run all validation checks
    checks=(
        "validate_config_files"
        "validate_yaml_syntax"
        "validate_json_syntax"
        "validate_script_permissions"
        "validate_environment_setup"
        "validate_package_json"
        "validate_docker_files"
        "validate_documentation"
    )
    
    for check in "${checks[@]}"; do
        ((total_checks++))
        
        log "Running check: $check"
        
        if $check; then
            ((passed_checks++))
            success "Check passed: $check"
        else
            ((failed_checks++))
            error "Check failed: $check"
        fi
        
        echo ""
    done
    
    # Generate final report
    generate_validation_report $total_checks $passed_checks $failed_checks
    
    if [ $failed_checks -eq 0 ]; then
        success "Deployment validation completed successfully!"
        exit 0
    else
        error "Deployment validation completed with failures!"
        exit 1
    fi
}

# Run main function
main "$@"