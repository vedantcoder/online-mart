"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { ArrowLeft, Package, Store, MapPin, Search } from "lucide-react";
import toast from "react-hot-toast";

interface WholesalerProduct {
  id: string;
  name: string;
  description: string;
  sku: string;
  unit: string;
  wholesale_price: number;
  mrp: number;
  quantity_in_stock: number;
  low_stock_threshold: number;
  images: Array<{
    url: string;
    is_primary: boolean;
    display_order: number;
  }>;
  specifications: any;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  created_at: string;
}

interface Wholesaler {
  id: string;
  business_name: string;
  business_address: string;
  business_city: string;
  business_state: string;
  business_latitude: number;
  business_longitude: number;
  profile: {
    full_name: string;
    email: string;
    phone: string;
  };
  products: WholesalerProduct[];
}

export default function FindWholesalersPage() {
  const router = useRouter();
  const { user, isLoading, initialize } = useAuthStore();
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<
    Array<{
      wholesaler_id: string;
      wholesaler_product_id: string;
      product_name: string;
      quantity: number;
      price_per_unit: number;
    }>
  >([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && (!user || user.getRole() !== "retailer")) {
      router.push("/login?role=retailer");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user && user.getRole() === "retailer") {
      loadWholesalers();
    }
  }, [isLoading, user]);

  const loadWholesalers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/retailer/wholesaler-products");
      if (!res.ok) throw new Error("Failed to load wholesaler products");
      const data = await res.json();
      setWholesalers(data.wholesalers || []);
    } catch (error) {
      console.error("Load wholesaler products error:", error);
      toast.error("Failed to load wholesaler products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (
    wholesaler_id: string,
    wholesaler_product_id: string,
    product_name: string,
    price_per_unit: number
  ) => {
    const existingProduct = selectedProducts.find(
      (p) => p.wholesaler_product_id === wholesaler_product_id
    );

    if (existingProduct) {
      toast.error("Product already in cart");
      return;
    }

    setSelectedProducts([
      ...selectedProducts,
      {
        wholesaler_id,
        wholesaler_product_id,
        product_name,
        quantity: 1,
        price_per_unit,
      },
    ]);
    toast.success(`${product_name} added to cart`);
  };

  const updateQuantity = (wholesaler_product_id: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedProducts(
        selectedProducts.filter(
          (p) => p.wholesaler_product_id !== wholesaler_product_id
        )
      );
      return;
    }

    setSelectedProducts(
      selectedProducts.map((p) =>
        p.wholesaler_product_id === wholesaler_product_id
          ? { ...p, quantity }
          : p
      )
    );
  };

  const removeFromCart = (wholesaler_product_id: string) => {
    setSelectedProducts(
      selectedProducts.filter(
        (p) => p.wholesaler_product_id !== wholesaler_product_id
      )
    );
  };

  const submitOrder = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please add products to cart");
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error("Please enter delivery address");
      return;
    }

    // Group products by wholesaler
    const ordersByWholesaler = selectedProducts.reduce((acc, product) => {
      if (!acc[product.wholesaler_id]) {
        acc[product.wholesaler_id] = [];
      }
      acc[product.wholesaler_id].push(product);
      return acc;
    }, {} as Record<string, typeof selectedProducts>);

    try {
      // Create separate orders for each wholesaler
      const orderPromises = Object.entries(ordersByWholesaler).map(
        async ([wholesaler_id, products]) => {
          const items = products.map((p) => ({
            wholesaler_product_id: p.wholesaler_product_id,
            product_name: p.product_name,
            quantity: p.quantity,
            price_per_unit: p.price_per_unit,
          }));

          const res = await fetch("/api/retailer/wholesaler-orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              wholesaler_id,
              items,
              delivery_address: deliveryAddress,
              notes: orderNotes,
            }),
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Failed to create order");
          }

          return res.json();
        }
      );

      await Promise.all(orderPromises);

      toast.success("Purchase requests sent successfully!");
      setSelectedProducts([]);
      setDeliveryAddress("");
      setOrderNotes("");
      setShowCartModal(false);
      router.push("/retailer/orders");
    } catch (error) {
      console.error("Submit order error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit orders"
      );
    }
  };

  const filteredWholesalers = wholesalers.filter((ws) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ws.business_name.toLowerCase().includes(query) ||
      ws.business_city.toLowerCase().includes(query) ||
      ws.products.some((product) => product.name.toLowerCase().includes(query))
    );
  });

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
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Browse Wholesaler Products
            </h1>
            <p className="text-gray-600 mt-1">
              Browse products from wholesalers and send purchase requests
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search wholesalers, cities, or products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Cart Button */}
        {selectedProducts.length > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900">
                {selectedProducts.length} product(s) in cart
              </p>
              <p className="text-sm text-blue-700">
                Total: ₹
                {selectedProducts
                  .reduce((sum, p) => sum + p.quantity * p.price_per_unit, 0)
                  .toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => setShowCartModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Review & Send Request
            </button>
          </div>
        )}

        {filteredWholesalers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Store size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No wholesalers found</p>
            <p className="text-gray-500 mt-2">
              {searchQuery
                ? "Try a different search term"
                : "No wholesalers are available in your area"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredWholesalers.map((wholesaler) => (
              <div key={wholesaler.id} className="bg-white rounded-lg shadow">
                {/* Wholesaler Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {wholesaler.business_name}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {wholesaler.profile?.full_name ||
                          wholesaler.business_name}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-gray-500">
                        <MapPin size={16} />
                        <span>
                          {wholesaler.business_address},{" "}
                          {wholesaler.business_city},{" "}
                          {wholesaler.business_state}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        📞 {wholesaler.profile?.phone || "-"} | ✉️{" "}
                        {wholesaler.profile?.email || "-"}
                      </p>
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                      {wholesaler.products.length} Products
                    </div>
                  </div>
                </div>

                {/* Wholesaler Inventory */}
                <div className="p-6">
                  {wholesaler.products.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      No products available
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wholesaler.products.map((product) => {
                        const primaryImage = product.images?.find(
                          (img) => img.is_primary
                        );
                        const imageUrl =
                          primaryImage?.url || product.images?.[0]?.url;
                        const isInCart = selectedProducts.some(
                          (p) => p.wholesaler_product_id === product.id
                        );

                        return (
                          <div
                            key={product.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="w-full h-40 bg-gray-100 rounded-md overflow-hidden mb-3">
                              {imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package
                                    size={40}
                                    className="text-gray-400"
                                  />
                                </div>
                              )}
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {product.description || "No description"}
                            </p>
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-sm text-gray-500">
                                  Category: {product.category?.name || "N/A"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Stock: {product.quantity_in_stock}{" "}
                                  {product.unit}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-lg font-bold text-gray-900">
                                  ₹{product.wholesale_price.toFixed(2)}
                                </p>
                                {product.mrp &&
                                  product.mrp > product.wholesale_price && (
                                    <p className="text-sm text-gray-500 line-through">
                                      MRP: ₹{product.mrp.toFixed(2)}
                                    </p>
                                  )}
                              </div>
                              <button
                                onClick={() =>
                                  handleAddToCart(
                                    wholesaler.id,
                                    product.id,
                                    product.name,
                                    product.wholesale_price
                                  )
                                }
                                disabled={isInCart}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                  isInCart
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                              >
                                {isInCart ? "In Cart" : "Add to Cart"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cart Modal */}
        {showCartModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Review Purchase Request
              </h3>

              {/* Products List */}
              <div className="space-y-3 mb-6">
                {selectedProducts.map((product) => (
                  <div
                    key={product.wholesaler_product_id}
                    className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {product.product_name}
                      </h4>
                      <p className="text-sm text-gray-700">
                        ₹{product.price_per_unit.toFixed(2)} per unit
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              product.wholesaler_product_id,
                              product.quantity - 1
                            )
                          }
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">
                          {product.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              product.wholesaler_product_id,
                              product.quantity + 1
                            )
                          }
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      <div className="w-24 text-right font-semibold">
                        ₹
                        {(product.quantity * product.price_per_unit).toFixed(2)}
                      </div>
                      <button
                        onClick={() =>
                          removeFromCart(product.wholesaler_product_id)
                        }
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>
                    ₹
                    {selectedProducts
                      .reduce(
                        (sum, p) => sum + p.quantity * p.price_per_unit,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  This is a purchase request. Products will be added to your
                  inventory after wholesaler approval.
                </p>
              </div>

              {/* Delivery Address */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address *
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your complete delivery address"
                />
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special instructions or requirements"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCartModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitOrder}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Purchase Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
