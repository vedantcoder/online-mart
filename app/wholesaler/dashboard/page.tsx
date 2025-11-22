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
} from "lucide-react";

type TabKey = "pending" | "orders" | "profile";

const Tabs: React.FC<{ active: TabKey; onChange: (t: TabKey) => void }> = ({
  active,
  onChange,
}) => {
  return (
    <nav className="flex gap-2 mb-6">
      <button
        className={`px-4 py-2 rounded ${
          active === "pending"
            ? "bg-blue-600 text-white"
            : "bg-gray-100"
        }`}
        onClick={() => onChange("pending")}
      >
        Pending Orders
      </button>
      <button
        className={`px-4 py-2 rounded ${
          active === "orders" ? "bg-blue-600 text-white" : "bg-gray-100"
        }`}
        onClick={() => onChange("orders")}
      >
        Orders
      </button>
      <button
        className={`px-4 py-2 rounded ${
          active === "profile" ? "bg-blue-600 text-white" : "bg-gray-100"
        }`}
        onClick={() => onChange("profile")}
      >
        Profile
      </button>
      <Link
        href="/wholesaler/orders"
        className="ml-auto underline text-sm text-gray-700"
      >
        Go to Orders page
      </Link>
    </nav>
  );
};

export default function WholesalerDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [tab, setTab] = useState<TabKey>("pending");

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

        <Tabs active={tab} onChange={setTab} />

        <section>
          {tab === "pending" && (
            <div>
              <h2 className="text-lg font-medium mb-3">Pending orders</h2>
              <div className="space-y-3">
                <div className="p-4 border rounded bg-white">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">Order #WD-1001</div>
                      <div className="text-sm text-gray-600">
                        Retailer: Acme Grocery
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">Qty: 120</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Placed: 2 hours ago
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-1 bg-green-600 text-white rounded text-sm">
                      Accept
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded text-sm">
                      Reject
                    </button>
                  </div>
                </div>

                <div className="p-4 border rounded bg-white text-sm text-gray-600">
                  No more pending orders. This is placeholder UI — wire up real
                  data from your orders API.
                </div>
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div>
              <h2 className="text-lg font-medium mb-3">All orders</h2>
              <div className="grid gap-3">
                <div className="p-4 border rounded bg-white">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">Order #WD-0999</div>
                      <div className="text-sm text-gray-600">
                        Retailer: GreenMart
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">Status: Delivered</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Delivered: 2 days ago
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "profile" && (
            <div>
              <h2 className="text-lg font-medium mb-3">Profile</h2>
              <div className="p-4 border rounded bg-white text-sm text-gray-700">
                Name: Wholesale Co.
                <br />
                Email: wholesaler@example.com
                <br />
                Address: 123 Supply Rd.
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
