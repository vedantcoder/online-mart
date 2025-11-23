"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { supabase } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  User,
  Phone,
  Truck,
  CheckCircle2,
} from "lucide-react";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price_per_unit: number;
  subtotal: number;
}

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  delivery_charges: number;
  discount_amount: number;
  delivery_address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  created_at: string;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  items: OrderItem[];
  seller?: {
    full_name: string;
    phone: string;
  };
  delivery_person?: {
    full_name: string;
    phone: string;
  };
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          items:order_items(*),
          seller:profiles!orders_seller_id_fkey(full_name, phone),
          delivery_person:profiles!orders_delivery_person_id_fkey(full_name, phone)
        `
        )
        .eq("id", params.id)
        .eq("customer_id", user?.getId())
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error("Error loading order:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id, user]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.getRole() !== "customer") {
      router.push(`/${user?.getRole()}/dashboard`);
      return;
    }

    loadOrder();
  }, [isAuthenticated, user, router, params.id, loadOrder]);

  const getStatusSteps = () => {
    const allSteps = [
      { key: "pending", label: "Order Placed" },
      { key: "confirmed", label: "Confirmed" },
      { key: "processing", label: "Processing" },
      { key: "packed", label: "Packed" },
      { key: "shipped", label: "Shipped" },
      { key: "out_for_delivery", label: "Out for Delivery" },
      { key: "delivered", label: "Delivered" },
    ];

    const currentIndex = allSteps.findIndex(
      (step) => step.key === order?.status
    );
    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <button
            onClick={() => router.push("/customer/orders")}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/customer/orders")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Orders
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Order #{order.order_number}
              </h1>
              <p className="text-gray-600">
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ₹{order.total_amount.toFixed(2)}
              </div>
              <span
                className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mt-2 ${
                  order.status === "delivered"
                    ? "bg-green-100 text-green-800"
                    : order.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {order.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Progress */}
            {order.status !== "cancelled" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Order Progress
                </h2>
                <div className="relative">
                  {statusSteps.map((step, index) => (
                    <div
                      key={step.key}
                      className="flex items-start mb-8 last:mb-0"
                    >
                      <div className="flex flex-col items-center mr-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.completed
                              ? "bg-green-500 text-white"
                              : step.current
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle2 size={20} />
                          ) : (
                            <span className="text-sm font-semibold">
                              {index + 1}
                            </span>
                          )}
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div
                            className={`w-0.5 h-12 ${
                              step.completed ? "bg-green-500" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pt-2">
                        <h3
                          className={`font-semibold ${
                            step.completed || step.current
                              ? "text-gray-900"
                              : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <Package size={20} className="inline mr-2" />
                Order Items ({order.items.length})
              </h2>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.product_name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹{item.subtotal.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          ₹{item.price_per_unit.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t mt-6 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>₹{order.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span>₹{order.delivery_charges.toFixed(2)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>₹{order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <MapPin size={20} className="inline mr-2" />
                Delivery Address
              </h2>
              <div className="text-gray-600 space-y-1">
                <p>{order.delivery_address.street}</p>
                <p>
                  {order.delivery_address.city}, {order.delivery_address.state}
                </p>
                <p>PIN: {order.delivery_address.pincode}</p>
              </div>
            </div>

            {/* Delivery Information */}
            {order.estimated_delivery && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  <Calendar size={20} className="inline mr-2" />
                  Delivery Timeline
                </h2>
                <div className="space-y-3">
                  {order.estimated_delivery && !order.actual_delivery && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Estimated Delivery
                      </p>
                      <p className="font-medium text-gray-900">
                        {new Date(order.estimated_delivery).toLocaleDateString(
                          "en-IN",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  )}
                  {order.actual_delivery && (
                    <div>
                      <p className="text-sm text-gray-600">Delivered On</p>
                      <p className="font-medium text-gray-900">
                        {new Date(order.actual_delivery).toLocaleDateString(
                          "en-IN",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Seller Information */}
            {order.seller && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  <User size={20} className="inline mr-2" />
                  Seller Details
                </h2>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">
                    {order.seller.full_name}
                  </p>
                  {order.seller.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={16} />
                      <span>{order.seller.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Person */}
            {order.delivery_person && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  <Truck size={20} className="inline mr-2" />
                  Delivery Partner
                </h2>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">
                    {order.delivery_person.full_name}
                  </p>
                  {order.delivery_person.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={16} />
                      <span>{order.delivery_person.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <CreditCard size={20} className="inline mr-2" />
                Payment
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`font-medium ${
                      order.payment_status === "completed"
                        ? "text-green-600"
                        : order.payment_status === "failed"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {order.payment_status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium text-gray-900">
                    ₹{order.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
