import { NextRequest, NextResponse } from 'next/server';
import { OTPService } from '@/lib/messaging/otp-service';
import { PhoneValidator } from '@/lib/messaging/phone-validator';
import jwt from 'jsonwebtoken';
import { execSync } from 'child_process';

interface VerifyOTPRequest {
  phoneNumber: string;
  otpCode: string;
}

interface JWTCredentials {
  accessTokenSecret: string;
  refreshTokenSecret: string;
}

/**
 * Get JWT credentials from Vault
 */
async function getJWTCredentials(): Promise<JWTCredentials> {
  try {
    const vaultToken = process.env.VAULT_TOKEN || 'your_vault_dev_token';
    const command = `VAULT_ADDR='http://127.0.0.1:8200' VAULT_TOKEN='${vaultToken}' vault kv get -format=json secret/jwt`;
    const result = execSync(command, { encoding: 'utf8' });
    const parsed = JSON.parse(result);

    return {
      accessTokenSecret: parsed.data.data.access_token_secret,
      refreshTokenSecret: parsed.data.data.refresh_token_secret
    };
  } catch (error) {
    throw new Error(`Failed to retrieve JWT credentials from Vault: ${error}`);
  }
}

/**
 * Generate JWT token for authenticated user
 */
function generateToken(phoneNumber: string, credentials: JWTCredentials): string {
  return jwt.sign(
    {
      phone: phoneNumber,
      role: 'user', // Default role, will be updated after role selection
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    },
    credentials.accessTokenSecret
  );
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

    // Generate JWT token
    const jwtCredentials = await getJWTCredentials();
    const token = generateToken(phoneValidation.formatted!, jwtCredentials);

    // Format phone for display
    const formattedPhone = PhoneValidator.formatForDisplay(phoneValidation.formatted!);

    // Log successful authentication
    console.log(`✅ Authentication successful for ${formattedPhone}`);

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
      token,
      user: {
        phone: phoneValidation.formatted,
        formattedPhone,
        country: phoneValidation.country,
        requiresRoleSelection: true // User needs to select role next
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