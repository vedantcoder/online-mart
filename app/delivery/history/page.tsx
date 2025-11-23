"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { DeliveryPerson } from "@/lib/models/DeliveryPerson";
import { Home, Package, TrendingUp, Clock, LogOut } from "lucide-react";

export default function DeliveryHistoryPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) return;
      const data = await res.json();
      const all: any[] = data.orders || [];
      setOrders(all.filter((o) => o.status === "delivered"));
    } catch (e) {
      console.error("Load history orders error", e);
    }
  }, []);

  useEffect(() => {
    if (!user || user.getRole() !== "delivery") {
      router.push("/login?role=delivery");
      return;
    }
    loadOrders();
  }, [user, router, loadOrders]);

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
          <Link
            href="/delivery/dashboard"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <Home size={20} className="mr-3" />
            Dashboard
          </Link>
          <Link
            href="/delivery/available"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <Package size={20} className="mr-3" />
            Available Deliveries
          </Link>
          <Link
            href="/delivery/active"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <Clock size={20} className="mr-3" />
            Active Delivery
          </Link>
          <Link
            href="/delivery/history"
            className="flex items-center px-4 py-3 text-orange-600 bg-orange-50 rounded-lg"
          >
            <TrendingUp size={20} className="mr-3" />
            Delivery History
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

      {/* Main */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Delivery History</h2>
          <p className="text-gray-600 mt-1">Completed deliveries.</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No completed deliveries yet
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between text-sm border-b last:border-b-0 pb-2"
                >
                  <span className="text-gray-900 font-medium">
                    Order #{o.order_number}
                    {o?.total_amount ? (
                      <span className="ml-2 text-gray-800 font-semibold">
                        ₹{o.total_amount}
                      </span>
                    ) : null}
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                      {o?.payment?.method === "cod" ||
                      o?.payment_method === "cash_on_delivery"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </span>
                  </span>
                  <span className="text-green-700 font-semibold">
                    Delivered
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
