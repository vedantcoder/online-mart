"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Home,
  Package,
  MapPin,
  CheckCircle,
  Clock,
  LogOut,
  User,
  TrendingUp,
} from "lucide-react";
import { useRoleValidation } from "@/hooks/useRoleValidation";

export default function DeliveryDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  useRoleValidation(); // Validate role and show toast if mismatch

  useEffect(() => {
    if (!user || user.getRole() !== "delivery") {
      router.push("/login?role=delivery");
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!user || user.getRole() !== "delivery") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Online-MART</h1>
          <p className="text-sm text-gray-600 mt-1">Delivery Portal</p>
        </div>

        <nav className="px-4 space-y-2">
          <a
            href="#"
            className="flex items-center px-4 py-3 text-orange-600 bg-orange-50 rounded-lg"
          >
            <Home size={20} className="mr-3" />
            Dashboard
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <Package size={20} className="mr-3" />
            Assigned Deliveries
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <MapPin size={20} className="mr-3" />
            Route Map
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <CheckCircle size={20} className="mr-3" />
            Completed
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <User size={20} className="mr-3" />
            Profile
          </a>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.getFullName() || "Delivery Partner"}!
          </h2>
          <p className="text-gray-600 mt-1">
            Here&apos;s your delivery schedule for today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Deliveries</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <Clock size={32} className="text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <Package size={32} className="text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <CheckCircle size={32} className="text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₹0</p>
              </div>
              <TrendingUp size={32} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Package size={24} className="text-orange-600 mb-2" />
              <p className="font-medium text-gray-900">View Deliveries</p>
              <p className="text-sm text-gray-600">Check assigned orders</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <MapPin size={24} className="text-blue-600 mb-2" />
              <p className="font-medium text-gray-900">Open Map</p>
              <p className="text-sm text-gray-600">Navigate to location</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <CheckCircle size={24} className="text-green-600 mb-2" />
              <p className="font-medium text-gray-900">Update Status</p>
              <p className="text-sm text-gray-600">Mark delivery complete</p>
            </button>
          </div>
        </div>

        {/* Today&apos;s Deliveries */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Today&apos;s Deliveries
          </h3>
          <div className="text-center py-12 text-gray-500">
            <p>No deliveries assigned</p>
            <p className="text-sm mt-2">
              New deliveries will appear here when assigned
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
