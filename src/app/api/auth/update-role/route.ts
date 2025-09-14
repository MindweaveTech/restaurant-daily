import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  phone: string;
  exp: number;
  iat: number;
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

    // Get JWT secret (for now use a fallback, in production this should be from Vault)
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development';
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
    const newTokenPayload = {
      phone: decoded.phone,
      role: role,
      // For now, we'll add restaurant_id later when restaurant is created
      restaurant_id: null,
    };

    const newToken = jwt.sign(
      newTokenPayload,
      jwtSecret,
      {
        expiresIn: '24h',
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