# Sugar Daddy Platform - Deployment Pipeline

This document provides comprehensive instructions for deploying the Sugar Daddy Platform to production using Vercel and Render.

## Overview

The deployment pipeline consists of:
- **Frontend**: Deployed on Vercel
- **Backend**: 6 microservices deployed on Render
- **Database**: PostgreSQL and Redis on Render
- **Automation**: GitHub Actions workflows
- **Configuration**: Secure token and environment management

## Prerequisites

### Required Tools
- Node.js 18+ with pnpm
- Docker (for local testing)
- GitHub CLI (optional)
- jq (for JSON processing)
- openssl (for encryption)

### Platform Accounts
- [Vercel account](https://vercel.com/) with project access
- [Render account](https://render.com/) with service creation permissions

### GitHub Repository
- Repository with proper secrets configured
- GitHub Actions enabled
- Branch protection rules configured

## Initial Setup

### 1. Configure Platform Tokens

Run the secure setup script:
```bash
chmod +x deployment/scripts/setup-secrets.sh
./deployment/scripts/setup-secrets.sh
```

This script will:
- Create secure configuration files
- Validate platform connectivity
- Set up environment variables
- Create backups

### 2. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

**Vercel Configuration**:
```
VERCEL_TOKEN=MWPFNVKncsugu9Yxy7yrNhUJ
VERCEL_ORG_ID=sugar-daddy-platform
VERCEL_PROJECT_ID=sugar-daddy-platform
```

**Render Configuration**:
```
RENDER_TOKEN=rnd_u29oGb92ppRQywF9QyJbtJz2a5I1
```

**Environment Variables**:
```
DATABASE_URL=postgresql://user:password@db-host:5432/sugar_daddy_prod
REDIS_URL=redis://redis-host:6379
JWT_SECRET=your-production-jwt-secret
ENCRYPTION_KEY=your-production-encryption-key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
SENDGRID_API_KEY=SG.your_sendgrid_api_key
```

### 3. Configure Environment Variables

Edit `deployment/config/.env.production` with your specific configuration:
```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@your-db-host:5432/sugar_daddy_prod
REDIS_URL=redis://your-redis-host:6379

# Application URLs
API_BASE_URL=https://api.your-domain.com
FRONTEND_URL=https://your-domain.vercel.app

# Security Keys
JWT_SECRET=your-production-jwt-secret-key
ENCRYPTION_KEY=your-production-encryption-key

# Third-party Services
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
SENDGRID_API_KEY=SG.your_sendgrid_api_key
CLOUDINARY_URL=cloudinary://your_cloudinary_config
```

## Deployment Process

### Automatic Deployment

The deployment pipeline is triggered automatically when you push to the main branch:

1. **Frontend Deployment** (Vercel):
   - Builds and deploys the Next.js application
   - Syncs environment variables
   - Updates CDN and SSL certificates

2. **Backend Deployment** (Render):
   - Deploys all 6 microservices
   - Updates environment variables
   - Validates service health

### Manual Deployment

#### Deploy Frontend Only
```bash
./deployment/scripts/deploy-vercel.sh
```

#### Deploy Backend Only
```bash
./deployment/scripts/deploy-render.sh
```

#### Deploy Everything
```bash
# Deploy backend first
./deployment/scripts/deploy-render.sh

# Then deploy frontend
./deployment/scripts/deploy-vercel.sh
```

## Service Configuration

### Vercel Frontend Configuration

**Project Settings**:
- Framework: Next.js
- Build Command: `pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`

**Environment Variables**:
- `NEXT_PUBLIC_API_URL`: API base URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe frontend key
- `NEXT_PUBLIC_SENTRY_DSN`: Sentry frontend DSN

**Custom Domains**:
- Primary: `your-domain.com`
- API: `api.your-domain.com`

### Render Backend Configuration

#### API Gateway
- **Service Type**: Web Service
- **Runtime**: Node.js
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`

#### Microservices
Each microservice follows the same pattern:
- **Service Type**: Web Service
- **Runtime**: Node.js
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`

#### Database Configuration
- **PostgreSQL**: Primary database for user data
- **Redis**: Caching and session storage
- **Connection Strings**: Set via environment variables

## Environment Variables Reference

### Required Variables

**Database**:
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://host:6379
```

**Authentication**:
```bash
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key
```

**Third-party Services**:
```bash
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
SENDGRID_API_KEY=SG.your_sendgrid_api_key
CLOUDINARY_URL=cloudinary://your_cloudinary_config
```

**Monitoring**:
```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
DATADOG_API_KEY=your-datadog-api-key
```

### Optional Variables

**Feature Flags**:
```bash
ENABLE_PREMIUM_FEATURES=true
ENABLE_SOCIAL_FEATURES=true
ENABLE_ADVANCED_MATCHING=true
```

**Debugging**:
```bash
LOG_LEVEL=info
DEBUG_MODE=false
```

## Health Checks and Monitoring

### Health Check Endpoints

**Frontend**:
- URL: `https://your-domain.vercel.app/api/health`
- Expected Response: `{"status": "ok", "service": "frontend"}`

**Backend**:
- URL: `https://api.your-domain.com/health`
- Expected Response: `{"status": "ok", "services": ["user", "matching", "messaging", "payment", "notification"]}`

### Monitoring Setup

1. **Sentry Integration**:
   - Frontend and backend error tracking
   - Performance monitoring
   - Release tracking

2. **Datadog Integration**:
   - Infrastructure monitoring
   - Application metrics
   - Alerting and dashboards

3. **Custom Metrics**:
   - User registration rates
   - Match success rates
   - Payment processing times

## Troubleshooting

### Common Deployment Issues

#### Frontend Deployment Failures
**Symptoms**: Build errors, missing environment variables
**Solutions**:
- Check Vercel logs in dashboard
- Verify environment variables are set
- Ensure all dependencies are in package.json

#### Backend Service Failures
**Symptoms**: Service crashes, connection errors
**Solutions**:
- Check Render service logs
- Verify database connections
- Check environment variable syntax

#### Database Connection Issues
**Symptoms**: Connection timeouts, authentication errors
**Solutions**:
- Verify DATABASE_URL format
- Check database service status
- Ensure proper network access

### Debug Commands

#### Check Service Status
```bash
# Check Vercel deployment status
vercel --token $VERCEL_TOKEN status

# Check Render service status
curl -H "Authorization: Bearer $RENDER_TOKEN" "https://api.render.com/v1/services"
```

#### View Logs
```bash
# Vercel logs
vercel --token $VERCEL_TOKEN logs

# Render logs (replace SERVICE_ID)
curl -H "Authorization: Bearer $RENDER_TOKEN" "https://api.render.com/v1/services/SERVICE_ID/logs"
```

#### Validate Configuration
```bash
./deployment/scripts/validate-deployment.sh
```

## Rollback Procedures

### Frontend Rollback (Vercel)
1. Go to Vercel dashboard
2. Navigate to project deployments
3. Select previous successful deployment
4. Click "Rollback"

### Backend Rollback (Render)
1. Go to Render dashboard
2. Navigate to service settings
3. Select previous deployment
4. Click "Rollback"

### Database Rollback
1. Use Render's database backup feature
2. Restore from latest backup
3. Verify data integrity

## Security Considerations

### Token Security
- Store tokens in GitHub Secrets
- Rotate tokens regularly
- Use least privilege principle

### Environment Variables
- Never commit secrets to repository
- Use different values for each environment
- Encrypt sensitive data

### SSL/TLS
- Automatic SSL on Vercel
- Custom certificates on Render
- HSTS headers enabled

## Performance Optimization

### Frontend Optimization
- Image optimization via Vercel
- CDN caching
- Bundle splitting
- Lazy loading

### Backend Optimization
- Database connection pooling
- Redis caching
- Load balancing
- Horizontal scaling

### Monitoring Performance
- Page load times
- API response times
- Database query performance
- Resource utilization

## Maintenance

### Regular Tasks
- Monitor deployment logs
- Check service health
- Update dependencies
- Review security settings

### Monthly Tasks
- Rotate API tokens
- Review backup integrity
- Update monitoring alerts
- Performance review

### Quarterly Tasks
- Security audit
- Dependency updates
- Performance optimization
- Documentation review

## Support

For deployment issues:
1. Check troubleshooting section
2. Review deployment logs
3. Verify configuration files
4. Contact DevOps team

## Version History

- **v1.0.0**: Initial deployment pipeline setup
- **v1.1.0**: Added automated health checks
- **v1.2.0**: Enhanced monitoring and alerting
- **v1.3.0**: Improved rollback procedures