import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { staffInvitationService, userService } from '@/lib/database';
import { secretsManager } from '@/lib/secrets';
import { PhoneValidator } from '@/lib/messaging/phone-validator';

interface JWTPayload {
  phone: string;
  role: string;
  restaurant_id?: string;
  restaurant_name?: string;
  exp: number;
  iat: number;
}

interface InvitationRequest {
  phone: string;
  role?: 'staff';
  permissions?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: InvitationRequest = await request.json();
    const { phone, role = 'staff', permissions = [] } = body;

    // Validate required fields
    if (!phone?.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneValidation = PhoneValidator.validate(phone);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
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

    // Get JWT secret from Vault or environment
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

    // Ensure user is admin with restaurant
    if (decoded.role !== 'admin' || !decoded.restaurant_id) {
      return NextResponse.json(
        { error: 'Only restaurant admins can invite staff members' },
        { status: 403 }
      );
    }

    // Check if user is already registered
    const existingUser = await userService.getUserByPhone(phoneValidation.formatted!);
    if (existingUser) {
      if (existingUser.restaurant_id === decoded.restaurant_id) {
        return NextResponse.json(
          { error: 'User is already a member of this restaurant' },
          { status: 400 }
        );
      } else if (existingUser.restaurant_id) {
        return NextResponse.json(
          { error: 'User is already associated with another restaurant' },
          { status: 400 }
        );
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await staffInvitationService.checkExistingInvitation(
      decoded.restaurant_id,
      phoneValidation.formatted!
    );

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'A pending invitation already exists for this phone number' },
        { status: 400 }
      );
    }

    // Create the invitation
    const invitation = await staffInvitationService.createInvitation({
      restaurant_id: decoded.restaurant_id,
      phone: phoneValidation.formatted!,
      invited_by: decoded.phone,
      role,
      permissions
    });

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        phone: invitation.phone,
        role: invitation.role,
        status: invitation.status,
        expires_at: invitation.expires_at,
        created_at: invitation.created_at
      },
      message: 'Staff invitation created successfully'
    });

  } catch (error) {
    console.error('Staff invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to create staff invitation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Get JWT secret
    const jwtSecret = await secretsManager.getJWTSecret() || process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development';

    // Verify token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Ensure user has restaurant access
    if (!decoded.restaurant_id) {
      return NextResponse.json(
        { error: 'No restaurant access' },
        { status: 403 }
      );
    }

    // Get all invitations for the restaurant
    const invitations = await staffInvitationService.getRestaurantInvitations(decoded.restaurant_id);

    return NextResponse.json({
      success: true,
      invitations: invitations.map(inv => ({
        id: inv.id,
        phone: inv.phone,
        role: inv.role,
        status: inv.status,
        expires_at: inv.expires_at,
        accepted_at: inv.accepted_at,
        created_at: inv.created_at
      }))
    });

  } catch (error) {
    console.error('Get invitations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}