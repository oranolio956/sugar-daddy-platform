import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@/lib/validation';
import { withSecurityHeaders, withRateLimit, withAuth } from '@/lib/security';
import { InputValidator } from '@/lib/security';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Apply security middleware
const handler = withSecurityHeaders(
  withRateLimit(10, 60000)( // 10 requests per minute
    async (request: NextRequest) => {
      try {
        const body = await request.json();

        // Enhanced input validation
        const validationResult = loginSchema.safeParse(body);
        if (!validationResult.success) {
          return NextResponse.json(
            {
              success: false,
              message: 'Validation failed',
              errors: validationResult.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
              }))
            },
            { status: 400 }
          );
        }

        const { email, password, rememberMe, deviceInfo } = validationResult.data;

        // Additional security checks
        if (!InputValidator.validateEmail(email)) {
          return NextResponse.json(
            {
              success: false,
              message: 'Invalid email format'
            },
            { status: 400 }
          );
        }

        // Sanitize inputs
        const sanitizedEmail = InputValidator.sanitizeInput(email);
        const sanitizedPassword = InputValidator.sanitizeInput(password);

        // Mock user authentication - replace with real database check
        // For demo purposes, allow demo@example.com with password 'password'
        const isValidDemo = sanitizedEmail === 'demo@example.com' && sanitizedPassword === 'password';

        if (!isValidDemo) {
          // Log failed login attempt
          console.warn('Failed login attempt:', {
            email: sanitizedEmail,
            ip: request.ip,
            userAgent: request.headers.get('user-agent'),
            timestamp: new Date().toISOString()
          });

          return NextResponse.json(
            {
              success: false,
              message: 'Invalid credentials'
            },
            { status: 401 }
          );
        }

        // Successful login - create user object
        const user = {
          id: '1',
          email: 'demo@example.com',
          username: 'demo_user',
          role: 'sugar_baby',
          emailVerified: true,
          twoFactorEnabled: false,
          subscription: {
            tier: 'free',
            status: 'active',
            features: ['basic_profile', 'basic_matching', 'limited_messages']
          },
          profile: {
            firstName: 'Demo',
            lastName: 'User',
            age: 25,
            location: 'New York, NY',
            bio: 'Demo user for testing',
            verified: false,
            verificationLevel: 'none'
          },
          preferences: {
            lookingFor: 'sugar_daddy',
            ageRange: [25, 45],
            location: 'New York, NY',
            distance: 50
          },
          settings: {
            emailNotifications: true,
            pushNotifications: true,
            profileVisibility: 'public',
            showOnlineStatus: true,
            showLastSeen: true,
            allowMessages: 'everyone',
            marketingEmails: false,
            language: 'en',
            timezone: 'America/New_York'
          },
          stats: {
            profileViews: 0,
            likesReceived: 0,
            messagesSent: 0,
            matchesCount: 0,
            responseRate: 0
          },
          security: {
            lastPasswordChange: new Date().toISOString(),
            loginAttempts: 0,
            trustedDevices: []
          },
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString()
        };

        // Generate tokens with enhanced security
        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            iat: Math.floor(Date.now() / 1000),
            iss: 'sugar-daddy-platform',
            aud: 'sugar-daddy-platform-api'
          },
          JWT_SECRET,
          {
            expiresIn: rememberMe ? '30d' : '24h',
            algorithm: 'HS256'
          }
        );

        const refreshToken = jwt.sign(
          {
            userId: user.id,
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000),
            iss: 'sugar-daddy-platform',
            aud: 'sugar-daddy-platform-api'
          },
          JWT_SECRET,
          {
            expiresIn: '30d',
            algorithm: 'HS256'
          }
        );

        // Log successful login
        console.log('Successful login:', {
          userId: user.id,
          email: user.email,
          ip: request.ip,
          userAgent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString()
        });

        return NextResponse.json({
          success: true,
          data: {
            token,
            refreshToken,
            user,
            requires2FA: false
          }
        });
      } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
          {
            success: false,
            message: 'Internal server error'
          },
          { status: 500 }
        );
      }
    }
  )
);

export { handler as POST };