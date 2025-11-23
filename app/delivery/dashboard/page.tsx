"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { DeliveryPerson } from "@/lib/models/DeliveryPerson";
import {
  Home,
  Package,
  TrendingUp,
  Clock,
  LogOut,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function DeliveryDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [assigned, setAssigned] = useState<any[]>([]); // shipped & assigned to me
  const [active, setActive] = useState<any[]>([]); // out_for_delivery
  const [history, setHistory] = useState<any[]>([]); // delivered

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) return;
      const data = await res.json();
      const all: any[] = data.orders || [];
      setAssigned(all.filter((o) => o.status === "shipped"));
      setActive(all.filter((o) => o.status === "out_for_delivery"));
      setHistory(all.filter((o) => o.status === "delivered"));
    } catch (e) {
      console.error("Load delivery orders error", e);
    }
  }, []);

  const refreshAll = useCallback(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!user || user.getRole() !== "delivery") {
      router.push("/login?role=delivery");
      return;
    }
    refreshAll();
  }, [user, router, refreshAll]);

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

  const toggleAvailability = async () => {
    try {
      setLoadingAvail(true);
      const res = await fetch("/api/delivery-persons/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: !isAvailable }),
      });
      if (!res.ok) throw new Error("Failed to update availability");
      setIsAvailable(!isAvailable);
      toast.success(`Availability set to ${!isAvailable ? "ON" : "OFF"}`);
    } catch (e: any) {
      toast.error(e.message || "Error updating availability");
    } finally {
      setLoadingAvail(false);
    }
  };

  const claimOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delivery_person_id: delivery.id }),
      });
      if (!res.ok) throw new Error("Failed to claim order");
      toast.success("Order claimed");
      refreshAll();
    } catch (e: any) {
      toast.error(e.message || "Error claiming order");
    }
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
      refreshAll();
    } catch (e: any) {
      toast.error(e.message || "Error updating status");
    }
  };

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
            className="flex items-center px-4 py-3 text-orange-600 bg-orange-50 rounded-lg"
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
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <TrendingUp size={20} className="mr-3" />
            Delivery History
          </Link>
          {/* Update Location removed as per spec */}
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
            <button
              disabled={loadingAvail}
              onClick={toggleAvailability}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                isAvailable
                  ? "bg-green-600 text-white"
                  : "bg-gray-300 text-gray-700"
              } disabled:opacity-50`}
            >
              {loadingAvail
                ? "Saving..."
                : isAvailable
                ? "Available"
                : "Set Available"}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Deliveries</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {assigned.length}
                </p>
              </div>
              <Package size={32} className="text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Delivery</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {active.length || "None"}
                </p>
              </div>
              <Clock size={32} className="text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {
                    history.filter(
                      (h) =>
                        h.actual_delivery &&
                        new Date(h.actual_delivery).toDateString() ===
                          new Date().toDateString()
                    ).length
                  }
                </p>
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

        {/* Available Deliveries (assigned to me; status shipped) */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Available Deliveries
          </h3>
          {assigned.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p>No assigned orders awaiting pickup</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assigned.map((o) => (
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
                    Total ₹{o.total_amount}{" "}
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

        {/* Active (out for delivery) */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Active Delivery
          </h3>
          {active.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active deliveries
            </div>
          ) : (
            <div className="space-y-4">
              {active.map((o) => (
                <div key={o.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">
                      Order #{o.order_number}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                      out for delivery
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Total ₹{o.total_amount}{" "}
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
                      onClick={() => updateStatus(o.id, "delivered")}
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
                    >
                      <CheckCircle size={14} />
                      Mark Delivered
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Deliveries
          </h3>
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No completed deliveries yet
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between text-sm border-b last:border-b-0 pb-2"
                >
                  <span className="text-gray-900 font-medium">
                    Order #{h.order_number}
                    {h?.total_amount ? (
                      <span className="ml-2 text-gray-800 font-semibold">
                        ₹{h.total_amount}
                      </span>
                    ) : null}
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                      {h?.payment?.method === "cod" ||
                      h?.payment_method === "cash_on_delivery"
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
