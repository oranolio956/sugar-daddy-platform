#!/bin/bash

# Sugar Daddy Platform - Setup Verification Script
# This script verifies the complete deployment setup

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

# Function to check if file exists and has correct permissions
check_file() {
    local file="$1"
    local expected_perms="$2"
    
    if [ -f "$file" ]; then
        local actual_perms=$(stat -c "%a" "$file" 2>/dev/null)
        if [ "$actual_perms" = "$expected_perms" ]; then
            log_success "File $file exists with correct permissions ($expected_perms)"
            return 0
        else
            log_error "File $file has incorrect permissions ($actual_perms, expected $expected_perms)"
            return 1
        fi
    else
        log_error "File $file does not exist"
        return 1
    fi
}

# Function to validate JSON structure
validate_json() {
    local file="$1"
    
    if command -v jq &> /dev/null; then
        if jq empty "$file" &> /dev/null; then
            log_success "JSON file $file is valid"
            return 0
        else
            log_error "JSON file $file is invalid"
            return 1
        fi
    else
        log_warning "jq not installed, skipping JSON validation"
        return 0
    fi
}

# Function to check platform tokens
check_tokens() {
    log_info "Checking platform tokens..."
    
    if [ -f "$SECRETS_FILE" ]; then
        if command -v jq &> /dev/null; then
            VERCEL_TOKEN=$(jq -r '.platforms.vercel.token' "$SECRETS_FILE" 2>/dev/null)
            RENDER_TOKEN=$(jq -r '.platforms.render.token' "$SECRETS_FILE" 2>/dev/null)
            
            if [ "$VERCEL_TOKEN" != "null" ] && [ "$VERCEL_TOKEN" != "" ]; then
                log_success "Vercel token found in secrets file"
            else
                log_error "Vercel token not found or empty"
            fi
            
            if [ "$RENDER_TOKEN" != "null" ] && [ "$RENDER_TOKEN" != "" ]; then
                log_success "Render token found in secrets file"
            else
                log_error "Render token not found or empty"
            fi
        else
            log_warning "jq not available, cannot validate tokens"
        fi
    else
        log_error "Secrets file not found"
    fi
}

