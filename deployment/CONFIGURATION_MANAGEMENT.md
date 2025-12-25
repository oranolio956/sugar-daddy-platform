# Sugar Daddy Platform - Configuration Management

This document outlines the configuration management system for the Sugar Daddy Platform deployment pipeline.

## Overview

The configuration management system provides secure storage and management of deployment credentials, environment variables, and platform configurations for both Vercel and Render platforms.

## Directory Structure

```
deployment/
├── config/
│   ├── secrets.json          # Encrypted platform tokens and secrets
│   ├── .env.production       # Production environment variables
│   └── backups/              # Configuration backups
├── scripts/
│   ├── setup-secrets.sh      # Secure setup script
│   ├── deploy-render.sh      # Render deployment script
│   ├── deploy-vercel.sh      # Vercel deployment script
│   └── validate-deployment.sh # Deployment validation script
└── documentation/
    └── CONFIGURATION_MANAGEMENT.md
```

## Configuration Files

### 1. secrets.json

**Purpose**: Secure storage of platform tokens and deployment secrets.

**Location**: `deployment/config/secrets.json`

**Structure**:
```json
{
  "platforms": {
    "vercel": {
      "token": "MWPFNVKncsugu9Yxy7yrNhUJ",
      "project_id": "sugar-daddy-platform",
      "org_id": "sugar-daddy-platform",
      "environment": "production",
      "last_connected": "2024-01-01T00:00:00Z",
      "permissions_verified": true
    },
    "render": {
      "token": "rnd_u29oGb92ppRQywF9QyJbtJz2a5I1",
      "service_id": "sugar-daddy-platform",
      "environment": "production",
      "last_connected": "2024-01-01T00:00:00Z",
      "permissions_verified": true
    }
  },
  "security": {
    "encryption_enabled": false,
    "file_permissions": "600",
    "backup_required": true,
    "last_backup": "2024-01-01T00:00:00Z"
  },
  "deployment": {
    "auto_deploy": true,
    "webhook_secret": "sugar-daddy-webhook-secret-2024",
    "health_check_enabled": true,
    "monitoring_enabled": true
  }
}
```

**Security**: File permissions set to 600 (owner read/write only)

### 2. .env.production

**Purpose**: Production environment variables for all services.

**Location**: `deployment/config/.env.production`

**Key Variables**:
- Platform tokens (VERCEL_TOKEN, RENDER_API_KEY)
- Database connection strings
- API endpoints and URLs
- Security keys and secrets
- Third-party service credentials
- Feature flags and configuration

## Setup Process

### Initial Setup

1. **Run the setup script**:
   ```bash
   chmod +x deployment/scripts/setup-secrets.sh
   ./deployment/scripts/setup-secrets.sh
   ```

2. **Verify connectivity**:
   The script will automatically test connectivity to both platforms.

3. **Update environment variables**:
   Edit `deployment/config/.env.production` with your specific configuration.

### Manual Configuration

If you prefer manual setup:

1. **Create secrets file**:
   ```bash
   mkdir -p deployment/config
   cp deployment/config/secrets.json.template deployment/config/secrets.json
   chmod 600 deployment/config/secrets.json
   ```

2. **Add tokens**:
   ```bash
   jq '.platforms.vercel.token = "your-vercel-token"' deployment/config/secrets.json > temp.json && mv temp.json deployment/config/secrets.json
   jq '.platforms.render.token = "your-render-token"' deployment/config/secrets.json > temp.json && mv temp.json deployment/config/secrets.json
   ```

3. **Create environment file**:
   ```bash
   cp deployment/config/.env.production.template deployment/config/.env.production
   chmod 600 deployment/config/.env.production
   ```

## Security Measures

### File Permissions
- `secrets.json`: 600 (owner read/write only)
- `.env.production`: 600 (owner read/write only)
- `config/` directory: 700 (owner access only)

### Backup Strategy
- Automatic backups created during setup
- Backups stored in `deployment/config/backups/`
- Old backups automatically cleaned up (keeps last 5)

