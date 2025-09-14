'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import PhoneInput from '@/components/ui/phone-input';
import { cn } from '@/lib/utils';

export default function PhoneAuthPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneChange = (phone: string, valid: boolean) => {
    setPhoneNumber(phone);
    setIsValid(valid);
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleRequestOTP = async () => {
    if (!isValid || !phoneNumber.trim()) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          preferredMethod: 'whatsapp', // Default to WhatsApp for better UX
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store phone number for OTP verification page
        sessionStorage.setItem('pendingPhone', phoneNumber.trim());
        sessionStorage.setItem('otpMethod', data.method || 'whatsapp');

        // Navigate to OTP verification page
        router.push('/auth/verify');
      } else {
        setError(data.error || 'Failed to send verification code. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('OTP request error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid && !loading) {
      handleRequestOTP();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Go back to home"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Link>

          <div className="flex items-center">
            <ChefHat className="h-6 w-6 text-orange-600 mr-2" />
            <span className="text-lg font-semibold text-gray-800">Restaurant Daily</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Enter your phone number to receive a verification code and access your restaurant dashboard.
            </p>
          </div>

          {/* Phone Input Form */}
          <div className="space-y-6" onKeyPress={handleKeyPress}>
            <PhoneInput
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Enter your mobile number"
              defaultCountry="IN"
              required
              disabled={loading}
              error={error}
              loading={loading}
              className="w-full"
            />

            {/* Submit Button */}
            <button
              onClick={handleRequestOTP}
              disabled={!isValid || loading}
              className={cn(
                'w-full flex items-center justify-center px-4 py-3 rounded-lg font-semibold text-base',
                'transition-all duration-200 shadow-sm',
                'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
                isValid && !loading
                  ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              )}
              aria-describedby="submit-help"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending Code...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Verification Code
                </>
              )}
            </button>

            <p id="submit-help" className="text-xs text-gray-500 text-center">
              We&apos;ll send a 6-digit code via WhatsApp to verify your number
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="text-sm font-medium text-orange-900 mb-1">
              🔐 Secure Authentication
            </h3>
            <p className="text-xs text-orange-700">
              Your phone number is used only for authentication and account security.
              We never share your information with third parties.
            </p>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Having trouble? Check that your number is correct and you have WhatsApp installed.
            </p>
            <Link
              href="/"
              className="text-sm text-orange-600 hover:text-orange-700 underline mt-2 inline-block"
            >
              Need help? Contact support
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}