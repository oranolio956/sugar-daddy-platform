# Developer Setup Guide

This guide provides comprehensive instructions for setting up the Sugar Daddy Platform development environment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Development Environment Setup](#development-environment-setup)
4. [Project Structure](#project-structure)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Code Quality](#code-quality)
8. [Debugging](#debugging)
9. [Common Issues](#common-issues)
10. [Development Workflow](#development-workflow)

## Prerequisites

### Required Software

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Git**: Version 2.30.0 or higher
- **Docker**: Version 20.10.0 or higher (optional, for containerized development)
- **PostgreSQL**: Version 13 or higher (for local database)

### Recommended Tools

- **IDE**: VS Code with recommended extensions
- **Terminal**: Modern terminal with Git support
- **Browser**: Chrome/Firefox with developer tools

### VS Code Extensions

Install these recommended extensions for optimal development experience:

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-eslint",
    "streetsidesoftware.code-spell-checker",
    "ms-vscode.vscode-github-issue-notebooks",
    "github.vscode-pull-request-github"
  ]
}
```

## System Requirements

### Minimum Requirements

- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB available space
- **CPU**: 2 cores minimum, 4 cores recommended

### Recommended Requirements

- **OS**: Latest stable version
- **RAM**: 16GB or more
- **Storage**: SSD with 20GB+ available space
- **CPU**: 4 cores or more

## Development Environment Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-org/sugar-daddy-platform.git
cd sugar-daddy-platform

# Install dependencies
npm install
```

### 2. Environment Configuration

Copy the example environment files and configure them:

```bash
# Backend environment
cp backend/user-service/.env.example backend/user-service/.env

# Frontend environment
cp frontend/web-app/.env.example frontend/web-app/.env.local
```

#### Backend Environment Variables

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/sugar_daddy_dev"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
CSRF_SECRET="your-csrf-secret-key"

# Security
ENCRYPTION_KEY="your-32-character-encryption-key"

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100

# Email (for development)
EMAIL_HOST="localhost"
EMAIL_PORT=587
EMAIL_USER="dev@example.com"
EMAIL_PASS="password"

# Development Settings
NODE_ENV="development"
DEBUG="true"
```

#### Frontend Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"

# Authentication
NEXT_PUBLIC_JWT_SECRET="your-jwt-secret"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true

# Development
NEXT_PUBLIC_DEBUG_MODE=true
```

### 3. Database Setup

#### Option A: Local PostgreSQL

```bash
# Start PostgreSQL service
# On macOS with Homebrew:
brew services start postgresql

# On Ubuntu:
sudo systemctl start postgresql

# Create database
createdb sugar_daddy_dev
createdb sugar_daddy_test

# Run migrations
cd backend/user-service
npm run migrate
```

#### Option B: Docker Compose

```bash
# Start database with Docker
docker-compose up -d postgres

# Run migrations
cd backend/user-service
npm run migrate
```

### 4. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend/web-app
npm install

# Install backend dependencies
cd ../user-service
npm install

# Install AI/ML dependencies (if needed)
cd ../../ai-ml/content-moderation
npm install
```

## Project Structure

```
sugar-daddy-platform/
├── frontend/                    # Frontend applications
│   ├── web-app/                # Main React/Next.js application
│   │   ├── src/                # Source code
│   │   ├── public/             # Static assets
│   │   ├── styles/             # CSS and styling
│   │   ├── components/         # React components
│   │   ├── pages/              # Next.js pages
│   │   ├── lib/                # Utility libraries
│   │   ├── hooks/              # Custom hooks
│   │   ├── contexts/           # React contexts
│   │   └── __tests__/          # Frontend tests
│   ├── mobile-app/             # React Native mobile app
│   └── pwa/                    # Progressive Web App
│
├── backend/                     # Backend services
│   ├── user-service/           # User management service
│   │   ├── src/                # Source code
│   │   ├── models/             # Database models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # Express middleware
│   │   ├── utils/              # Utility functions
│   │   └── __tests__/          # Backend tests
│   ├── api-gateway/            # API gateway service
│   ├── messaging-service/      # Real-time messaging
│   ├── notification-service/   # Notification system
│   └── payment-service/        # Payment processing
│
├── ai-ml/                       # AI and Machine Learning
│   ├── content-moderation/     # Content filtering
│   ├── fraud-detection/        # Fraud prevention
│   └── matching-engine/        # Match algorithm
│
├── deployment/                  # Deployment configurations
│   ├── docker/                 # Docker configurations
│   ├── kubernetes/             # Kubernetes manifests
│   ├── terraform/              # Infrastructure as Code
│   └── monitoring/             # Monitoring setup
│
├── docs/                       # Documentation
│   ├── openapi.yaml           # API specifications
│   ├── COMPONENT_DOCUMENTATION.md
│   └── DEVELOPER_SETUP_GUIDE.md
│
└── .github/                    # GitHub workflows
    └── workflows/              # CI/CD pipelines
```

## Running the Application

### Development Mode

#### Start All Services

```bash
# Method 1: Using npm scripts (recommended)
npm run dev

# Method 2: Start services individually
# Terminal 1: Start backend
cd backend/user-service
npm run dev

# Terminal 2: Start frontend
cd frontend/web-app
npm run dev

# Terminal 3: Start other services as needed
cd backend/api-gateway
npm run dev
```

#### Using Docker Compose

```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Gateway**: http://localhost:3002
- **Database**: localhost:5432
- **Redis**: localhost:6379 (if used)

### Hot Reloading

Both frontend and backend support hot reloading:

- **Frontend**: Changes to React components, styles, and pages trigger automatic reload
- **Backend**: Changes to TypeScript files trigger automatic restart
- **Database**: Schema changes require migration

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run frontend tests
cd frontend/web-app
npm test

# Run backend tests
cd backend/user-service
npm test

# Run specific test file
npm test -- --testPathPattern=auth

# Run tests with coverage
npm run test:coverage
```

### Test Commands

```bash
# Frontend testing
npm run test                    # Run tests
npm run test:watch             # Watch mode
npm run test:coverage          # With coverage
npm run test:e2e               # End-to-end tests

# Backend testing
npm run test                   # Run tests
npm run test:watch            # Watch mode
npm run test:coverage         # With coverage
npm run test:integration      # Integration tests

# Linting and type checking
npm run lint                   # ESLint
npm run type-check            # TypeScript
npm run format                # Prettier
```

### Test Structure

```
__tests__/
├── unit/                     # Unit tests
│   ├── components/           # Component tests
│   ├── services/             # Service tests
│   └── utils/                # Utility tests
├── integration/              # Integration tests
│   ├── api/                  # API endpoint tests
│   └── database/             # Database tests
└── e2e/                      # End-to-end tests
    ├── auth-flow.spec.ts     # Authentication tests
    └── user-flow.spec.ts     # User journey tests
```

## Code Quality

### ESLint Configuration

The project uses ESLint with TypeScript and React rules:

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    // Custom rules
    '@typescript-eslint/no-unused-vars': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Pre-commit Hooks

The project uses Husky for pre-commit hooks:

```bash
# Install Husky
npm install --save-dev husky

# Set up hooks
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run type-check && npm run test"
```

### Code Quality Commands

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check

# Format code
npm run format

# Check formatting
npm run format:check
```

## Debugging

### Frontend Debugging

#### React Developer Tools

Install React Developer Tools browser extension for:
- Component inspection
- State debugging
- Performance profiling
- Props inspection

#### Next.js Debugging

```javascript
// Enable debug mode
NEXT_PUBLIC_DEBUG_MODE=true

// Use React DevTools Profiler
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log({ id, phase, actualDuration });
}

<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>
```

#### Browser Developer Tools

- **Network Tab**: Monitor API calls
- **Console**: Check for errors and logs
- **Application Tab**: Inspect localStorage, cookies
- **Performance Tab**: Profile performance issues

### Backend Debugging

#### Node.js Inspector

```bash
# Start with inspector
node --inspect src/index.ts

# Or with nodemon
nodemon --inspect src/index.ts
```

#### Logging

The project uses structured logging:

```typescript
import { logger } from './utils/logger';

// Log levels
logger.debug('Debug message');
logger.info('Information message');
logger.warn('Warning message');
logger.error('Error message', error);

// Structured logging
logger.info('User login', {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString()
});
```

#### Database Debugging

```bash
# Connect to database
psql -h localhost -U username -d sugar_daddy_dev

# Run queries
SELECT * FROM users WHERE email = 'test@example.com';

# Check migrations
SELECT * FROM schema_migrations ORDER BY version DESC;
```

### Common Debugging Scenarios

#### CORS Issues

```typescript
// Check CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

#### Authentication Issues

```typescript
// Check JWT token
console.log('Token:', req.headers.authorization);

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

#### Database Connection Issues

```typescript
// Test database connection
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query('SELECT NOW()')
  .then(result => console.log('Database connected'))
  .catch(err => console.error('Database error:', err));
```

## Common Issues

### Node.js Version Issues

**Problem**: Incompatible Node.js version
**Solution**:
```bash
# Check Node.js version
node --version

# Use nvm to switch versions
nvm use 18
# or
nvm install 18
nvm use 18
```

### Port Already in Use

**Problem**: Port 3000 or 3001 already occupied
**Solution**:
```bash
# Find process using port
lsof -ti:3000

# Kill process
kill -9 <PID>

# Or change port in .env
NEXT_PUBLIC_PORT=3001
PORT=3002
```

### Database Connection Issues

**Problem**: Cannot connect to PostgreSQL
**Solution**:
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql
# or
sudo systemctl status postgresql

# Start PostgreSQL
brew services start postgresql
# or
sudo systemctl start postgresql
```

### Missing Dependencies

**Problem**: Module not found errors
**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Or install specific dependency
npm install <package-name>
```

### TypeScript Errors

**Problem**: TypeScript compilation errors
**Solution**:
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Fix type errors
npm run type-check

# Ignore specific errors (temporarily)
// @ts-ignore
```

## Development Workflow

### Feature Development

1. **Create Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow coding standards
   - Write tests for new functionality
   - Update documentation if needed

3. **Test Changes**
   ```bash
   npm run lint
   npm run type-check
   npm test
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Follow PR template
   - Request code review
   - Address review feedback

### Code Review Process

#### PR Requirements

- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] Performance impact considered

#### Review Checklist

- [ ] Code is readable and maintainable
- [ ] Tests cover edge cases
- [ ] No breaking changes (unless intentional)
- [ ] Security best practices followed
- [ ] Performance optimized

### Git Workflow

#### Branch Naming

- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical fixes
- `docs/documentation-update` - Documentation
- `refactor/code-improvement` - Code refactoring

#### Commit Messages

Follow Conventional Commits format:

```
<type>: <description>

[optional body]

[optional footer]
```

Examples:
- `feat: add user registration`
- `fix: resolve login timeout issue`
- `docs: update API documentation`
- `refactor: improve error handling`

#### Pull Request Template

```markdown
## Summary
Brief description of changes

## Test plan
- [ ] Test case 1
- [ ] Test case 2
- [ ] Edge case testing

## Documentation
- [ ] Code comments added
- [ ] Documentation updated
- [ ] API docs updated

## Screenshots (if applicable)
```

This comprehensive setup guide ensures all developers can quickly get up and running with the Sugar Daddy Platform development environment.