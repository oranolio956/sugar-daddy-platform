import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token required' },
        { status: 400 }
      );
    }

    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };

      // Generate new tokens
      const newToken = jwt.sign(
        { userId: decoded.userId, email: 'demo@example.com' }, // Mock email
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const newRefreshToken = jwt.sign(
        { userId: decoded.userId },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Mock user data
      const user = {
        id: decoded.userId,
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

      return NextResponse.json({
        token: newToken,
        refreshToken: newRefreshToken,
        user
      });
    } catch (jwtError) {
      return NextResponse.json(
        { message: 'Invalid refresh token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}