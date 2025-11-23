"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  topProducts: Array<{
    product_name: string;
    total_quantity: number;
    total_revenue: number;
  }>;
  topCustomers: Array<{
    customer_name: string;
    total_orders: number;
    total_spent: number;
  }>;
  recentOrders: Array<{
    order_number: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

export default function RetailerAnalyticsPage() {
  const router = useRouter();
  const { user, isLoading, initialize } = useAuthStore();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30"); // days

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && (!user || user.getRole() !== "retailer")) {
      router.push("/login?role=retailer");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user && user.getRole() === "retailer") {
      loadAnalytics();
    }
  }, [isLoading, user, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/retailer/analytics?days=${timeRange}`);
      if (!res.ok) throw new Error("Failed to load analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Load analytics error:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/retailer/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-1">
                Business insights and performance metrics
              </p>
            </div>
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {!analytics ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No analytics data available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      ₹{analytics.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign size={32} className="text-green-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {analytics.totalOrders}
                    </p>
                  </div>
                  <ShoppingCart size={32} className="text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {analytics.totalCustomers}
                    </p>
                  </div>
                  <Users size={32} className="text-purple-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      ₹{analytics.averageOrderValue.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp size={32} className="text-orange-600" />
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package size={24} />
                Top Selling Products
              </h2>
              {analytics.topProducts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No product data available
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Product
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                          Quantity Sold
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topProducts.map((product, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-900">
                            {product.product_name}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900">
                            {product.total_quantity}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                            ₹{product.total_revenue.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Top Customers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={24} />
                Top Customers
              </h2>
              {analytics.topCustomers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No customer data available
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Customer
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                          Orders
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                          Total Spent
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topCustomers.map((customer, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-900">
                            {customer.customer_name}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900">
                            {customer.total_orders}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                            ₹{customer.total_spent.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingCart size={24} />
                Recent Orders
              </h2>
              {analytics.recentOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No recent orders
                </p>
              ) : (
                <div className="space-y-3">
                  {analytics.recentOrders.map((order, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          #{order.order_number}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.customer_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹{order.total_amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
