"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { Wholesaler } from "@/lib/models/Wholesaler";
import {
  Home,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  LogOut,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";

interface DashboardData {
  totalOrders: number;
  pendingOrders: number;
  todayOrders: number;
  inventoryCount: number;
  connectedRetailers: number;
  recentOrders: unknown[];
  unreadNotifications: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  retailer: {
    shop_name: string;
    profile: {
      full_name: string;
    };
  };
  items: {
    product_name: string;
    quantity: number;
  }[];
}

export default function WholesalerDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inventoryCount: 0,
    connectedRetailers: 0,
  });

  useEffect(() => {
    if (!user || user.getRole() !== "wholesaler") {
      router.push("/login?role=wholesaler");
      return;
    }

    loadDashboard();
  }, [user, router]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/wholesaler/dashboard");
      if (!response.ok) throw new Error("Failed to load dashboard data");
      const data = await response.json();
      setDashboardStats(data.stats);
      setOrders(data.recentOrders || []);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    try {
      const response = await fetch(
        `/api/wholesaler/orders/${orderId}/approve`,
        {
          method: "POST",
        }
      );

      if (!response.ok) throw new Error("Failed to approve order");

      await loadDashboard();
    } catch (error) {
      console.error("Error approving order:", error);
      alert("Failed to approve order");
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/wholesaler/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "cancelled",
        }),
      });

      if (!response.ok) throw new Error("Failed to reject order");

      await loadDashboard();
    } catch (error) {
      console.error("Error rejecting order:", error);
      alert("Failed to reject order");
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
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
            className="flex items-center px-4 py-3 text-purple-600 bg-purple-50 rounded-lg"
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
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
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
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {wholesaler.getFullName()}!
          </h2>
          <p className="text-gray-600 mt-1">
            Business: {wholesaler.getBusinessName()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardStats.totalOrders}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingBag size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {dashboardStats.pendingOrders}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <AlertCircle size={24} className="text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inventory Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardStats.inventoryCount}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Package size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected Retailers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardStats.connectedRetailers}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Orders Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Latest orders from retailers
            </p>
          </div>
          <div className="p-6">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle size={48} className="mx-auto mb-3 text-gray-400" />
                <p>No recent orders.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.order_number}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Retailer: {order.retailer?.shop_name || "N/A"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          ₹{order.total_amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      {order.items?.length || 0} items •{" "}
                      <span
                        className={`font-medium ${
                          order.status === "pending"
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {order.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApproveOrder(order.id)}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectOrder(order.id)}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <Link
                        href={`/wholesaler/orders/${order.id}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/wholesaler/inventory"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <Package size={32} className="text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Manage Inventory
            </h3>
            <p className="text-sm text-gray-600">
              Add, update, or remove products from your inventory
            </p>
          </Link>

          <Link
            href="/wholesaler/orders"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <ShoppingBag size={32} className="text-blue-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              View All Orders
            </h3>
            <p className="text-sm text-gray-600">
              See all orders from retailers and track their status
            </p>
          </Link>

          <Link
            href="/wholesaler/retailers"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <Users size={32} className="text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Retailer Network
            </h3>
            <p className="text-sm text-gray-600">
              View and manage your connected retailers
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
