import { NextRequest, NextResponse } from 'next/server';
import { staffInvitationService, restaurantService } from '@/lib/database';

interface ValidateInvitationRequest {
  invitation_token: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidateInvitationRequest = await request.json();
    const { invitation_token } = body;

    // Validate required fields
    if (!invitation_token?.trim()) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
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
        { error: 'This invitation has expired' },
        { status: 400 }
      );
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'This invitation is no longer valid' },
        { status: 400 }
      );
    }

    // Get restaurant information
    const restaurant = await restaurantService.getRestaurantById(invitation.restaurant_id);
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Return invitation details
    return NextResponse.json({
      success: true,
      invitation: {
        restaurant_name: restaurant.name,
        expires_at: invitation.expires_at,
        phone: invitation.phone,
        role: invitation.role,
        status: invitation.status
      }
    });

  } catch (error) {
    console.error('Validate invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    );
  }
}