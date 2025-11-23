"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { supabase } from "@/lib/supabase/client";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  ChevronDown,
  ArrowLeft,
  MapPin,
  Package,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [customerAddress, setCustomerAddress] = useState<{
    street_address: string;
    city: string;
    state: string;
    pincode: string;
  } | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [cartSummary, setCartSummary] = useState<{
    items: number;
    subtotal: number;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">(
    "online"
  );

  const userId = user ? (user as unknown as { id?: string }).id : undefined;

  useEffect(() => {
    if (!userId) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch customer address
        const { data: addressData, error: addressErr } = await supabase
          .from("customers")
          .select("street_address, city, state, pincode")
          .eq("id", userId)
          .single();

        if (!addressErr && addressData) {
          setCustomerAddress(addressData);
        }

        // Fetch cart summary
        const { data: cart, error: cartErr } = await supabase
          .from("carts")
          .select(
            `
            id,
            items:cart_items(
              quantity,
              price_at_addition
            )
          `
          )
          .eq("customer_id", userId)
          .single();

        if (!cartErr && cart && cart.items) {
          const items = cart.items.length;
          const subtotal = cart.items.reduce(
            (
              sum: number,
              item: { price_at_addition: number; quantity: number }
            ) => sum + item.price_at_addition * item.quantity,
            0
          );
          setCartSummary({ items, subtotal });
        } else {
          toast.error("Cart is empty");
          router.push("/customer/cart");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load checkout data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, router]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerAddress) {
      toast.error("Address not found");
      return;
    }

    setCheckoutLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delivery_address: {
            street: customerAddress.street_address,
            city: customerAddress.city,
            state: customerAddress.state,
            pincode: customerAddress.pincode,
          },
          delivery_notes: deliveryNotes,
          payment_method:
            paymentMethod === "cod" ? "cash_on_delivery" : "online",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Checkout failed");
      }

      const data = await response.json();

      if (paymentMethod === "online") {
        const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!stripePublicKey) {
          throw new Error("Stripe not configured");
        }
        const stripe = await loadStripe(stripePublicKey);
        if (!stripe) throw new Error("Failed to load Stripe");

        const clientSecret = data?.stripe?.clientSecret;
        if (!clientSecret) throw new Error("Payment initialization failed");

        const { error } = await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/customer/orders/${data.order.id}?payment_success=true`,
          },
        });
        if (error) throw new Error(error.message);
        return; // Stripe will redirect
      } else {
        toast.success("Order placed with Cash on Delivery!");
        router.push(`/customer/orders/${data.order.id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const taxRate = 0.18;
  const taxAmount = cartSummary ? cartSummary.subtotal * taxRate : 0;
  const deliveryCharges = cartSummary && cartSummary.subtotal >= 500 ? 0 : 50;
  const totalAmount = cartSummary
    ? cartSummary.subtotal + taxAmount + deliveryCharges
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/customer/dashboard"
                className="text-2xl font-bold text-orange-600"
              >
                Online-MART
              </Link>
            </div>

            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      router.push(
                        `/customer/products?search=${e.currentTarget.value}`
                      );
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <Link
                href="/customer/wishlist"
                className="relative hover:text-orange-600 transition"
              >
                <Heart size={24} className="text-gray-700" />
              </Link>

              <Link
                href="/customer/cart"
                className="relative hover:text-orange-600 transition"
              >
                <ShoppingCart size={24} className="text-gray-700" />
                {cartSummary && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartSummary.items}
                  </span>
                )}
              </Link>

              <div className="relative group">
                <button className="flex items-center space-x-2 hover:text-orange-600 transition">
                  <User size={24} className="text-gray-700" />
                  <ChevronDown size={16} className="text-gray-700" />
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-600">Hello,</p>
                    <p className="font-medium text-gray-900">
                      {(user
                        ? (user as unknown as { fullName?: string }).fullName
                        : undefined) || "Customer"}
                    </p>
                  </div>
                  <Link
                    href="/customer/orders"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/customer/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <button
            onClick={() => router.push("/customer/cart")}
            className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="text-orange-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">
                  Delivery Address
                </h2>
              </div>

              {customerAddress ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-gray-700 space-y-1">
                      <p className="font-medium">
                        {customerAddress.street_address}
                      </p>
                      <p>
                        {customerAddress.city}, {customerAddress.state}
                      </p>
                      <p>PIN: {customerAddress.pincode}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push("/customer/profile")}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Edit Address
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 mb-2">No delivery address found</p>
                  <button
                    onClick={() => router.push("/customer/profile")}
                    className="text-sm text-red-700 hover:text-red-800 font-medium underline"
                  >
                    Add address in profile
                  </button>
                </div>
              )}
            </div>

            {/* Delivery Notes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Package className="text-orange-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">
                  Delivery Instructions
                </h2>
              </div>

              <textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                rows={4}
                placeholder="Add any special instructions for delivery (e.g., gate code, preferred time, etc.)"
              />
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="text-orange-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">
                  Order Summary
                </h2>
              </div>

              {cartSummary && (
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartSummary.items} items)</span>
                    <span>₹{cartSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (18% GST)</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charges</span>
                    <span
                      className={
                        deliveryCharges === 0
                          ? "text-green-600 font-medium"
                          : ""
                      }
                    >
                      {deliveryCharges === 0
                        ? "Free"
                        : `₹${deliveryCharges.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between items-end">
                    <span className="font-bold text-lg text-gray-900">
                      Total
                    </span>
                    <span className="font-bold text-2xl text-gray-900">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Method Selection */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Select Payment Method
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                    />
                    <span className="text-sm text-gray-800">
                      Pay Online (Stripe)
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                    <span className="text-sm text-gray-800">
                      Cash on Delivery
                    </span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleCheckoutSubmit}
                disabled={checkoutLoading || !customerAddress}
                className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-bold text-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutLoading ? "Processing..." : "Place Order"}
              </button>

              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-500 text-center">
                  🔒 Secure Checkout - 100% Protected
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
