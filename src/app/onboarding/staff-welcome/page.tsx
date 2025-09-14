'use client';

import { useRouter } from 'next/navigation';
import { ChefHat, Users, Clock, FileText, ArrowRight, Star } from 'lucide-react';

export default function StaffWelcomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="h-8 w-8 text-blue-600 mr-3" />
            <span className="text-2xl font-bold text-gray-800">Restaurant Daily</span>
          </div>

          <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-6">
            <Users className="h-16 w-16 text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to the Team!
          </h1>

          <p className="text-lg text-gray-600">
            You&apos;re all set to start tracking daily operations
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              What you can do as a team member:
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 mb-8">
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Cash Sessions</h3>
                <p className="text-gray-600 text-sm">
                  Track opening and closing balances for your shifts
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Petty Vouchers</h3>
                <p className="text-gray-600 text-sm">
                  Log expenses and maintain proper records
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Team Collaboration</h3>
                <p className="text-gray-600 text-sm">
                  Work together with your restaurant team
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Performance Tracking</h3>
                <p className="text-gray-600 text-sm">
                  Monitor daily operations and performance metrics
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg
                       flex items-center justify-center mx-auto transition-all duration-200
                       shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Get Started
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help getting started? Your restaurant admin can guide you through the features.
          </p>
        </div>
      </div>
    </div>
  );
}