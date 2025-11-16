"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { DeliveryPerson } from "@/lib/models/DeliveryPerson";
import { Home, Package, MapPin, TrendingUp, Clock, LogOut } from "lucide-react";

export default function DeliveryDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

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
        Loading...
      </div>
    );
  }

  const delivery = user as DeliveryPerson;

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
            Available Deliveries
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <Clock size={20} className="mr-3" />
            Active Delivery
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <TrendingUp size={20} className="mr-3" />
            Delivery History
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <MapPin size={20} className="mr-3" />
            Update Location
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
            Welcome back, {delivery.getFullName()}!
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your deliveries and track your earnings.
          </p>
        </div>

        {/* Availability Toggle */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Availability Status
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Toggle to start accepting deliveries
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Deliveries</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <Package size={32} className="text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Delivery</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">None</p>
              </div>
              <Clock size={32} className="text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <TrendingUp size={32} className="text-green-600" />
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

        {/* Available Deliveries */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Available Deliveries
          </h3>
          <div className="text-center py-12 text-gray-500">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p>No deliveries available at the moment</p>
            <p className="text-sm mt-2">
              Turn on availability to receive delivery requests
            </p>
          </div>
        </div>

        {/* Recent Deliveries */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Deliveries
          </h3>
          <div className="text-center py-12 text-gray-500">
            <p>No delivery history yet</p>
            <p className="text-sm mt-2">
              Your completed deliveries will appear here
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
