'use client';

import { useState, useEffect } from 'react';
import { ChefHat, TrendingUp, DollarSign, Users } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Restaurant Daily...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="h-12 w-12 text-orange-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Restaurant Daily</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track your restaurant&apos;s performance with ease. Manage cash sessions, vouchers,
            and payments all in one place.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <DollarSign className="h-10 w-10 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Cash Management</h3>
            <p className="text-gray-600">Track daily cash sessions and transactions</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <TrendingUp className="h-10 w-10 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Performance Tracking</h3>
            <p className="text-gray-600">Monitor sales and operational metrics</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Users className="h-10 w-10 text-purple-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Team Management</h3>
            <p className="text-gray-600">Role-based access for your team</p>
          </div>
        </div>

        <div className="text-center">
          <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg">
            Get Started
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Sign in with your phone number to continue
          </p>
        </div>
      </div>
    </div>
  );
}
