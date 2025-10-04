import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { staffInvitationService, userService } from '@/lib/database';
import { secretsManager } from '@/lib/secrets';

interface AcceptInvitationRequest {
  invitation_token: string;
  phone: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AcceptInvitationRequest = await request.json();
    const { invitation_token, phone } = body;

    // Validate required fields
    if (!invitation_token?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: 'Invitation token and phone number are required' },
        { status: 400 }
      );
    }

    // Get the invitation by token
    const invitation = await staffInvitationService.getInvitationByToken(invitation_token);

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Mark as expired
      await staffInvitationService.cancelInvitation(invitation.id);
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Verify the phone number matches the invitation
    if (invitation.phone !== phone) {
      return NextResponse.json(
        { error: 'Phone number does not match invitation' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await userService.getUserByPhone(phone);

    if (user) {
      if (user.restaurant_id === invitation.restaurant_id) {
        // User is already part of this restaurant, just accept the invitation
        await staffInvitationService.acceptInvitation(invitation.id);

        return NextResponse.json({
          success: true,
          message: 'User is already a member of this restaurant',
          user: {
            phone: user.phone,
            role: user.role,
            restaurant_id: user.restaurant_id
          }
        });
      } else if (user.restaurant_id) {
        return NextResponse.json(
          { error: 'User is already associated with another restaurant' },
          { status: 400 }
        );
      }
    }

    // Create or update user
    if (!user) {
      // Create new user
      user = await userService.createUser({
        phone: invitation.phone,
        restaurant_id: invitation.restaurant_id,
        role: invitation.role,
        permissions: invitation.permissions,
        status: 'active',
        invited_by: invitation.invited_by
      });
    } else {
      // Update existing user
      user = await userService.updateUser(user.id, {
        restaurant_id: invitation.restaurant_id,
        role: invitation.role,
        permissions: invitation.permissions,
        status: 'active',
        invited_by: invitation.invited_by
      });
    }

    // Accept the invitation
    await staffInvitationService.acceptInvitation(invitation.id);

    // Generate JWT token for the new staff member
    const jwtSecret = await secretsManager.getJWTSecret() || process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development';

    const tokenPayload = {
      phone: user.phone,
      role: user.role,
      restaurant_id: user.restaurant_id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    const authToken = jwt.sign(tokenPayload, jwtSecret, {
      issuer: 'restaurant-daily',
      audience: 'restaurant-daily-users'
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      token: authToken,
      user: {
        phone: user.phone,
        role: user.role,
        restaurant_id: user.restaurant_id,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}