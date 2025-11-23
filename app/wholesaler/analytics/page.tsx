"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Home,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  LogOut,
  BarChart3,
  DollarSign,
} from "lucide-react";

export default function WholesalerAnalyticsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  React.useEffect(() => {
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Online-MART</h1>
          <p className="text-sm text-gray-600 mt-1">Wholesaler Portal</p>
        </div>

        <nav className="px-4 space-y-2">
          <Link
            href="/wholesaler/dashboard"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <Home size={20} className="mr-3" />
            Dashboard
          </Link>
          <Link
            href="/wholesaler/inventory"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <Package size={20} className="mr-3" />
            Inventory
          </Link>
          <Link
            href="/wholesaler/orders"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <ShoppingBag size={20} className="mr-3" />
            Retailer Orders
          </Link>
          <Link
            href="/wholesaler/retailers"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <Users size={20} className="mr-3" />
            Retailers
          </Link>
          <Link
            href="/wholesaler/analytics"
            className="flex items-center px-4 py-3 text-purple-600 bg-purple-50 rounded-lg"
          >
            <TrendingUp size={20} className="mr-3" />
            Analytics
          </Link>
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
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600 mt-1">
            Business insights and performance metrics
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BarChart3 size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Analytics Coming Soon
          </h3>
          <p className="text-gray-600">
            We're working on comprehensive analytics and reporting features for
            your business.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Track sales, revenue, popular products, and retailer performance.
          </p>
        </div>
      </main>
    </div>
  );
}
