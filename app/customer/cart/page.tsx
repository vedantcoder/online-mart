"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Search,
  Heart,
  ShoppingCart,
  User,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { cart, isLoading, fetchCart, updateItem, removeItem, clearCart } =
    useCartStore();
  const [searchQuery, setSearchQuery] = useState("");

  const userId = user ? (user as unknown as { id?: string }).id : undefined;
  useEffect(() => {
    if (userId) {
      fetchCart(userId);
    }
  }, [userId, fetchCart]);

  const handleUpdateQuantity = async (
    cartId: string,
    itemId: string,
    newQty: number
  ) => {
    if (newQty < 1) return;
    try {
      await updateItem(cartId, itemId, newQty);
      toast.success("Cart updated");
    } catch {
      toast.error("Failed to update cart");
    }
  };

  const handleRemoveItem = async (cartId: string, itemId: string) => {
    try {
      await removeItem(cartId, itemId);
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleClearCart = async (cartId: string) => {
    if (confirm("Are you sure you want to clear your cart?")) {
      try {
        await clearCart(cartId);
        toast.success("Cart cleared");
      } catch {
        toast.error("Failed to clear cart");
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const getTotalCartItems = (): number => {
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const subtotal =
    cart?.items.reduce(
      (sum, item) => sum + item.price_at_addition * item.quantity,
      0
    ) || 0;

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
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Link>

              <Link
                href="/customer/cart"
                className="relative hover:text-orange-600 transition"
              >
                <ShoppingCart size={24} className="text-gray-700" />
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalCartItems()}
                </span>
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
                    href="/customer/wishlist"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Wishlist
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Link
            href="/customer/products"
            className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Continue Shopping
          </Link>
        </div>

        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="flex justify-center mb-4">
              <ShoppingBag size={64} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Link
              href="/customer/products"
              className="inline-block px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map(
                (item: {
                  id: string;
                  product_id: string;
                  quantity: number;
                  price_at_addition: number;
                  product?: {
                    name?: string;
                    images?: { image_url?: string; is_primary?: boolean }[];
                  };
                }) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4 items-center"
                  >
                    <div className="relative w-24 h-24 shrink-0 bg-gray-100 rounded-md overflow-hidden">
                      {(() => {
                        const images = item.product?.images;
                        if (Array.isArray(images) && images.length > 0) {
                          // Handle case where images may be array of objects with image_url property
                          const primary =
                            images.find(
                              (img: {
                                image_url?: string;
                                is_primary?: boolean;
                              }) => img.is_primary
                            ) || images[0];
                          const url =
                            typeof primary === "string"
                              ? primary
                              : primary.image_url;
                          if (url) {
                            return (
                              <Image
                                src={url}
                                alt={item.product?.name || "Product"}
                                fill
                                className="object-cover"
                              />
                            );
                          }
                        }
                        return (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        );
                      })()}
                    </div>

                    <div className="grow">
                      <Link href={`/customer/products/${item.product_id}`}>
                        <h3 className="font-semibold text-lg text-gray-900 hover:text-orange-600 transition cursor-pointer">
                          {item.product?.name || "Unknown Product"}
                        </h3>
                      </Link>
                      <p className="text-gray-600 font-medium mt-1">
                        ₹{item.price_at_addition.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              cart.id,
                              item.id,
                              item.quantity - 1
                            )
                          }
                          className="p-2 hover:bg-gray-50 text-gray-600 transition"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              cart.id,
                              item.id,
                              item.quantity + 1
                            )
                          }
                          className="p-2 hover:bg-gray-50 text-gray-600 transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(cart.id, item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                )
              )}

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => handleClearCart(cart.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({getTotalCartItems()} items)</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between items-end">
                    <span className="font-bold text-lg text-gray-900">
                      Total
                    </span>
                    <span className="font-bold text-2xl text-gray-900">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-bold text-lg shadow-sm hover:shadow-md">
                  Proceed to Checkout
                </button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Secure Checkout - 100% Protected
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