### Token Management
- Tokens stored in encrypted format (optional)
- Regular token rotation recommended
- Audit trail of token usage

## Platform Integration

### Vercel Integration

**Configuration**:
- Project ID: `sugar-daddy-platform`
- Organization ID: `sugar-daddy-platform`
- Environment: `production`

**Environment Variables**:
```bash
VERCEL_TOKEN=MWPFNVKncsugu9Yxy7yrNhUJ
VERCEL_PROJECT_ID=sugar-daddy-platform
VERCEL_ORG_ID=sugar-daddy-platform
```

**Deployment Process**:
1. Frontend deployment via Vercel CLI
2. Environment variables synced from config
3. Automatic SSL certificate management
4. CDN and edge network optimization

### Render Integration

**Configuration**:
- Service ID: `sugar-daddy-platform`
- Environment: `production`

**Environment Variables**:
```bash
RENDER_TOKEN=rnd_u29oGb92ppRQywF9QyJbtJz2a5I1
RENDER_SERVICE_ID=sugar-daddy-platform
```

**Services Deployed**:
1. API Gateway
2. User Service
3. Matching Service
4. Messaging Service
5. Payment Service
6. Notification Service

**Database Configuration**:
- PostgreSQL: Primary database
- Redis: Caching and session storage

## Deployment Automation

### GitHub Actions Integration

**Render Deployment** (`.github/workflows/deploy-render.yml`):
- Triggers on push to main branch
- Deploys all 6 microservices
- Validates deployment health
- Sends notifications on success/failure

**Vercel Deployment** (`.github/workflows/deploy-vercel.yml`):
- Triggers on push to main branch
- Deploys frontend application
- Validates deployment health
- Sends notifications on success/failure

### Webhook Configuration

**Webhook Secret**: Generated automatically during setup
**Endpoint**: `/api/webhooks/deployment`
**Events**: Deployment success/failure notifications

## Monitoring and Validation

### Health Checks

**Frontend Health Check**:
- URL: `https://sugar-daddy-platform.vercel.app/api/health`
- Expected Response: `{"status": "ok", "service": "frontend"}`

**Backend Health Check**:
- URL: `https://api.sugar-daddy-platform.com/health`
- Expected Response: `{"status": "ok", "services": ["user", "matching", "messaging", "payment", "notification"]}`

### Validation Script

Run validation after deployment:
```bash
./deployment/scripts/validate-deployment.sh
```

**Validation Checks**:
- Platform connectivity
- Service availability
- Database connections
- Environment variables
- SSL certificates

## Troubleshooting

### Common Issues

1. **Token Authentication Failed**
   - Verify tokens in `secrets.json`
   - Check platform permissions
   - Regenerate tokens if necessary

2. **Environment Variables Missing**
   - Check `.env.production` file
   - Verify file permissions
   - Ensure all required variables are set

3. **Deployment Failures**
   - Check platform logs
   - Verify resource limits
   - Check dependency versions

### Recovery Procedures

1. **Restore from Backup**:
   ```bash
   tar -xzf deployment/config/backups/config_backup_YYYYMMDD_HHMMSS.tar.gz -C deployment/config/
   ```

2. **Regenerate Tokens**:
   - Vercel: https://vercel.com/settings/tokens
   - Render: https://dashboard.render.com/tokens

3. **Re-run Setup**:
   ```bash
   ./deployment/scripts/setup-secrets.sh
   ```

## Best Practices

1. **Regular Backups**: Run setup script weekly to create backups
2. **Token Rotation**: Rotate tokens every 90 days
3. **Environment Validation**: Always validate before production deployment
4. **Monitoring**: Set up alerts for deployment failures
5. **Documentation**: Keep this document updated with any changes

## Support

For configuration management issues:
1. Check the troubleshooting section
2. Review deployment logs
3. Verify platform connectivity
4. Contact the DevOps team

## Version History

- **v1.0.0**: Initial configuration management setup
- **v1.1.0**: Added encryption support
- **v1.2.0**: Enhanced backup and recovery procedures