"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { ProductService } from "@/lib/services/ProductService";
import Link from "next/link";
import { useRoleValidation } from "@/hooks/useRoleValidation";
import {
  Package,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Plus,
  ArrowRight,
  DollarSign,
} from "lucide-react";

export default function RetailerDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  useRoleValidation(); // Validate role and show toast if mismatch
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    const userRole = user.getRole();
    if (userRole !== "retailer") {
      router.push("/login");
      return;
    }
    try {
      setLoading(true);
      const userId = user.getId();
      const inventory = await ProductService.getInventoryForSeller(userId);

      const totalProducts = inventory.length;
      const lowStockProducts = inventory.filter(
        (inv) => inv.quantity > 0 && inv.quantity <= inv.low_stock_threshold
      ).length;
      const outOfStockProducts = inventory.filter(
        (inv) => inv.quantity === 0 || !inv.is_available
      ).length;
      const totalValue = inventory.reduce(
        (sum, inv) => sum + inv.price * inv.quantity,
        0
      );

      setStats({
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalValue,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.getFullName() || "Retailer"}!
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Here&apos;s what&apos;s happening with your store today
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/retailer/products/add"
              className="flex items-center p-4 bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-sm hover:shadow-md transition group"
            >
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <Plus size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Add New Product</h3>
                <p className="text-sm text-blue-100">Expand your inventory</p>
              </div>
              <ArrowRight
                className="opacity-0 group-hover:opacity-100 transition"
                size={20}
              />
            </Link>

            <Link
              href="/dashboard/retailer/products"
              className="flex items-center p-4 bg-linear-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-sm hover:shadow-md transition group"
            >
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <Package size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Manage Products</h3>
                <p className="text-sm text-purple-100">View & edit inventory</p>
              </div>
              <ArrowRight
                className="opacity-0 group-hover:opacity-100 transition"
                size={20}
              />
            </Link>

            <Link
              href="/dashboard/retailer/orders"
              className="flex items-center p-4 bg-linear-to-br from-green-500 to-green-600 text-white rounded-xl shadow-sm hover:shadow-md transition group"
            >
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <ShoppingCart size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">View Orders</h3>
                <p className="text-sm text-green-100">Track your sales</p>
              </div>
              <ArrowRight
                className="opacity-0 group-hover:opacity-100 transition"
                size={20}
              />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="text-blue-600" size={24} />
                </div>
                <span className="text-xs font-medium text-gray-500">TOTAL</span>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.totalProducts}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Products in inventory
                </p>
              </div>
              <Link
                href="/dashboard/retailer/products"
                className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                View all <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>

            {/* Low Stock */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="text-orange-600" size={24} />
                </div>
                <span className="text-xs font-medium text-gray-500">
                  LOW STOCK
                </span>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-orange-600">
                  {stats.lowStockProducts}
                </h3>
                <p className="text-sm text-gray-600 mt-1">Need to restock</p>
              </div>
              <Link
                href="/dashboard/retailer/products?filter=low_stock"
                className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center"
              >
                View items <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>

            {/* Out of Stock */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <span className="text-xs font-medium text-gray-500">
                  OUT OF STOCK
                </span>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-red-600">
                  {stats.outOfStockProducts}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Unavailable products
                </p>
              </div>
              <Link
                href="/dashboard/retailer/products?filter=out_of_stock"
                className="mt-4 text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
              >
                View items <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>

            {/* Total Inventory Value */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="text-green-600" size={24} />
                </div>
                <span className="text-xs font-medium text-gray-500">VALUE</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  ₹{stats.totalValue.toLocaleString("en-IN")}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Total inventory value
                </p>
              </div>
              <div className="mt-4 text-sm text-green-600 font-medium flex items-center">
                <TrendingUp size={16} className="mr-1" />
                Updated today
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {(stats.lowStockProducts > 0 || stats.outOfStockProducts > 0) && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Alerts & Notifications
            </h2>
            <div className="space-y-3">
              {stats.lowStockProducts > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center">
                  <AlertTriangle
                    className="text-orange-600 mr-3 shrink-0"
                    size={20}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-900">
                      {stats.lowStockProducts}{" "}
                      {stats.lowStockProducts === 1
                        ? "product is"
                        : "products are"}{" "}
                      running low on stock
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Consider restocking soon to avoid running out
                    </p>
                  </div>
                  <Link
                    href="/dashboard/retailer/products?filter=low_stock"
                    className="ml-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium"
                  >
                    View Items
                  </Link>
                </div>
              )}
              {stats.outOfStockProducts > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                  <AlertTriangle
                    className="text-red-600 mr-3 shrink-0"
                    size={20}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">
                      {stats.outOfStockProducts}{" "}
                      {stats.outOfStockProducts === 1
                        ? "product is"
                        : "products are"}{" "}
                      out of stock
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      These products are currently unavailable to customers
                    </p>
                  </div>
                  <Link
                    href="/dashboard/retailer/products?filter=out_of_stock"
                    className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                  >
                    View Items
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
