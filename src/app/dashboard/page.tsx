'use client';

import { useEffect, useState } from 'react';
import { ChefHat, LogOut, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<{ phone?: string; formattedPhone?: string; role?: string; restaurant_id?: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      window.location.href = '/auth/phone';
      return;
    }

    // Decode JWT token to get user info
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      // Check if user has selected a role
      if (!payload.role) {
        // Redirect to role selection
        window.location.href = '/auth/role-selection';
        return;
      }

      // Check role and redirect accordingly
      if (payload.role === 'admin') {
        if (!payload.restaurant_id) {
          // Admin without restaurant - go to restaurant setup
          window.location.href = '/onboarding/restaurant-setup';
          return;
        } else {
          // Admin with restaurant - go to admin dashboard
          window.location.href = '/dashboard/admin';
          return;
        }
      } else if (payload.role === 'staff') {
        // Staff member - go to staff welcome
        window.location.href = '/onboarding/staff-welcome';
        return;
      }

      // Fallback for any other case
      setUser({
        phone: payload.phone,
        formattedPhone: payload.phone,
        role: payload.role,
        restaurant_id: payload.restaurant_id
      });
    } catch (error) {
      console.error('Error parsing token:', error);
      // Invalid token, redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/auth/phone';
      return;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <ChefHat className="h-8 w-8 text-orange-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Restaurant Daily</h1>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>

        {/* Success Message */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Successful! 🎉
            </h2>

            <p className="text-gray-600 mb-4">
              You have successfully logged in with your phone number:
            </p>

            <p className="font-medium text-lg text-gray-800 mb-6">
              {user.formattedPhone}
            </p>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">
                🚧 Coming Soon
              </h3>
              <p className="text-orange-700 text-sm">
                The full dashboard with cash management, voucher tracking, and payment monitoring features
                will be available in the next development phase.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center opacity-75">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Cash Management</h3>
            <p className="text-gray-600 text-sm">Track daily cash sessions and transactions</p>
            <div className="mt-4 text-xs text-gray-400">Coming in Phase 3</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center opacity-75">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Voucher Tracking</h3>
            <p className="text-gray-600 text-sm">Manage petty vouchers and expense approvals</p>
            <div className="mt-4 text-xs text-gray-400">Coming in Phase 3</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center opacity-75">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Monitoring</h3>
            <p className="text-gray-600 text-sm">Track electricity payments and due dates</p>
            <div className="mt-4 text-xs text-gray-400">Coming in Phase 3</div>
          </div>
        </div>
      </div>
    </div>
  );
}