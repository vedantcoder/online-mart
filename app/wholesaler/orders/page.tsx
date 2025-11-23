"use client";

import React, { useEffect, useState } from "react";
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
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
} from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  retailer: {
    id: string;
    shop_name: string;
    profile: {
      full_name: string;
      email: string;
      phone: string;
    };
  };
  items: {
    id: string;
    product_name: string;
    quantity: number;
    price_per_unit: number;
    subtotal: number;
  }[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={16} />,
  confirmed: <CheckCircle size={16} />,
  processing: <Package size={16} />,
  ready: <Truck size={16} />,
  delivered: <CheckCircle size={16} />,
  cancelled: <XCircle size={16} />,
};

export default function WholesalerOrdersPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!user || user.getRole() !== "wholesaler") {
      router.push("/login?role=wholesaler");
      return;
    }

    loadOrders();
  }, [user, router, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter === "all"
          ? "/api/wholesaler/orders"
          : `/api/wholesaler/orders?status=${statusFilter}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to load orders");

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/wholesaler/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update order status");

      await loadOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
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

      await loadOrders();
    } catch (error) {
      console.error("Error approving order:", error);
      alert("Failed to approve order");
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

  const filteredOrders = orders;

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
            className="flex items-center px-4 py-3 text-purple-600 bg-purple-50 rounded-lg"
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
          <h2 className="text-3xl font-bold text-gray-900">Retailer Orders</h2>
          <p className="text-gray-600 mt-1">Manage orders from retailers</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Filter by status:
            </span>
            <div className="flex gap-2">
              {[
                "all",
                "pending",
                "confirmed",
                "processing",
                "ready",
                "delivered",
                "cancelled",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <ShoppingBag size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.order_number}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Retailer: {order.retailer?.shop_name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {order.retailer?.profile?.email} •{" "}
                        {order.retailer?.profile?.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        ₹{order.total_amount.toLocaleString()}
                      </div>
                      <div
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                          statusColors[order.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {statusIcons[order.status]}
                        <span>{order.status.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Order Items ({order.items?.length || 0})
                    </h4>
                    <div className="space-y-2">
                      {order.items?.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {item.product_name} × {item.quantity}
                          </span>
                          <span className="font-medium text-gray-900">
                            ₹{item.subtotal.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {order.items && order.items.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 text-xs text-gray-500 mb-4">
                    <span>
                      Ordered: {new Date(order.created_at).toLocaleString()}
                    </span>
                    <span>•</span>
                    <span>Payment: {order.payment_status}</span>
                  </div>

                  <div className="flex gap-2">
                    {order.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApproveOrder(order.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Approve Order
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(order.id, "cancelled")
                          }
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {order.status === "confirmed" && (
                      <button
                        onClick={() =>
                          handleStatusChange(order.id, "processing")
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Start Processing
                      </button>
                    )}
                    {order.status === "processing" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "ready")}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        Mark as Ready
                      </button>
                    )}
                    {order.status === "ready" && (
                      <button
                        onClick={() =>
                          handleStatusChange(order.id, "delivered")
                        }
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Mark as Delivered
                      </button>
                    )}
                    <Link
                      href={`/wholesaler/orders/${order.id}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
