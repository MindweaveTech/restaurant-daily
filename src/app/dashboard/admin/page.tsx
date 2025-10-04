'use client';

import { useState, useEffect } from 'react';
import { ChefHat, Users, Building2, TrendingUp, Clock, FileText, Settings, Plus, X } from 'lucide-react';
import StaffInvitationModal from '@/components/admin/StaffInvitationModal';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface RestaurantInfo {
  name: string;
  role: string;
  phone: string;
  restaurant_id?: string;
  restaurant_name?: string;
}

export default function AdminDashboard() {
  const [userInfo, setUserInfo] = useState<RestaurantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [showWelcomeCard, setShowWelcomeCard] = useState(true);

  useEffect(() => {
    // Get user info from JWT token
    const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserInfo(payload);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }

    // Check if welcome card was previously dismissed
    const welcomeDismissed = localStorage.getItem('welcomeCardDismissed');
    if (welcomeDismissed === 'true') {
      setShowWelcomeCard(false);
    }

    setLoading(false);
  }, []);

  const dismissWelcomeCard = () => {
    setShowWelcomeCard(false);
    localStorage.setItem('welcomeCardDismissed', 'true');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChefHat className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {userInfo?.restaurant_name || 'Restaurant Admin'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Admin Dashboard • {userInfo?.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        {showWelcomeCard && (
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-6 text-white mb-8 relative">
            <button
              onClick={dismissWelcomeCard}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              aria-label="Dismiss welcome message"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold mb-2 pr-8">
              Welcome to Restaurant Daily! 🎉
            </h2>
            <p className="opacity-90 pr-8">
              Your restaurant is now set up. Start managing your team and tracking daily operations.
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Members</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Sessions</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Vouchers</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hours Today</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Invite Staff */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ml-3">Invite Staff</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Send WhatsApp invitations to your team members to join Restaurant Daily.
            </p>
            <button
              onClick={() => setIsInvitationModalOpen(true)}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Invite Team Member
            </button>
          </div>

          {/* Cash Sessions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ml-3">Cash Sessions</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Monitor and manage cash sessions across all shifts and team members.
            </p>
            <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Clock className="h-4 w-4 mr-2" />
              View Sessions
            </button>
          </div>

          {/* Voucher Management */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ml-3">Vouchers</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Review, approve, and manage all petty voucher requests from your team.
            </p>
            <button className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
              <FileText className="h-4 w-4 mr-2" />
              Manage Vouchers
            </button>
          </div>

          {/* Restaurant Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ml-3">Restaurant Settings</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Update your restaurant profile, contact information, and preferences.
            </p>
            <button className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              <Settings className="h-4 w-4 mr-2" />
              Edit Settings
            </button>
          </div>

          {/* Reports */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ml-3">Reports</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Generate comprehensive reports on performance, cash flow, and expenses.
            </p>
            <button className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Reports
            </button>
          </div>

          {/* Help & Support */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <ChefHat className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ml-3">Help & Support</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Get help with Restaurant Daily features and contact our support team.
            </p>
            <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <ChefHat className="h-4 w-4 mr-2" />
              Get Help
            </button>
          </div>
        </div>

        {/* Recent Activity (Empty State) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
          </div>
          <div className="p-12 text-center">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-fit mx-auto mb-4">
              <Clock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No activity yet</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start by inviting your team members and setting up cash sessions.
            </p>
            <button className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </main>

      {/* Staff Invitation Modal */}
      <StaffInvitationModal
        isOpen={isInvitationModalOpen}
        onClose={() => setIsInvitationModalOpen(false)}
      />
    </div>
  );
}