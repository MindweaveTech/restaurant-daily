import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TwilioMessagingClient } from '@/lib/messaging/twilio-client';
import { PhoneValidator } from '@/lib/messaging/phone-validator';
import { OTPRateLimit, OTPService } from '@/lib/messaging/otp-service';
import { logAPI, logAuth, logError } from '@/lib/logger';

// Request validation schema
const requestOTPSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
  purpose: z.enum(['login', 'registration', 'password_reset']).optional().default('login'),
  preferredMethod: z.enum(['whatsapp', 'sms', 'auto']).optional().default('auto')
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Parse request body
    const body = await request.json();
    const validation = requestOTPSchema.safeParse(body);

    if (!validation.success) {
      logAPI('POST', '/api/auth/request-otp', 400, Date.now() - startTime, { error: 'Validation failed' });
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
      logAPI('POST', '/api/auth/request-otp', 400, Date.now() - startTime, { error: 'Invalid phone number' });
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
    logAuth('request-otp', formattedPhone, true, { purpose, preferredMethod });

    // Check if this is a demo user first
    const demoUser = OTPService.isDemoUser(formattedPhone);

    // Skip rate limiting for demo users
    if (!demoUser) {
      // Check rate limiting for regular users only
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

      // Record the attempt for regular users
      OTPRateLimit.recordAttempt(formattedPhone);
    }

    if (demoUser) {
      // Handle demo user - generate fixed OTP without sending actual message
      const demoOTP = OTPService.generateDemoOTP(demoUser, purpose);

      console.log(`🎭 Demo user OTP generated for ${formattedPhone.slice(-4)}: ${demoOTP.code}`);

      return NextResponse.json({
        success: true,
        message: 'OTP sent via demo mode',
        data: {
          phoneNumber: PhoneValidator.formatForDisplay(formattedPhone),
          method: 'demo',
          expiresIn: '30 minutes', // Demo OTPs last longer
          canResendIn: '1 minute',
          isDemoUser: true,
          demoOTP: process.env.NODE_ENV === 'development' ? demoOTP.code : undefined // Only show in dev
        }
      });
    }

    // Send OTP via Twilio for regular users
    const messageResult = await TwilioMessagingClient.sendOTP({
      phoneNumber: formattedPhone,
      purpose,
      preferredMethod
    });

    if (!messageResult.success) {
      logAuth('request-otp', formattedPhone, false, { error: messageResult.error });
      logAPI('POST', '/api/auth/request-otp', 500, Date.now() - startTime, { error: 'Failed to send OTP' });
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send OTP',
          details: messageResult.error
        },
        { status: 500 }
      );
    }

    logAuth('otp-sent', formattedPhone, true, { method: messageResult.method, messageSid: messageResult.messageSid });
    logAPI('POST', '/api/auth/request-otp', 200, Date.now() - startTime);

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