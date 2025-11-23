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
  Phone,
  Mail,
  MapPin,
  Store,
} from "lucide-react";

interface Retailer {
  id: string;
  shop_name: string;
  shop_city: string;
  shop_state: string;
  profile: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
}

export default function WholesalerRetailersPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.getRole() !== "wholesaler") {
      router.push("/login?role=wholesaler");
      return;
    }

    loadRetailers();
  }, [user, router]);

  const loadRetailers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/wholesaler/retailers");
      if (!response.ok) throw new Error("Failed to load retailers");

      const data = await response.json();
      setRetailers(data.retailers || []);
    } catch (error) {
      console.error("Error loading retailers:", error);
    } finally {
      setLoading(false);
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
            className="flex items-center px-4 py-3 text-purple-600 bg-purple-50 rounded-lg"
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
            Connected Retailers
          </h2>
          <p className="text-gray-600 mt-1">
            Retailers who have ordered from you
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading retailers...</p>
          </div>
        ) : retailers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">
              No retailers have ordered from you yet
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Once retailers place orders, they will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {retailers.map((retailer) => (
              <div
                key={retailer.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Store size={24} className="text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">
                      {retailer.shop_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {retailer.profile?.full_name}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail size={16} className="mr-2" />
                    <span>{retailer.profile?.email}</span>
                  </div>

                  {retailer.profile?.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone size={16} className="mr-2" />
                      <span>{retailer.profile.phone}</span>
                    </div>
                  )}

                  {(retailer.shop_city || retailer.shop_state) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      <span>
                        {[retailer.shop_city, retailer.shop_state]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    href={`/wholesaler/orders?retailerId=${retailer.id}`}
                    className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    View Orders
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
