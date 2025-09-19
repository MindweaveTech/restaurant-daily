import { NextRequest, NextResponse } from 'next/server';
import { OTPService, DemoUser } from '@/lib/messaging/otp-service';
import { PhoneValidator } from '@/lib/messaging/phone-validator';
import jwt from 'jsonwebtoken';
import { secretsManager } from '@/lib/secrets';

interface VerifyOTPRequest {
  phoneNumber: string;
  otpCode: string;
}

// Remove old JWT credentials function - using secretsManager instead

interface JWTPayload {
  phone: string;
  role: string;
  iat: number;
  exp: number;
  isDemoUser?: boolean;
  demoRole?: string;
  demoRestaurantName?: string;
  restaurant_id?: string;
}

/**
 * Generate JWT token for authenticated user
 */
async function generateToken(phoneNumber: string, demoUser?: DemoUser | null): Promise<string> {
  const payload: JWTPayload = {
    phone: phoneNumber,
    role: (demoUser && !demoUser.requiresRoleSelection) ? demoUser.role : 'user', // Use demo role only if not going through role selection
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  // Add demo user specific claims
  if (demoUser) {
    payload.isDemoUser = true;
    payload.demoRole = demoUser.role;
    payload.demoRestaurantName = demoUser.restaurantName;
    // Give demo admin users a mock restaurant_id only if they skip role selection
    if (demoUser.role === 'admin' && !demoUser.requiresRoleSelection) {
      payload.restaurant_id = 'demo-restaurant-' + demoUser.phoneNumber.slice(-4);
    }
  }

  // Use same JWT secret as update-role API
  const jwtSecret = await secretsManager.getJWTSecret() || process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development';
  return jwt.sign(payload, jwtSecret);
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyOTPRequest = await request.json();
    const { phoneNumber, otpCode } = body;

    // Validate request
    if (!phoneNumber || !otpCode) {
      return NextResponse.json(
        { error: 'Phone number and OTP code are required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneValidation = PhoneValidator.validate(phoneNumber);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        { error: 'OTP must be a 6-digit number' },
        { status: 400 }
      );
    }

    // Verify OTP
    const verificationResult = await OTPService.verifyOTP(
      phoneValidation.formatted!,
      otpCode
    );

    if (!verificationResult.isValid) {
      // Return specific error messages
      if (verificationResult.error?.includes('expired')) {
        return NextResponse.json(
          { error: 'Verification code has expired. Please request a new one.' },
          { status: 400 }
        );
      } else if (verificationResult.error?.includes('attempts exceeded')) {
        return NextResponse.json(
          { error: 'Too many failed attempts. Please request a new code.' },
          { status: 429 }
        );
      } else if (verificationResult.error?.includes('not found')) {
        return NextResponse.json(
          { error: 'No verification code found. Please request a new one.' },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: 'Invalid verification code. Please try again.' },
          { status: 400 }
        );
      }
    }

    // Check if this is a demo user
    const demoUser = OTPService.isDemoUser(phoneValidation.formatted!);

    // Generate JWT token
    const token = await generateToken(phoneValidation.formatted!, demoUser);

    // Format phone for display
    const formattedPhone = PhoneValidator.formatForDisplay(phoneValidation.formatted!);

    // Log successful authentication
    if (demoUser) {
      console.log(`🎭 Demo user authentication successful for ${formattedPhone} (${demoUser.role})`);
    } else {
      console.log(`✅ Authentication successful for ${formattedPhone}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
      token,
      user: {
        phone: phoneValidation.formatted,
        formattedPhone,
        country: phoneValidation.country,
        requiresRoleSelection: !demoUser || demoUser?.requiresRoleSelection, // Demo users skip role selection unless explicitly configured
        isDemoUser: !!demoUser,
        demoRole: demoUser?.role,
        demoRestaurantName: demoUser?.restaurantName
      }
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);

    if (error instanceof Error) {
      // Handle specific Vault errors
      if (error.message.includes('Vault')) {
        return NextResponse.json(
          { error: 'Configuration error. Please try again later.' },
          { status: 503 }
        );
      }

      // Handle JWT errors
      if (error.message.includes('jwt')) {
        return NextResponse.json(
          { error: 'Authentication error. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS request for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}