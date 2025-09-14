import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TwilioMessagingClient } from '@/lib/messaging/twilio-client';
import { PhoneValidator } from '@/lib/messaging/phone-validator';
import { OTPRateLimit } from '@/lib/messaging/otp-service';

// Request validation schema
const requestOTPSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
  purpose: z.enum(['login', 'registration', 'password_reset']).optional().default('login'),
  preferredMethod: z.enum(['whatsapp', 'sms', 'auto']).optional().default('auto')
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const validation = requestOTPSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const { phoneNumber, purpose, preferredMethod } = validation.data;

    // Validate phone number format
    const phoneValidation = PhoneValidator.validate(phoneNumber);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid phone number',
          details: phoneValidation.error
        },
        { status: 400 }
      );
    }

    const formattedPhone = phoneValidation.formatted!;

    // Check rate limiting
    const isRateLimited = await OTPRateLimit.isRateLimited(formattedPhone);
    if (isRateLimited) {
      const remainingAttempts = await OTPRateLimit.getRemainingAttempts(formattedPhone);

      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many OTP requests. Please try again later.',
          remainingAttempts
        },
        { status: 429 }
      );
    }

    // Record the attempt
    OTPRateLimit.recordAttempt(formattedPhone);

    // Send OTP via Twilio
    const messageResult = await TwilioMessagingClient.sendOTP({
      phoneNumber: formattedPhone,
      purpose,
      preferredMethod
    });

    if (!messageResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send OTP',
          details: messageResult.error
        },
        { status: 500 }
      );
    }

    // Log the successful attempt (in production, log to database)
    console.log(`OTP sent via ${messageResult.method} to ${formattedPhone.slice(-4)} (${messageResult.messageSid})`);

    // Return success response (don't expose sensitive data)
    return NextResponse.json({
      success: true,
      message: `OTP sent via ${messageResult.method}`,
      data: {
        phoneNumber: PhoneValidator.formatForDisplay(formattedPhone),
        method: messageResult.method,
        expiresIn: '5 minutes',
        canResendIn: '1 minute' // Implement resend logic
      }
    });

  } catch (error) {
    console.error('Request OTP API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Unable to process OTP request'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}