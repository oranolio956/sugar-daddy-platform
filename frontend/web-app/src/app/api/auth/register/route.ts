import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validation';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    const {
      email,
      password,
      username,
      role,
      profile,
      preferences,
      deviceInfo,
      subscription
    } = validationResult.data;

    // Check if user already exists (mock check)
    if (email === 'demo@example.com') {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user object (mock implementation)
    const user = {
      id: Date.now().toString(), // Mock ID generation
      email,
      username,
      role,
      emailVerified: false,
      twoFactorEnabled: false,
      subscription: subscription || {
        tier: 'free',
        status: 'active',
        features: ['basic_profile', 'basic_matching', 'limited_messages']
      },
      profile: {
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        age: profile?.age || 18,
        location: profile?.location || '',
        verified: false,
        verificationLevel: 'none'
      },
      preferences: preferences || {
        lookingFor: role === 'sugar_daddy' ? 'sugar_baby' : 'sugar_daddy',
        ageRange: [18, 50],
        location: profile?.location || '',
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
        timezone: 'UTC'
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
        trustedDevices: deviceInfo ? [deviceInfo] : []
      },
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString()
    };

    // Generate tokens
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      token,
      refreshToken,
      user,
      message: 'Account created successfully. Please check your email to verify your account.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}