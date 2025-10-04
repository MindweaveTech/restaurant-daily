import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { staffInvitationService } from '@/lib/database';
import { secretsManager } from '@/lib/secrets';

interface JWTPayload {
  phone: string;
  role: string;
  restaurant_id?: string;
  exp: number;
  iat: number;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invitationId } = await params;

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
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

    // Ensure user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can cancel invitations' },
        { status: 403 }
      );
    }

    // Cancel the invitation
    const cancelledInvitation = await staffInvitationService.cancelInvitation(invitationId);

    return NextResponse.json({
      success: true,
      invitation: {
        id: cancelledInvitation.id,
        phone: cancelledInvitation.phone,
        status: cancelledInvitation.status
      },
      message: 'Invitation cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel invitation error:', error);

    if (error instanceof Error && error.message.includes('Failed to cancel invitation')) {
      return NextResponse.json(
        { error: 'Invitation not found or already processed' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to cancel invitation' },
      { status: 500 }
    );
  }
}