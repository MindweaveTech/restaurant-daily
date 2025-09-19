import { NextRequest, NextResponse } from 'next/server';
import { OTPRateLimit } from '@/lib/messaging/otp-service';
import { PhoneValidator } from '@/lib/messaging/phone-validator';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
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

    const formattedPhone = phoneValidation.formatted!;

    // Clear rate limit
    OTPRateLimit.clearRateLimit(formattedPhone);

    console.log(`🧹 Rate limit cleared for ${formattedPhone}`);

    return NextResponse.json({
      success: true,
      message: 'Rate limit cleared',
      phoneNumber: formattedPhone
    });

  } catch (error) {
    console.error('Clear rate limit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}