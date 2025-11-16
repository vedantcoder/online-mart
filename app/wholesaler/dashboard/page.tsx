"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { Wholesaler } from "@/lib/models/Wholesaler";
import {
  Home,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  LogOut,
} from "lucide-react";

export default function WholesalerDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user || user.getRole() !== "wholesaler") {
      router.push("/login?role=wholesaler");
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!user || user.getRole() !== "wholesaler") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  const wholesaler = user as Wholesaler;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Online-MART</h1>
          <p className="text-sm text-gray-600 mt-1">Wholesaler Portal</p>
        </div>

        <nav className="px-4 space-y-2">
          <a
            href="#"
            className="flex items-center px-4 py-3 text-purple-600 bg-purple-50 rounded-lg"
          >
            <Home size={20} className="mr-3" />
            Dashboard
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <Package size={20} className="mr-3" />
            Bulk Inventory
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <ShoppingBag size={20} className="mr-3" />
            Retailer Orders
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <Users size={20} className="mr-3" />
            Connected Retailers
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <TrendingUp size={20} className="mr-3" />
            Analytics
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
            Welcome back, {wholesaler.getFullName()}!
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your wholesale business operations.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <Package size={32} className="text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected Retailers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <Users size={32} className="text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <ShoppingBag size={32} className="text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₹0</p>
              </div>
              <TrendingUp size={32} className="text-orange-600" />
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
              <Package size={24} className="text-purple-600 mb-2" />
              <p className="font-medium text-gray-900">Add Bulk Product</p>
              <p className="text-sm text-gray-600">Add wholesale inventory</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <ShoppingBag size={24} className="text-blue-600 mb-2" />
              <p className="font-medium text-gray-900">View Orders</p>
              <p className="text-sm text-gray-600">Check retailer orders</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Users size={24} className="text-green-600 mb-2" />
              <p className="font-medium text-gray-900">Manage Retailers</p>
              <p className="text-sm text-gray-600">View connected retailers</p>
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Retailer Orders
          </h3>
          <div className="text-center py-12 text-gray-500">
            <p>No orders yet</p>
            <p className="text-sm mt-2">
              Orders from retailers will appear here
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
