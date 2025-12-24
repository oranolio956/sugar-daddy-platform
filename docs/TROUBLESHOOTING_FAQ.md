# Troubleshooting and FAQ

This document provides solutions to common issues and answers to frequently asked questions about the Sugar Daddy Platform.

## Table of Contents

1. [Common Issues](#common-issues)
2. [Development Issues](#development-issues)
3. [Build and Deployment Issues](#build-and-deployment-issues)
4. [Performance Issues](#performance-issues)
5. [Security Issues](#security-issues)
6. [Database Issues](#database-issues)
7. [API Issues](#api-issues)
8. [Testing Issues](#testing-issues)
9. [Frequently Asked Questions](#frequently-asked-questions)
10. [Getting Help](#getting-help)

## Common Issues

### Application Won't Start

**Problem**: The application fails to start with various error messages.

**Solutions**:

1. **Check Node.js Version**:
   ```bash
   node --version
   # Should be 18.0.0 or higher
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   # or for specific services
   cd backend/user-service && npm install
   cd frontend/web-app && npm install
   ```

3. **Check Environment Variables**:
   ```bash
   # Ensure .env files exist and are properly configured
   ls -la backend/user-service/.env
   ls -la frontend/web-app/.env.local
   ```

4. **Clear Cache**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

### Port Already in Use

**Problem**: Error message: "EADDRINUSE" or "Port 3000 is already in use"

**Solutions**:

1. **Find and Kill Process**:
   ```bash
   # Find process using port 3000
   lsof -ti:3000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Change Port**:
   ```bash
   # In frontend/web-app/.env.local
   PORT=3001
   
   # In backend/user-service/.env
   PORT=3002
   ```

3. **Use Different Ports**:
   ```bash
   # Start with custom port
   npm run dev -- --port 3001
   ```

### Database Connection Issues

**Problem**: Cannot connect to PostgreSQL database.

**Solutions**:

1. **Check PostgreSQL Service**:
   ```bash
   # macOS with Homebrew
   brew services list | grep postgresql
   
   # Start if not running
   brew services start postgresql
   
   # Ubuntu/Linux
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   ```

2. **Check Database URL**:
   ```bash
   # Verify DATABASE_URL in .env
   echo $DATABASE_URL
   
   # Test connection
   psql $DATABASE_URL
   ```

3. **Create Database**:
   ```bash
   createdb sugar_daddy_dev
   createdb sugar_daddy_test
   ```

4. **Run Migrations**:
   ```bash
   cd backend/user-service
   npm run migrate
   ```

## Development Issues

### TypeScript Compilation Errors

**Problem**: TypeScript errors prevent the application from starting.

**Solutions**:

1. **Check TypeScript Configuration**:
   ```bash
   # Run type checking
   npm run type-check
   
   # Fix common issues
   npm run type-check -- --noEmit
   ```

2. **Update Dependencies**:
   ```bash
   npm update typescript
   npm update @types/node @types/react
   ```

3. **Clear TypeScript Cache**:
   ```bash
   rm -rf node_modules/.cache
   rm -rf dist
   npm run build
   ```

### Hot Reload Not Working

**Problem**: Changes don't trigger automatic reload in development.

**Solutions**:

1. **Check File Watchers**:
   ```bash
   # Increase file watcher limit (Linux)
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. **Restart Development Server**:
   ```bash
   # Stop and restart
   npm run dev
   ```

3. **Check File Paths**:
   - Ensure files are in the correct directories
   - Check for typos in import statements

### ESLint/Prettier Issues

**Problem**: Code formatting and linting issues.

**Solutions**:

1. **Install Extensions**:
   - Install ESLint and Prettier VS Code extensions
   - Configure workspace settings

2. **Fix Issues**:
   ```bash
   # Fix auto-fixable issues
   npm run lint:fix
   
   # Format code
   npm run format
   ```

3. **Check Configuration**:
   ```bash
   # Verify .eslintrc.js and .prettierrc
   npx eslint --print-config src/index.ts
   ```

## Build and Deployment Issues

### Build Fails

**Problem**: Application fails to build for production.

**Solutions**:

1. **Check Dependencies**:
   ```bash
   npm install --production=false
   ```

2. **Clean Build**:
   ```bash
   # Remove build artifacts
   rm -rf dist build .next
   
   # Rebuild
   npm run build
   ```

3. **Check Environment**:
   ```bash
   # Ensure all required environment variables are set
   npm run build -- --debug
   ```

### Docker Build Issues

**Problem**: Docker container fails to build or run.

**Solutions**:

1. **Check Docker Version**:
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Clean Docker**:
   ```bash
   # Remove old containers and images
   docker system prune -a
   
   # Rebuild
   docker-compose build
   ```

3. **Check Dockerfile**:
   - Verify base image versions
   - Check COPY and RUN commands
   - Ensure proper working directory

### Environment Variables Not Loading

**Problem**: Environment variables are undefined in the application.

**Solutions**:

1. **Check File Names**:
   ```bash
   # Frontend should use .env.local
   ls -la frontend/web-app/.env*
   
   # Backend should use .env
   ls -la backend/user-service/.env*
   ```

2. **Verify Variable Names**:
   ```bash
   # Frontend variables must start with NEXT_PUBLIC_
   echo $NEXT_PUBLIC_API_URL
   
   # Backend variables are normal
   echo $DATABASE_URL
   ```

3. **Restart Development Server**:
   - Environment variables are loaded at startup
   - Restart the development server after changes

## Performance Issues

### Slow Application Startup

**Problem**: Application takes too long to start.

**Solutions**:

1. **Check Dependencies**:
   ```bash
   # Analyze bundle size
   npm run analyze
   
   # Check for heavy dependencies
   npm ls --depth=0
   ```

2. **Optimize Imports**:
   ```typescript
   // Use selective imports
   import { useState } from 'react'; // Good
   
   // Avoid importing entire libraries
   import * as React from 'react'; // Bad
   ```

3. **Enable Caching**:
   ```bash
   # Use package manager caching
   npm config set cache-max 86400000
   ```

### High Memory Usage

**Problem**: Application consumes too much memory.

**Solutions**:

1. **Check for Memory Leaks**:
   ```typescript
   // Clean up event listeners
   useEffect(() => {
     const handler = () => {};
     window.addEventListener('resize', handler);
     
     return () => window.removeEventListener('resize', handler);
   }, []);
   ```

2. **Optimize Images**:
   ```typescript
   // Use optimized images
   <OptimizedImage
     src="/images/photo.jpg"
     alt="Description"
     width={300}
     height={300}
     quality="medium"
   />
   ```

3. **Virtualize Long Lists**:
   ```typescript
   // Use react-window for long lists
   import { FixedSizeList as List } from 'react-window';
   ```

### Slow Database Queries

**Problem**: Database queries are taking too long.

**Solutions**:

1. **Add Indexes**:
   ```sql
   -- Add indexes for frequently queried fields
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_users_created_at ON users(created_at);
   ```

2. **Optimize Queries**:
   ```typescript
   // Use specific fields instead of SELECT *
   const users = await User.findAll({
     attributes: ['id', 'email', 'name'],
     where: { isActive: true }
   });
   ```

3. **Use Caching**:
   ```typescript
   // Implement Redis caching
   const cached = await redis.get(`user:${id}`);
   if (cached) return JSON.parse(cached);
   ```

## Security Issues

### CORS Errors

**Problem**: Cross-Origin Resource Sharing errors in browser.

**Solutions**:

1. **Configure CORS**:
   ```typescript
   // In backend/server.ts
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }));
   ```

2. **Check URLs**:
   ```bash
   # Ensure URLs match exactly
   echo $FRONTEND_URL
   echo $BACKEND_URL
   ```

3. **Development Proxy**:
   ```javascript
   // In next.config.js
   module.exports = {
     async rewrites() {
       return [
         {
           source: '/api/:path*',
           destination: 'http://localhost:3001/:path*',
         },
       ]
     },
   }
   ```

### Authentication Issues

**Problem**: JWT tokens not working or expiring too quickly.

**Solutions**:

1. **Check JWT Secret**:
   ```bash
   # Ensure JWT_SECRET is set and consistent
   echo $JWT_SECRET
   ```

2. **Token Expiration**:
   ```typescript
   // Check token expiration
   const decoded = jwt.decode(token);
   console.log('Expires at:', new Date(decoded.exp * 1000));
   ```

3. **Secure Cookies**:
   ```typescript
   // Set secure cookie options
   res.cookie('token', token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'strict'
   });
   ```

## Database Issues

### Migration Failures

**Problem**: Database migrations fail to run.

**Solutions**:

1. **Check Migration Files**:
   ```bash
   # Verify migration files exist
   ls -la backend/user-service/migrations/
   
   # Check migration syntax
   npm run migrate:status
   ```

2. **Reset Database**:
   ```bash
   # Drop and recreate (development only)
   npm run migrate:undo:all
   npm run migrate
   ```

3. **Manual Migration**:
   ```sql
   -- Run migration manually
   psql -d database_name -f migration_file.sql
   ```

### Data Loss Prevention

**Problem**: Accidental data deletion or corruption.

**Solutions**:

1. **Backup Strategy**:
   ```bash
   # Create backup
   pg_dump -h localhost -U username database_name > backup.sql
   
   # Restore backup
   psql -h localhost -U username database_name < backup.sql
   ```

2. **Soft Deletes**:
   ```typescript
   // Use soft deletes instead of hard deletes
   @Column({ defaultValue: false })
   isDeleted: boolean;
   ```

3. **Transaction Safety**:
   ```typescript
   const transaction = await sequelize.transaction();
   try {
     // Database operations
     await transaction.commit();
   } catch (error) {
     await transaction.rollback();
   }
   ```

## API Issues

### 404 Errors

**Problem**: API endpoints return 404 Not Found.

**Solutions**:

1. **Check Routes**:
   ```typescript
   // Verify route definitions
   app.get('/api/users', getUsers);
   
   // Check route order
   app.use('/api', apiRoutes);
   ```

2. **Base URL**:
   ```typescript
   // Check API base URL
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
   ```

3. **Middleware Order**:
   ```typescript
   // Ensure middleware is applied correctly
   app.use(express.json());
   app.use('/api', authMiddleware);
   app.use('/api', routes);
   ```

### Rate Limiting Issues

**Problem**: API requests are being rate limited unexpectedly.

**Solutions**:

1. **Check Rate Limits**:
   ```typescript
   // Review rate limiting configuration
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   ```

2. **Whitelist IPs**:
   ```typescript
   // Add development IPs to whitelist
   const isDev = process.env.NODE_ENV === 'development';
   if (isDev) {
     app.use('/api', (req, res, next) => next());
   }
   ```

## Testing Issues

### Tests Failing

**Problem**: Tests are failing unexpectedly.

**Solutions**:

1. **Check Test Environment**:
   ```bash
   # Ensure test database is set up
   npm run test:setup
   
   # Run tests with verbose output
   npm run test -- --verbose
   ```

2. **Mock Dependencies**:
   ```typescript
   // Mock external services
   jest.mock('../services/emailService');
   
   // Clear mocks between tests
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

3. **Test Database**:
   ```typescript
   // Use separate test database
   process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
   ```

### Coverage Issues

**Problem**: Test coverage is lower than expected.

**Solutions**:

1. **Check Coverage Configuration**:
   ```javascript
   // In jest.config.js
   collectCoverageFrom: [
     'src/**/*.{ts,tsx}',
     '!src/**/*.d.ts',
     '!src/**/*.test.{ts,tsx}'
   ];
   ```

2. **Add Missing Tests**:
   ```typescript
   // Test edge cases
   describe('Edge cases', () => {
     it('should handle empty input', () => {
       // Test implementation
     });
   });
   ```

3. **Ignore Non-Testable Code**:
   ```javascript
   // In jest.config.js
   coveragePathIgnorePatterns: [
     'node_modules',
     'src/config',
     'src/constants'
   ];
   ```

## Frequently Asked Questions

### General Questions

**Q: What is the recommended development workflow?**

A: Follow these steps:
1. Create a feature branch from develop
2. Make changes following coding standards
3. Write tests for new functionality
4. Run linting and type checking
5. Create a pull request with proper description
6. Address review feedback
7. Merge to develop after approval

**Q: How do I add a new dependency?**

A: 
1. Add to package.json: `npm install package-name`
2. Import and use in code
3. Update documentation if needed
4. Run tests to ensure compatibility

**Q: What are the performance requirements?**

A: 
- Page load time: < 3 seconds
- API response time: < 500ms
- Bundle size: < 2MB gzipped
- Memory usage: < 100MB per user session

### Technical Questions

**Q: How do I handle environment-specific configuration?**

A: Use environment variables with appropriate prefixes:
- Frontend: `NEXT_PUBLIC_` prefix for client-side access
- Backend: Direct environment variables
- Use `.env.example` files for documentation

**Q: What is the authentication flow?**

A: The platform uses JWT-based authentication:
1. User logs in with email/password
2. Server validates credentials and creates JWT
3. JWT is stored in HTTP-only cookie
4. Subsequent requests include JWT in cookie
5. Server validates JWT on each request

**Q: How do I implement real-time features?**

A: Use WebSocket connections:
1. Backend: Socket.IO server
2. Frontend: Socket.IO client
3. Implement event handlers for real-time updates
4. Handle connection states and reconnections

**Q: What database migrations strategy should I use?**

A: Follow these guidelines:
1. Create migration files for schema changes
2. Use Sequelize migrations for ORM changes
3. Test migrations on development database first
4. Always create rollback scripts
5. Document breaking changes

### Security Questions

**Q: How do I handle sensitive data?**

A: 
1. Never log sensitive information
2. Use environment variables for secrets
3. Encrypt sensitive data in database
4. Use HTTPS in production
5. Implement proper access controls

**Q: What security headers should I use?**

A: Implement these headers:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- X-XSS-Protection

**Q: How do I prevent common vulnerabilities?**

A: 
1. Use parameterized queries to prevent SQL injection
2. Sanitize user input to prevent XSS
3. Implement CSRF protection for forms
4. Use rate limiting to prevent brute force attacks
5. Validate all user input on server side

## Getting Help

### Documentation

- [Developer Setup Guide](./DEVELOPER_SETUP_GUIDE.md)
- [Code Style Guidelines](./CODE_STYLE_GUIDELINES.md)
- [Component Documentation](./COMPONENT_DOCUMENTATION.md)
- [API Documentation](./openapi.yaml)

### Code References

- **Frontend**: `frontend/web-app/src/`
- **Backend**: `backend/user-service/src/`
- **Tests**: `__tests__/` directories
- **Configuration**: Root configuration files

### Team Communication

- **Slack**: #development-help channel
- **GitHub**: Create issues for bugs and feature requests
- **Code Reviews**: Use pull request reviews for feedback
- **Standups**: Daily standup meetings for blockers

### Emergency Contacts

For critical production issues:
- **On-call Developer**: [Contact information]
- **DevOps Team**: [Contact information]
- **Security Team**: [Contact information]

### Contributing

To contribute to the project:
1. Fork the repository
2. Create a feature branch
3. Follow coding standards
4. Write tests
5. Create pull request
6. Address review feedback

For more information, see the [CONTRIBUTING.md](./CONTRIBUTING.md) file.

This troubleshooting guide is a living document. If you encounter issues not covered here, please document the solution and update this guide for future reference.