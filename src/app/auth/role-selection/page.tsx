'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Users, Building2, ArrowRight, Crown, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'staff' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: 'admin' | 'staff') => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;

    setLoading(true);

    try {
      // Update user role in backend
      const authToken = localStorage.getItem('auth_token');

      const response = await fetch('/api/auth/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update token with role information
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }

        // Redirect based on role
        if (selectedRole === 'admin') {
          router.push('/onboarding/restaurant-setup');
        } else {
          router.push('/onboarding/staff-welcome');
        }
      } else {
        console.error('Failed to update role:', data.error);
        // Continue anyway for now
        if (selectedRole === 'admin') {
          router.push('/onboarding/restaurant-setup');
        } else {
          router.push('/onboarding/staff-welcome');
        }
      }
    } catch (error) {
      console.error('Role selection error:', error);
      // Continue anyway for now - we can handle this gracefully
      if (selectedRole === 'admin') {
        router.push('/onboarding/restaurant-setup');
      } else {
        router.push('/onboarding/staff-welcome');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="h-8 w-8 text-orange-600 mr-3" />
            <span className="text-2xl font-bold text-gray-800">Restaurant Daily</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Restaurant Daily!
          </h1>

          <p className="text-lg text-gray-600 max-w-md mx-auto">
            To get started, please let us know your role at the restaurant.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Restaurant Admin */}
          <div
            onClick={() => handleRoleSelect('admin')}
            className={cn(
              'bg-white rounded-xl shadow-lg border-2 cursor-pointer transition-all duration-300',
              'hover:shadow-xl hover:scale-105 p-6',
              selectedRole === 'admin'
                ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                : 'border-gray-200 hover:border-orange-300'
            )}
          >
            <div className="text-center">
              {/* Icon */}
              <div className={cn(
                'mx-auto mb-4 p-4 rounded-full',
                selectedRole === 'admin'
                  ? 'bg-orange-100'
                  : 'bg-gray-100'
              )}>
                <Crown className={cn(
                  'h-12 w-12',
                  selectedRole === 'admin'
                    ? 'text-orange-600'
                    : 'text-gray-600'
                )} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Restaurant Admin
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                I own or manage a restaurant and want to set up my restaurant profile,
                invite staff members, and manage operations.
              </p>

              {/* Features */}
              <div className="space-y-2 text-left">
                <div className="flex items-center text-sm text-gray-700">
                  <Building2 className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" />
                  Set up restaurant profile
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Users className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" />
                  Invite and manage staff
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <ChefHat className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" />
                  Full access to all features
                </div>
              </div>

              {/* Selection indicator */}
              {selectedRole === 'admin' && (
                <div className="mt-4 flex items-center justify-center text-orange-600">
                  <UserCheck className="h-5 w-5 mr-2" />
                  <span className="font-medium">Selected</span>
                </div>
              )}
            </div>
          </div>

          {/* Staff Member */}
          <div
            onClick={() => handleRoleSelect('staff')}
            className={cn(
              'bg-white rounded-xl shadow-lg border-2 cursor-pointer transition-all duration-300',
              'hover:shadow-xl hover:scale-105 p-6',
              selectedRole === 'staff'
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-blue-300'
            )}
          >
            <div className="text-center">
              {/* Icon */}
              <div className={cn(
                'mx-auto mb-4 p-4 rounded-full',
                selectedRole === 'staff'
                  ? 'bg-blue-100'
                  : 'bg-gray-100'
              )}>
                <Users className={cn(
                  'h-12 w-12',
                  selectedRole === 'staff'
                    ? 'text-blue-600'
                    : 'text-gray-600'
                )} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Staff Member
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                I work at a restaurant and was invited by my manager to join
                the team for daily operations tracking.
              </p>

              {/* Features */}
              <div className="space-y-2 text-left">
                <div className="flex items-center text-sm text-gray-700">
                  <ChefHat className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                  Track daily operations
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Building2 className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                  Cash sessions & vouchers
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Users className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                  Team collaboration
                </div>
              </div>

              {/* Selection indicator */}
              {selectedRole === 'staff' && (
                <div className="mt-4 flex items-center justify-center text-blue-600">
                  <UserCheck className="h-5 w-5 mr-2" />
                  <span className="font-medium">Selected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            className={cn(
              'px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center mx-auto',
              'transition-all duration-200 shadow-md min-w-[200px]',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              selectedRole && !loading
                ? selectedRole === 'admin'
                  ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl focus:ring-orange-500'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            )}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                Setting up...
              </>
            ) : selectedRole ? (
              <>
                Continue as {selectedRole === 'admin' ? 'Admin' : 'Staff Member'}
                <ArrowRight className="h-5 w-5 ml-3" />
              </>
            ) : (
              <>
                Select your role to continue
                <ArrowRight className="h-5 w-5 ml-3 opacity-50" />
              </>
            )}
          </button>

          {selectedRole && (
            <p className="mt-4 text-sm text-gray-500">
              {selectedRole === 'admin'
                ? "You'll be able to set up your restaurant and invite team members"
                : "You'll join your restaurant team for daily operations"
              }
            </p>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Don&apos;t worry, you can change your role later if needed.
            Choose the option that best describes your current situation.
          </p>
        </div>
      </div>
    </div>
  );
}