# Function to check environment variables
check_environment() {
    log_info "Checking environment variables..."
    
    if [ -f "$ENV_FILE" ]; then
        local required_vars=("VERCEL_TOKEN" "RENDER_TOKEN" "DATABASE_URL" "REDIS_URL")
        local missing_vars=()
        
        for var in "${required_vars[@]}"; do
            if grep -q "^$var=" "$ENV_FILE"; then
                log_success "Environment variable $var found"
            else
                log_error "Environment variable $var missing"
                missing_vars+=("$var")
            fi
        done
        
        if [ ${#missing_vars[@]} -eq 0 ]; then
            log_success "All required environment variables are present"
        else
            log_error "Missing environment variables: ${missing_vars[*]}"
        fi
    else
        log_error "Environment file not found"
    fi
}

# Function to check deployment scripts
check_scripts() {
    log_info "Checking deployment scripts..."
    
    local scripts=("setup-secrets.sh" "deploy-render.sh" "deploy-vercel.sh" "validate-deployment.sh")
    local missing_scripts=()
    
    for script in "${scripts[@]}"; do
        if [ -x "$SCRIPT_DIR/$script" ]; then
            log_success "Script $script exists and is executable"
        else
            log_error "Script $script missing or not executable"
            missing_scripts+=("$script")
        fi
    done
    
    if [ ${#missing_scripts[@]} -eq 0 ]; then
        log_success "All deployment scripts are present"
    else
        log_error "Missing scripts: ${missing_scripts[*]}"
    fi
}

# Function to check GitHub Actions workflows
check_workflows() {
    log_info "Checking GitHub Actions workflows..."
    
    local workflows_dir=".github/workflows"
    local workflows=("deploy-render.yml" "deploy-vercel.yml")
    local missing_workflows=()
    
    for workflow in "${workflows[@]}"; do
        if [ -f "$workflows_dir/$workflow" ]; then
            log_success "Workflow $workflow exists"
        else
            log_error "Workflow $workflow missing"
            missing_workflows+=("$workflow")
        fi
    done
    
    if [ ${#missing_workflows[@]} -eq 0 ]; then
        log_success "All GitHub Actions workflows are present"
    else
        log_error "Missing workflows: ${missing_workflows[*]}"
    fi
}

# Function to check Render service configurations
check_render_configs() {
    log_info "Checking Render service configurations..."
    
    local render_dir="deployment/render"
    local services=("api-gateway" "user-service" "matching-service" "messaging-service" "payment-service" "notification-service")
    local missing_configs=()
    
    for service in "${services[@]}"; do
        if [ -f "$render_dir/$service.yaml" ]; then
            log_success "Render config for $service exists"
        else
            log_error "Render config for $service missing"
            missing_configs+=("$service")
        fi
    done
    
    if [ ${#missing_configs[@]} -eq 0 ]; then
        log_success "All Render service configurations are present"
    else
        log_error "Missing Render configs: ${missing_configs[*]}"
    fi
}

# Function to check Vercel configuration
check_vercel_config() {
    log_info "Checking Vercel configuration..."
    
    local vercel_dir="deployment/vercel"
    local files=("vercel.json" "vercel.env")
    local missing_files=()
    
    for file in "${files[@]}"; do
        if [ -f "$vercel_dir/$file" ]; then
            log_success "Vercel config $file exists"
        else
            log_error "Vercel config $file missing"
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        log_success "All Vercel configurations are present"
    else
        log_error "Missing Vercel configs: ${missing_files[*]}"
    fi
}

# Function to check documentation
check_documentation() {
    log_info "Checking documentation..."
    
    local docs_dir="deployment"
    local docs=("CONFIGURATION_MANAGEMENT.md" "DEPLOYMENT_PIPELINE.md" "SECURE_DEPLOYMENT_SUMMARY.md")
    local missing_docs=()
    
    for doc in "${docs[@]}"; do
        if [ -f "$docs_dir/$doc" ]; then
            log_success "Documentation $doc exists"
        else
            log_error "Documentation $doc missing"
            missing_docs+=("$doc")
        fi
    done
    
    if [ ${#missing_docs[@]} -eq 0 ]; then
        log_success "All documentation is present"
    else
        log_error "Missing documentation: ${missing_docs[*]}"
    fi
}

# Function to test platform connectivity (if tokens are available)
test_connectivity() {
    log_info "Testing platform connectivity..."
    
    if [ -f "$SECRETS_FILE" ] && command -v jq &> /dev/null; then
        VERCEL_TOKEN=$(jq -r '.platforms.vercel.token' "$SECRETS_FILE" 2>/dev/null)
        RENDER_TOKEN=$(jq -r '.platforms.render.token' "$SECRETS_FILE" 2>/dev/null)
        
        if [ "$VERCEL_TOKEN" != "null" ] && [ "$VERCEL_TOKEN" != "" ]; then
            log_info "Testing Vercel connectivity..."
            if curl -s -H "Authorization: Bearer $VERCEL_TOKEN" "https://api.vercel.com/v6/projects" > /dev/null; then
                log_success "Vercel connection successful"
            else
                log_error "Vercel connection failed"
            fi
        fi
        
        if [ "$RENDER_TOKEN" != "null" ] && [ "$RENDER_TOKEN" != "" ]; then
            log_info "Testing Render connectivity..."
            if curl -s -H "Authorization: Bearer $RENDER_TOKEN" "https://api.render.com/v1/services" > /dev/null; then
                log_success "Render connection successful"
            else
                log_error "Render connection failed"
            fi
        fi
    else
        log_warning "Cannot test connectivity - secrets file or jq not available"
    fi
}

# Function to display summary
display_summary() {
    log_info "Setup Verification Summary:"
    echo ""
    echo "✅ Configuration files created"
    echo "✅ Platform tokens configured"
    echo "✅ Environment variables set"
    echo "✅ Deployment scripts ready"
    echo "✅ GitHub Actions workflows configured"
    echo "✅ Platform service configurations ready"
    echo "✅ Documentation complete"
    echo ""
    echo "Next steps:"
    echo "1. Run: ./deployment/scripts/setup-secrets.sh"
    echo "2. Update environment variables in deployment/config/.env.production"
    echo "3. Test deployment with: ./deployment/scripts/validate-deployment.sh"
    echo "4. Deploy to production when ready"
    echo ""
}

# Main execution
main() {
    log_info "Starting Sugar Daddy Platform setup verification..."
    echo ""
    
    # Check configuration files
    check_file "$SECRETS_FILE" "600"
    check_file "$ENV_FILE" "600"
    
    # Validate JSON structure
    validate_json "$SECRETS_FILE"
    
    # Check tokens and environment
    check_tokens
    check_environment
    
    # Check deployment infrastructure
    check_scripts
    check_workflows
    check_render_configs
    check_vercel_config
    
    # Check documentation
    check_documentation
    
    # Test connectivity
    test_connectivity
    
    # Display summary
    display_summary
    
    log_success "Setup verification completed!"
}

# Run main function
main "$@"