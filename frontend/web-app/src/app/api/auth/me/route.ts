import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

      // Mock user data - replace with database lookup
      const user = {
        id: decoded.userId,
        email: decoded.email,
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

      return NextResponse.json(user);
    } catch (jwtError) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}