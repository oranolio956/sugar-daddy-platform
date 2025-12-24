# Sugar Daddy Platform

![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)
![Microservices](https://img.shields.io/badge/Microservices-Architecture-orange.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

A modern, secure, and scalable sugar daddy/sugar baby platform built with a microservices architecture. This platform provides a premium experience for users seeking mutually beneficial relationships with advanced features, robust security, and comprehensive compliance.

## 🚀 Features

### Core Functionality
- **Advanced User Registration & Verification** - Multi-step verification with document upload and AI-powered validation
- **AI-Powered Matching Engine** - Intelligent matching based on preferences, personality profiles, and compatibility scores
- **Real-time Messaging** - WebSocket-based chat with media sharing, read receipts, and message encryption
- **Premium Subscription System** - Tiered membership with virtual currency, gift system, and advanced features
- **Secure Payment Processing** - Stripe integration with subscription management and transaction history
- **Comprehensive Admin Dashboard** - Full control over users, content moderation, analytics, and system monitoring

### Advanced Features
- **AI Content Moderation** - Automated detection of inappropriate content using machine learning
- **Fraud Detection System** - Real-time fraud prevention and suspicious activity monitoring
- **Advanced Search & Filters** - Granular search with location-based filtering and compatibility matching
- **Gift & Virtual Currency System** - In-app gifting with virtual currency management
- **Two-Factor Authentication** - Enhanced security with TOTP and backup codes
- **GDPR Compliance** - Full data protection and user privacy controls

### Security & Compliance
- **End-to-End Encryption** - Messages and sensitive data encryption
- **Rate Limiting & DDoS Protection** - API protection and abuse prevention
- **Content Security Policy** - XSS and injection attack prevention
- **Regular Security Scanning** - Automated vulnerability detection and remediation
- **Comprehensive Logging** - Audit trails and security monitoring

## 🏗️ Architecture

### Microservices Design
The platform is built using a microservices architecture for scalability, maintainability, and fault tolerance:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Load Balancer │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (Nginx)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
        ┌─────────────────────────────────────────────────────────┐
        │                    Microservices                        │
        ├─────────────────┬─────────────────┬─────────────────┤
        │   User Service  │  Matching Svc   │ Messaging Svc   │
        │   (Auth, Prof)  │   (AI Matching) │   (Real-time)   │
        └─────────────────┴─────────────────┴─────────────────┘
                                │
                                ▼
        ┌─────────────────────────────────────────────────────────┐
        │                      Databases                          │
        ├─────────────────┬─────────────────┬─────────────────┤
        │   PostgreSQL    │     Redis       │   MongoDB       │
        │   (Users, Data) │ (Cache, Sessions)│ (Analytics)     │
        └─────────────────┴─────────────────┴─────────────────┘
```

### Technology Stack

#### Frontend
- **Next.js 14+** - React framework with server-side rendering
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **React Query** - Data fetching and state management
- **Socket.IO** - Real-time communication

#### Backend Services
- **Node.js 20+** - Runtime environment
- **TypeScript** - Type-safe backend development
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **Jest** - Testing framework

#### Databases
- **PostgreSQL** - Primary database (users, profiles, transactions)
- **Redis** - Caching and session storage
- **MongoDB** - Analytics and logging

#### AI/ML Services
- **TensorFlow.js** - Machine learning models
- **Natural Language Processing** - Content analysis and matching
- **Computer Vision** - Image analysis and moderation

#### Infrastructure
- **Docker** - Containerization
- **Kubernetes** - Container orchestration
- **AWS/GCP** - Cloud infrastructure
- **NGINX** - Load balancing and reverse proxy

## 📋 Prerequisites

- **Node.js 20+** - [Download Node.js](https://nodejs.org/)
- **npm 8+** or **yarn** - Package manager
- **Docker & Docker Compose** - For local development
- **PostgreSQL** - Database server
- **Redis** - Cache server

## 🛠️ Installation

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd sugar-daddy-platform
   ```

2. **Install dependencies:**
   ```bash
   npm run setup
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development environment:**
   ```bash
   # Using Docker Compose (recommended)
   docker-compose up -d
   
   # Or run services individually
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:4000

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/sugar_daddy"
REDIS_URL="redis://localhost:6379"

# API Gateway
API_GATEWAY_PORT=4000
JWT_SECRET="your-super-secret-jwt-key"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_WS_URL="ws://localhost:4000"

# Services
USER_SERVICE_URL="http://localhost:5001"
MATCHING_SERVICE_URL="http://localhost:5002"
MESSAGING_SERVICE_URL="http://localhost:5003"
PAYMENT_SERVICE_URL="http://localhost:5004"
NOTIFICATION_SERVICE_URL="http://localhost:5005"

# External Services
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
SENDGRID_API_KEY="your-sendgrid-api-key"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"

# AI Services
OPENAI_API_KEY="your-openai-api-key"
CLOUDINARY_URL="your-cloudinary-url"
```

## 🚀 Deployment

### Render Deployment

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial deployment setup"
   git push origin main
   ```

2. **Configure Render:**
   - Connect your GitHub repository
   - Set up environment variables in Render dashboard
   - Configure services using the provided YAML files in `deployment/render/`

3. **Deploy:**
   - Render will automatically deploy when changes are pushed to main branch
   - Monitor deployment status in the Render dashboard

### Vercel Deployment

1. **Frontend Deployment:**
   - Connect your GitHub repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy frontend automatically on git push

2. **Backend Services:**
   - Use Render or AWS for backend microservices
   - Configure API endpoints in frontend environment variables

### Kubernetes Deployment

For production deployments:

```bash
# Apply Kubernetes manifests
kubectl apply -f deployment/kubernetes/

# Monitor deployment
kubectl get pods -w

# Access services
kubectl port-forward service/api-gateway 4000:4000
```

## 📚 API Documentation

### Authentication

All API endpoints require authentication via JWT tokens.

**Login:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### User Management

**Get User Profile:**
```http
GET /api/users/profile
Authorization: Bearer <token>
```

**Update Profile:**
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "bio": "Software developer",
  "location": "New York, NY"
}
```

### Matching System

**Get Matches:**
```http
GET /api/matches?limit=10&offset=0
Authorization: Bearer <token>
```

**Like User:**
```http
POST /api/matches/like
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetUserId": "target-user-id"
}
```

### Messaging

**Get Conversations:**
```http
GET /api/messages/conversations
Authorization: Bearer <token>
```

**Send Message:**
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "user-id",
  "content": "Hello, how are you?"
}
```

