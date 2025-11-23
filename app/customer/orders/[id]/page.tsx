"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
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
import { loadStripe } from "@stripe/stripe-js";

interface OrderItem {
  id: string;
  product_id?: string;
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
  payment_method?: string;
  payment_gateway?: string;
  payment_gateway_payment_id?: string;
  payment_gateway_order_id?: string;
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

interface PayOrCODButtonProps {
  orderId: string;
  disabled?: boolean;
}

const PayOrCODButton: React.FC<PayOrCODButtonProps> = ({
  orderId,
  disabled,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCOD = async () => {
    try {
      setLoading("cod");
      setError(null);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_status: "pending_cod",
          payment_method: "cash_on_delivery",
        }),
      });
      if (!res.ok) throw new Error("Failed to set COD");
      window.location.reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to set COD");
    } finally {
      setLoading(null);
    }
  };

  const handleOnlinePay = async () => {
    try {
      setLoading("online");
      setError(null);

      // Create payment intent
      const createRes = await fetch(`/api/payments/stripe/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      if (!createRes.ok) throw new Error("Failed to create payment");
      const data: { sessionUrl: string } = await createRes.json();

      // Redirect to Stripe Checkout
      if (!data.sessionUrl) {
        throw new Error("Payment initialization failed");
      }
      window.location.href = data.sessionUrl;
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Payment initialization failed"
      );
      setLoading(null);
    }
  };

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          disabled={disabled || loading !== null}
          onClick={handleCOD}
          className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          {loading === "cod" ? "Setting..." : "Cash on Delivery"}
        </button>
        <button
          disabled={disabled || loading !== null}
          onClick={handleOnlinePay}
          className="px-4 py-2 text-sm rounded-md bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {loading === "online" ? "Processing..." : "Pay Online"}
        </button>
      </div>
    </div>
  );
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewedProductIds, setReviewedProductIds] = useState<Set<string>>(
    new Set()
  );
  const [reviewForms, setReviewForms] = useState<
    Record<
      string,
      {
        rating: number;
        title: string;
        comment: string;
        open: boolean;
        submitting: boolean;
      }
    >
  >({});
  const [orderQueries, setOrderQueries] = useState<any[]>([]);
  const [newQuery, setNewQuery] = useState({ subject: "", description: "" });

  const loadOrder = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      const json = await res.json();
      setOrder(json.order);
      // After order loads, fetch reviews and queries
      const items: OrderItem[] = json.order?.items || [];
      const productIds = items.map((i: any) => i.product_id).filter(Boolean);
      if (user && productIds.length > 0) {
        const { data: fb } = await supabase
          .from("feedback")
          .select("product_id")
          .eq("customer_id", user.getId ? user.getId() : user.id)
          .in("product_id", productIds);
        const setIds = new Set<string>(
          (fb || []).map((r: any) => r.product_id)
        );
        setReviewedProductIds(setIds);
        // initialize per-item review forms
        const rf: Record<string, any> = {};
        productIds.forEach((pid: string) => {
          rf[pid] = {
            rating: 5,
            title: "",
            comment: "",
            open: false,
            submitting: false,
          };
        });
        setReviewForms(rf);
      }
      // Load queries for this order for the customer
      try {
        const qRes = await fetch(`/api/queries`, { cache: "no-store" });
        if (qRes.ok) {
          const q = await qRes.json();
          const list = (q.queries || []).filter(
            (qq: any) => qq.order_id === json.order.id
          );
          setOrderQueries(list);
        }
      } catch {}
    } catch (error) {
      console.error("Error loading order:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id, user]);

  // Handle Stripe payment success callback
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentSuccess = searchParams.get("payment_success");
    const paymentIntentId = searchParams.get("payment_intent");
    const sessionId = searchParams.get("session_id");

    if (
      paymentSuccess === "true" &&
      (paymentIntentId || sessionId) &&
      params.id
    ) {
      // Verify payment with backend
      fetch(`/api/payments/stripe/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: params.id,
          payment_intent_id: paymentIntentId,
          session_id: sessionId,
        }),
      })
        .then((res) => {
          if (res.ok) {
            // Remove query params and reload order
            window.history.replaceState({}, "", window.location.pathname);
            loadOrder();
          }
        })
        .catch((err) => console.error("Payment verification failed:", err));
    }
  }, [params.id, loadOrder]);

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
    // Simplified per spec: pending -> packed -> shipped -> assigned -> out_for_delivery -> delivered
    const allSteps = [
      { key: "pending", label: "Order Placed" },
      { key: "packed", label: "Packed" },
      { key: "shipped", label: "Shipped" },
      { key: "assigned", label: "Assigned" },
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

  const toggleReviewForm = (productId: string) => {
    setReviewForms((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], open: !prev[productId]?.open },
    }));
  };

  const submitReview = async (
    productId: string,
    data: { rating: number; title: string; comment: string }
  ) => {
    if (!order) return;
    try {
      setReviewForms((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], submitting: true },
      }));
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          order_id: order.id,
          rating: data.rating,
          review_text: [data.title, data.comment].filter(Boolean).join(" - "),
        }),
      });
      if (!res.ok) {
        let msg = "API error";
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {}
        throw new Error(msg);
      }
      toast.success("Thanks for your review!");
      setReviewedProductIds(
        (s) => new Set<string>([...Array.from(s), productId])
      );
      setReviewForms((prev) => ({
        ...prev,
        [productId]: {
          rating: 5,
          title: "",
          comment: "",
          open: false,
          submitting: false,
        },
      }));
    } catch (e) {
      console.error(e);
      toast.error("Failed to submit review");
      setReviewForms((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], submitting: false },
      }));
    }
  };

  const submitOrderQuery = async () => {
    if (!newQuery.subject.trim() || !newQuery.description.trim()) {
      toast.error("Please add subject and description");
      return;
    }
    try {
      const res = await fetch(`/api/queries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order?.id,
          subject: newQuery.subject.trim(),
          description: newQuery.description.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed to submit query");
      toast.success("Query submitted. Retailer will contact you.");
      setNewQuery({ subject: "", description: "" });
      // refresh list
      const qRes = await fetch(`/api/queries`, { cache: "no-store" });
      if (qRes.ok) {
        const q = await qRes.json();
        const list = (q.queries || []).filter(
          (qq: any) => qq.order_id === order?.id
        );
        setOrderQueries(list);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to create query");
    }
  };

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

            {/* Order Items + Reviews */}
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
                    {/* Write Review - available after delivery */}
                    {order.status === "delivered" && item.product_id && (
                      <div className="mt-3">
                        {reviewedProductIds.has(item.product_id) ? (
                          <span className="text-sm text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded">
                            Reviewed
                          </span>
                        ) : (
                          <div>
                            <button
                              onClick={() => toggleReviewForm(item.product_id!)}
                              className="text-sm text-orange-700 hover:text-orange-800 font-medium"
                            >
                              {reviewForms[item.product_id!]?.open
                                ? "Close Review"
                                : "Write a Review"}
                            </button>
                            {reviewForms[item.product_id!]?.open && (
                              <div className="mt-2 bg-gray-50 p-3 rounded">
                                <div className="flex items-center gap-2 mb-2">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <button
                                      key={s}
                                      type="button"
                                      onClick={() =>
                                        setReviewForms((prev) => ({
                                          ...prev,
                                          [item.product_id!]: {
                                            ...prev[item.product_id!],
                                            rating: s,
                                          },
                                        }))
                                      }
                                      className="text-yellow-400"
                                    >
                                      {s <=
                                      (reviewForms[item.product_id!]?.rating ||
                                        5)
                                        ? "★"
                                        : "☆"}
                                    </button>
                                  ))}
                                </div>
                                <input
                                  type="text"
                                  placeholder="Title (optional)"
                                  value={
                                    reviewForms[item.product_id!]?.title || ""
                                  }
                                  onChange={(e) =>
                                    setReviewForms((prev) => ({
                                      ...prev,
                                      [item.product_id!]: {
                                        ...prev[item.product_id!],
                                        title: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full mb-2 px-3 py-2 border rounded"
                                />
                                <textarea
                                  rows={3}
                                  placeholder="Your review"
                                  value={
                                    reviewForms[item.product_id!]?.comment || ""
                                  }
                                  onChange={(e) =>
                                    setReviewForms((prev) => ({
                                      ...prev,
                                      [item.product_id!]: {
                                        ...prev[item.product_id!],
                                        comment: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full mb-2 px-3 py-2 border rounded"
                                />
                                <button
                                  disabled={
                                    reviewForms[item.product_id!]?.submitting
                                  }
                                  onClick={() =>
                                    submitReview(item.product_id!, {
                                      rating:
                                        reviewForms[item.product_id!]?.rating ||
                                        5,
                                      title:
                                        reviewForms[item.product_id!]?.title ||
                                        "",
                                      comment:
                                        reviewForms[item.product_id!]
                                          ?.comment || "",
                                    })
                                  }
                                  className="px-4 py-2 bg-orange-600 text-white rounded disabled:opacity-50"
                                >
                                  {reviewForms[item.product_id!]?.submitting
                                    ? "Submitting..."
                                    : "Submit Review"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
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
                <p>
                  {order.delivery_address.street ||
                    order.delivery_address["street_address"] ||
                    ""}
                </p>
                <p>
                  {order.delivery_address.city ||
                    order.delivery_address["city"] ||
                    ""}
                  {order.delivery_address.state ||
                  order.delivery_address["state"]
                    ? `, ${
                        order.delivery_address.state ||
                        order.delivery_address["state"]
                      }`
                    : ""}
                </p>
                <p>
                  {order.delivery_address.pincode ||
                  order.delivery_address["pincode"]
                    ? `PIN: ${
                        order.delivery_address.pincode ||
                        order.delivery_address["pincode"]
                      }`
                    : ""}
                </p>
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
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Method</span>
                  <span className="font-medium text-gray-900">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800 border border-gray-200">
                      {order.payment_method === "cash_on_delivery" ||
                      order.payment_method === "cod"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium text-gray-900">
                    ₹{order.total_amount.toFixed(2)}
                  </span>
                </div>
                {order.payment_gateway && order.payment_gateway_payment_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gateway Ref</span>
                    <span className="text-xs text-gray-700 truncate max-w-40">
                      {order.payment_gateway_payment_id}
                    </span>
                  </div>
                )}
                {order.payment_status !== "completed" && (
                  <div className="pt-3">
                    <PayOrCODButton
                      orderId={order.id}
                      disabled={order.payment_status === "completed"}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Order Queries */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Queries
              </h2>
              {orderQueries.length > 0 && (
                <div className="mb-4 space-y-3">
                  {orderQueries.map((q) => (
                    <div key={q.id} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{q.subject}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            q.status === "resolved"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          {q.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        {q.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Raised on {new Date(q.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Subject"
                  value={newQuery.subject}
                  onChange={(e) =>
                    setNewQuery((p) => ({ ...p, subject: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded"
                />
                <textarea
                  rows={3}
                  placeholder="Describe your issue"
                  value={newQuery.description}
                  onChange={(e) =>
                    setNewQuery((p) => ({ ...p, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded"
                />
                <button
                  onClick={submitOrderQuery}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Submit Query
                </button>
                <p className="text-xs text-gray-500">
                  Retailer will contact you regarding your queries!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
