"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price_per_unit: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  delivery_person_id?: string | null;
  payment_status: string;
  payment_method: string;
  payment?: { method?: string };
  total_amount: number;
  created_at: string;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  delivery_address: Record<string, string>;
  customer_name?: string;
  customer: {
    id: string;
    street_address: string;
    city: string;
    state: string;
    pincode: string;
    profiles?: { full_name?: string };
  };
  delivery_person: {
    id: string;
    profiles: {
      full_name: string;
      phone: string;
      email: string;
    };
  } | null;
  order_items: OrderItem[];
}

interface DeliveryPerson {
  id: string;
  profiles: {
    full_name: string;
    phone: string;
    email: string;
  };
}

interface CustomerQuery {
  id: string;
  order_id: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
}

export default function RetailerOrdersPage() {
  const router = useRouter();
  const { user, isLoading, initialize } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState("");
  const [queriesByOrder, setQueriesByOrder] = useState<
    Record<string, CustomerQuery[]>
  >({});

  type DeliveryAddr = {
    street?: string;
    street_address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };

  const renderOrderAddress = (
    addr: unknown,
    customer?: Order["customer"]
  ): string => {
    const a = (addr || {}) as DeliveryAddr;
    const street = a.street || a.street_address;
    const city = a.city;
    const state = a.state;
    const pin = a.pincode;
    if (street || city || state || pin) {
      return `${street ?? ""}${city || state ? ", " : ""}${city ?? ""}$${""}${
        state ? `, ${state}` : ""
      }${pin ? ` - ${pin}` : ""}`.replace("$", "");
    }
    if (customer) {
      return `${customer.street_address}, ${customer.city}, ${customer.state} - ${customer.pincode}`;
    }
    return "";
  };

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && (!user || user.getRole() !== "retailer")) {
      router.push("/login?role=retailer");
    }
  }, [user, isLoading, router]);

  // Moved below loadOrders definition to avoid TDZ error

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      const list: Order[] = data.orders || [];
      setOrders(list);
      // Load queries for these orders
      loadQueries(list.map((o) => o.id));
    } catch (error) {
      console.error("Load orders error:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  // Run after loadOrders is defined
  useEffect(() => {
    if (!isLoading && user && user.getRole() === "retailer") {
      loadOrders();
      loadDeliveryPersons();
    }
  }, [isLoading, user, loadOrders]);

  const loadDeliveryPersons = async () => {
    try {
      const res = await fetch("/api/delivery-persons");
      if (!res.ok) return;
      const data = await res.json();
      setDeliveryPersons(data.deliveryPersons || []);
    } catch (error) {
      console.error("Load delivery persons error:", error);
    }
  };

  const loadQueries = async (orderIds: string[]) => {
    try {
      const res = await fetch("/api/queries", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const all: CustomerQuery[] = (data.queries || []) as CustomerQuery[];
      const map: Record<string, CustomerQuery[]> = {};
      orderIds.forEach((id) => (map[id] = []));
      all.forEach((q) => {
        if (map[q.order_id] !== undefined) {
          map[q.order_id].push(q);
        }
      });
      setQueriesByOrder(map);
    } catch (e) {
      console.error("Load queries error:", e);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update order status");

      toast.success("Order status updated successfully");
      loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error("Update status error:", error);
      toast.error("Failed to update order status");
    }
  };

  const resolveQuery = async (queryId: string) => {
    try {
      const res = await fetch("/api/queries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: queryId, status: "resolved" }),
      });
      if (!res.ok) throw new Error("Failed to resolve query");
      toast.success("Marked resolved");
      // refresh queries for current orders
      loadQueries(orders.map((o) => o.id));
    } catch (e) {
      console.error(e);
      toast.error("Failed to update query");
    }
  };

  const assignDeliveryPerson = async (orderId: string) => {
    if (!selectedDeliveryPerson) {
      toast.error("Please select a delivery person");
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delivery_person_id: selectedDeliveryPerson }),
      });

      if (!res.ok) throw new Error("Failed to assign delivery person");

      toast.success("Delivery person assigned successfully");
      loadOrders();
      setSelectedOrder(null);
      setSelectedDeliveryPerson("");
    } catch (error) {
      console.error("Assign delivery person error:", error);
      toast.error("Failed to assign delivery person");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-indigo-100 text-indigo-800",
      packed: "bg-purple-100 text-purple-800",
      shipped: "bg-cyan-100 text-cyan-800",
      out_for_delivery: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Simplified flow per spec: retailer only sets packed, shipped, assigns agent (assigned auto when agent chosen)
  const getNextStatus = (currentStatus: string): string[] => {
    const statusFlow: Record<string, string[]> = {
      pending: ["packed"], // collapse confirm+processing into packed
      packed: ["shipped"],
    };
    return statusFlow[currentStatus] || [];
  };

  if (isLoading || !user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push("/retailer/dashboard")}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Customer Orders
            </h1>
            <p className="text-gray-600 mt-1">
              Manage orders received from customers
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No orders yet</p>
            <p className="text-gray-500 mt-2">
              Orders from customers will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Order #{order.order_number}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      Placed on{" "}
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      Customer:{" "}
                      {order.customer_name ||
                        order.customer?.profiles?.full_name ||
                        "Unknown Customer"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{order.total_amount.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      <span className="text-sm text-gray-600">
                        Payment: {order.payment_status}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        {order.payment_method === "cash_on_delivery" ||
                        order.payment?.method === "cod"
                          ? "Cash on Delivery"
                          : "Online Payment"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-b border-gray-200 py-4 mb-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 py-2">
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                        {item.product_image ? (
                          <Image
                            src={item.product_image}
                            alt={item.product_name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ₹
                          {item.price_per_unit.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ₹{item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Delivery Address - prefer order.delivery_address, fallback to customer profile fields */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Delivery Address
                  </h4>
                  <p className="text-gray-700">
                    {renderOrderAddress(order.delivery_address, order.customer)}
                  </p>
                </div>

                {/* Customer Queries for this Order */}
                {queriesByOrder[order.id] &&
                  queriesByOrder[order.id].length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Customer Queries
                      </h4>
                      <div className="space-y-2">
                        {queriesByOrder[order.id].map((q) => (
                          <div
                            key={q.id}
                            className="border rounded p-3 flex items-start justify-between gap-3"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {q.subject}
                              </p>
                              <p className="text-sm text-gray-700">
                                {q.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {q.status} •{" "}
                                {new Date(q.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="shrink-0">
                              {q.status !== "resolved" ? (
                                <button
                                  onClick={() => resolveQuery(q.id)}
                                  className="px-3 py-1 text-sm bg-green-600 text-white rounded"
                                >
                                  Mark Resolved
                                </button>
                              ) : (
                                <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded">
                                  Resolved
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Delivery Person */}
                {order.delivery_person && (
                  <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <Truck size={16} />
                      Delivery Agent
                    </h4>
                    <p className="text-gray-700">
                      {order.delivery_person.profiles.full_name} -{" "}
                      {order.delivery_person.profiles.phone}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {getNextStatus(order.status).map((nextStatus, idx) => {
                    // Deduplicate accidental multiple renders
                    const key = `${order.id}-${nextStatus}-${idx}`;
                    return (
                      <button
                        key={key}
                        onClick={() => updateOrderStatus(order.id, nextStatus)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Mark as {nextStatus.replace(/_/g, " ")}
                      </button>
                    );
                  })}

                  {order.status === "shipped" &&
                    !order.delivery_person &&
                    !order.delivery_person_id && (
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Assign Delivery Agent
                      </button>
                    )}

                  {/* Shipped action is already provided by getNextStatus; avoid duplicate button */}

                  {order.status === "shipped" &&
                    (order.delivery_person || order.delivery_person_id) && (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg cursor-not-allowed"
                      >
                        Awaiting Pickup
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assign Delivery Person Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Assign Delivery Agent
              </h3>
              <p className="text-gray-600 mb-4">
                Order #{selectedOrder.order_number}
              </p>

              {deliveryPersons.length === 0 ? (
                <p className="text-red-600 mb-4">
                  No delivery agents available
                </p>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Delivery Agent
                  </label>
                  <select
                    value={selectedDeliveryPerson}
                    onChange={(e) => setSelectedDeliveryPerson(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Choose an agent...</option>
                    {deliveryPersons.map((dp) => (
                      <option key={dp.id} value={dp.id}>
                        {dp.profiles.full_name} - {dp.profiles.phone}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setSelectedDeliveryPerson("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => assignDeliveryPerson(selectedOrder.id)}
                  disabled={!selectedDeliveryPerson}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