For complete API documentation, see the OpenAPI specification in `docs/openapi.yaml`.

## 🔧 Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific service tests
npm run test --prefix backend/user-service
npm run test --prefix frontend/web-app
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

### Adding New Services

1. Create service directory in `backend/`
2. Initialize package.json with service dependencies
3. Implement service logic following existing patterns
4. Add service to Docker Compose configuration
5. Update API Gateway routing
6. Add service to Kubernetes manifests

## 📊 Monitoring & Analytics

### Health Checks

Each service provides health check endpoints:

```http
GET /health
```

### Metrics

Services expose Prometheus metrics at `/metrics` endpoint.

### Logging

Structured logging is implemented across all services. Logs can be viewed using:

```bash
# View Docker logs
docker-compose logs -f

# View Kubernetes logs
kubectl logs -f deployment/user-service
```

## 🔒 Security

### Best Practices

- Always use HTTPS in production
- Rotate API keys and secrets regularly
- Implement rate limiting on all endpoints
- Use strong, unique passwords for all services
- Regularly update dependencies

### Security Headers

The API Gateway implements security headers including:
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (HSTS)

### Data Protection

- All sensitive data is encrypted at rest and in transit
- Passwords are hashed using bcrypt
- JWT tokens have configurable expiration times
- Regular security audits and vulnerability scanning

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows our linting and formatting standards.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [Stripe](https://stripe.com/) - Payment processing
- [SendGrid](https://sendgrid.com/) - Email service

## 📞 Support

For support and questions:

- **GitHub Issues** - Bug reports and feature requests
- **Documentation** - Check the docs directory for detailed guides
- **Email** - support@sugardaddyplatform.com

---

**Made with ❤️ by the Sugar Daddy Platform Team**

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Contributors](https://img.shields.io/github/contributors/your-org/sugar-daddy-platform)](https://github.com/your-org/sugar-daddy-platform/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/your-org/sugar-daddy-platform)](https://github.com/your-org/sugar-daddy-platform/issues)