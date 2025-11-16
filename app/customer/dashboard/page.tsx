"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { Customer } from "@/lib/models/Customer";
import { Home, ShoppingCart, Heart, Package, LogOut, User } from "lucide-react";

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user || user.getRole() !== "customer") {
      router.push("/login?role=customer");
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!user || user.getRole() !== "customer") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  const customer = user as Customer;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Online-MART</h1>
          <p className="text-sm text-gray-600 mt-1">Customer Portal</p>
        </div>

        <nav className="px-4 space-y-2">
          <a
            href="#"
            className="flex items-center px-4 py-3 text-blue-600 bg-blue-50 rounded-lg"
          >
            <Home size={20} className="mr-3" />
            Dashboard
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <ShoppingCart size={20} className="mr-3" />
            My Cart
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <Package size={20} className="mr-3" />
            My Orders
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <Heart size={20} className="mr-3" />
            Wishlist
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
            Welcome back, {customer.getFullName()}!
          </h2>
          <p className="text-gray-600 mt-1">
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cart Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <ShoppingCart size={32} className="text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <Package size={32} className="text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wishlist</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <Heart size={32} className="text-red-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <Package size={32} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="text-center py-12 text-gray-500">
            <p>No recent activity to display</p>
            <p className="text-sm mt-2">
              Start shopping to see your activity here
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
