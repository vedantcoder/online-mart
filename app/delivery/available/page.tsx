"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { DeliveryPerson } from "@/lib/models/DeliveryPerson";
import { Home, Package, TrendingUp, Clock, LogOut } from "lucide-react";
import toast from "react-hot-toast";

export default function DeliveryAvailablePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) return;
      const data = await res.json();
      const all: any[] = data.orders || [];
      setOrders(all.filter((o) => o.status === "shipped"));
    } catch (e) {
      console.error("Load available orders error", e);
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

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Marked as ${newStatus.replace(/_/g, " ")}`);
      loadOrders();
    } catch (e: any) {
      toast.error(e.message || "Error updating status");
    }
  };

  if (!user || user.getRole() !== "delivery") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  const delivery = user as DeliveryPerson;
  const addrLine = (addr: Record<string, unknown> | null | undefined) => {
    if (!addr || typeof addr !== "object") return "";
    const g = (k: string) =>
      (addr as Record<string, unknown>)[k] as string | undefined;
    const city = g("city");
    const state = g("state");
    const pincode = g("pincode") || g("pinCode") || g("postal_code");
    return [city, state, pincode].filter(Boolean).join(", ");
  };

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
            className="flex items-center px-4 py-3 text-orange-600 bg-orange-50 rounded-lg"
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
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
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
          <h2 className="text-3xl font-bold text-gray-900">
            Available Deliveries
          </h2>
          <p className="text-gray-600 mt-1">
            Orders assigned to you and ready for pickup.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No assigned orders
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">
                      Order #{o.order_number}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full bg-cyan-100 text-cyan-800">
                      assigned
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Total ₹{o.total_amount}
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {o?.payment?.method === "cod" ||
                      o?.payment_method === "cash_on_delivery"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </span>
                  </p>
                  {addrLine(o.delivery_address) ? (
                    <p className="text-xs text-gray-500 mb-3">
                      {addrLine(o.delivery_address)}
                    </p>
                  ) : null}
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(o.id, "out_for_delivery")}
                      className="px-3 py-2 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
                    >
                      Start Delivery
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
