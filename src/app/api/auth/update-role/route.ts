import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { secretsManager } from '@/lib/secrets';

interface JWTPayload {
  phone: string;
  role?: string;
  restaurant_id?: string | null;
  exp: number;
  iat: number;
  isDemoUser?: boolean;
  demoRole?: string;
  demoRestaurantName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role } = body;

    // Validate role
    if (!role || !['admin', 'staff'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "staff"' },
        { status: 400 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Get JWT secret from Vault or environment (same as restaurant creation API)
    const jwtSecret = await secretsManager.getJWTSecret() || process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development';
    if (!jwtSecret) {
      console.error('JWT secret not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify current token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Create new token with role information
    const newTokenPayload: JWTPayload & Record<string, unknown> = {
      phone: decoded.phone,
      role: role,
      // Preserve existing restaurant_id (important for demo users)
      restaurant_id: decoded.restaurant_id || null,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    // Preserve demo user specific fields if they exist
    if (decoded.isDemoUser) {
      newTokenPayload.isDemoUser = decoded.isDemoUser;
      newTokenPayload.demoRole = role; // Update demo role to match selected role
      newTokenPayload.demoRestaurantName = decoded.demoRestaurantName;
    }

    console.log('🔍 Role selection debug:');
    console.log('  - Original restaurant_id:', decoded.restaurant_id);
    console.log('  - New token restaurant_id:', newTokenPayload.restaurant_id);
    console.log('  - Is demo user:', decoded.isDemoUser);

    const newToken = jwt.sign(
      newTokenPayload,
      jwtSecret,
      {
        issuer: 'restaurant-daily',
        audience: 'restaurant-daily-users'
      }
    );

    // TODO: Update user role in database
    // For now, we'll just return the updated token
    console.log(`User ${decoded.phone} selected role: ${role}`);

    return NextResponse.json({
      success: true,
      token: newToken,
      role: role,
      message: `Role updated to ${role}`
    });

  } catch (error) {
    console.error('Role update error:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}