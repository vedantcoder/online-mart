"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { ArrowLeft, Package, Store, MapPin, Plus, Search } from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  unit: string;
  categories: {
    name: string;
    slug: string;
  };
  product_images: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
}

interface InventoryItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  mrp: number;
  product: Product;
}

interface Wholesaler {
  id: string;
  business_name: string;
  business_address: string;
  business_city: string;
  business_state: string;
  business_latitude: number;
  business_longitude: number;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
  inventory: InventoryItem[];
}

export default function FindWholesalersPage() {
  const router = useRouter();
  const { user, isLoading, initialize } = useAuthStore();
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<{
    inventoryId: string;
    productName: string;
    wholesalerName: string;
    currentPrice: number;
    currentMrp: number;
  } | null>(null);
  const [purchaseItem, setPurchaseItem] = useState<{
    inventoryId: string;
    productName: string;
    wholesalerName: string;
    currentPrice: number;
    currentMrp: number;
  } | null>(null);
  const [proxyQuantity, setProxyQuantity] = useState(0);
  const [proxyPrice, setProxyPrice] = useState(0);
  const [proxyMrp, setProxyMrp] = useState(0);
  const [purchaseQuantity, setPurchaseQuantity] = useState(0);
  const [retailerPrice, setRetailerPrice] = useState(0);
  const [retailerMrp, setRetailerMrp] = useState(0);

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
      const res = await fetch("/api/retailer/proxy-inventory");
      if (!res.ok) throw new Error("Failed to load wholesalers");
      const data = await res.json();
      setWholesalers(data.wholesalers || []);
    } catch (error) {
      console.error("Load wholesalers error:", error);
      toast.error("Failed to load wholesalers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProxyItem = (
    inventoryId: string,
    productName: string,
    wholesalerName: string,
    price: number,
    mrp: number
  ) => {
    setSelectedItem({
      inventoryId,
      productName,
      wholesalerName,
      currentPrice: price,
      currentMrp: mrp,
    });
    setProxyQuantity(0);
    setProxyPrice(price * 1.1); // 10% markup
    setProxyMrp(mrp);
  };

  const handleBuyAndAdd = (
    inventoryId: string,
    productName: string,
    wholesalerName: string,
    price: number,
    mrp: number
  ) => {
    setPurchaseItem({
      inventoryId,
      productName,
      wholesalerName,
      currentPrice: price,
      currentMrp: mrp,
    });
    setPurchaseQuantity(0);
    setRetailerPrice(price * 1.15); // suggest 15% markup for direct purchase
    setRetailerMrp(mrp || price * 1.2);
  };

  const submitProxyItem = async () => {
    if (!selectedItem) return;

    if (proxyQuantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      const res = await fetch("/api/retailer/proxy-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wholesaler_inventory_id: selectedItem.inventoryId,
          proxy_quantity: proxyQuantity,
          proxy_price: proxyPrice,
          proxy_mrp: proxyMrp,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add proxy item");
      }

      toast.success("Proxy item added to your inventory successfully!");
      setSelectedItem(null);
      setProxyQuantity(0);
      router.push("/retailer/inventory");
    } catch (error) {
      console.error("Add proxy item error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add proxy item"
      );
    }
  };

  const submitPurchase = async () => {
    if (!purchaseItem) return;
    if (purchaseQuantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    try {
      const res = await fetch("/api/retailer/proxy-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "purchase",
          wholesaler_inventory_id: purchaseItem.inventoryId,
          purchase_quantity: purchaseQuantity,
          retailer_price: retailerPrice,
          retailer_mrp: retailerMrp,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to purchase");
      }
      toast.success("Purchased and added to your inventory!");
      setPurchaseItem(null);
      setPurchaseQuantity(0);
      router.push("/retailer/inventory");
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to purchase"
      );
    }
  };

  const filteredWholesalers = wholesalers.filter((ws) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ws.business_name.toLowerCase().includes(query) ||
      ws.business_city.toLowerCase().includes(query) ||
      ws.inventory.some((item) =>
        item.product.name.toLowerCase().includes(query)
      )
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
              Find Wholesalers
            </h1>
            <p className="text-gray-600 mt-1">
              Browse wholesaler inventory and add proxy items to your store
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
                        {wholesaler.profiles?.full_name ||
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
                        📞 {wholesaler.profiles?.phone || "-"} | ✉️{" "}
                        {wholesaler.profiles?.email || "-"}
                      </p>
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                      {wholesaler.inventory.length} Products
                    </div>
                  </div>
                </div>

                {/* Wholesaler Inventory */}
                <div className="p-6">
                  {wholesaler.inventory.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      No products available
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wholesaler.inventory.map((item) => {
                        const primaryImage = item.product.product_images?.find(
                          (img) => img.is_primary
                        );
                        const imageUrl =
                          primaryImage?.image_url ||
                          item.product.product_images?.[0]?.image_url;

                        return (
                          <div
                            key={item.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="w-full h-40 bg-gray-100 rounded-md overflow-hidden mb-3">
                              {imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={imageUrl}
                                  alt={item.product.name}
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
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {item.product.description || "No description"}
                            </p>
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-sm text-gray-500">
                                  Category:{" "}
                                  {item.product.categories?.name || "N/A"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Stock: {item.quantity} {item.product.unit}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-lg font-bold text-gray-900">
                                  ₹{item.price.toFixed(2)}
                                </p>
                                {item.mrp && item.mrp > item.price && (
                                  <p className="text-sm text-gray-500 line-through">
                                    ₹{item.mrp.toFixed(2)}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    handleBuyAndAdd(
                                      item.id,
                                      item.product.name,
                                      wholesaler.business_name,
                                      item.price,
                                      item.mrp || item.price
                                    )
                                  }
                                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Buy & Add
                                </button>
                                <button
                                  onClick={() =>
                                    handleAddProxyItem(
                                      item.id,
                                      item.product.name,
                                      wholesaler.business_name,
                                      item.price,
                                      item.mrp || item.price
                                    )
                                  }
                                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                  <Plus size={16} />
                                  Add Proxy
                                </button>
                              </div>
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

        {/* Add Proxy Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Add Proxy Item
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Product</p>
                  <p className="text-gray-900">{selectedItem.productName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Wholesaler
                  </p>
                  <p className="text-gray-900">{selectedItem.wholesalerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Quantity (display to customers)
                  </p>
                  <input
                    type="number"
                    value={proxyQuantity}
                    onChange={(e) => setProxyQuantity(Number(e.target.value))}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter quantity"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set to 0 to show unlimited availability
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Your Selling Price
                  </p>
                  <input
                    type="number"
                    value={proxyPrice}
                    onChange={(e) => setProxyPrice(Number(e.target.value))}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Wholesaler price: ₹{selectedItem.currentPrice.toFixed(2)}{" "}
                    (Suggested: ₹{(selectedItem.currentPrice * 1.1).toFixed(2)})
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">MRP</p>
                  <input
                    type="number"
                    value={proxyMrp}
                    onChange={(e) => setProxyMrp(Number(e.target.value))}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setProxyQuantity(0);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitProxyItem}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add to Inventory
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Buy & Add Modal */}
        {purchaseItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Buy & Add to Inventory
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Product</p>
                  <p className="text-gray-900">{purchaseItem.productName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Wholesaler
                  </p>
                  <p className="text-gray-900">{purchaseItem.wholesalerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Purchase Quantity
                  </p>
                  <input
                    type="number"
                    value={purchaseQuantity}
                    onChange={(e) =>
                      setPurchaseQuantity(Number(e.target.value))
                    }
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter quantity"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Wholesaler stock should be sufficient for this quantity
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Your Selling Price
                  </p>
                  <input
                    type="number"
                    value={retailerPrice}
                    onChange={(e) => setRetailerPrice(Number(e.target.value))}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Wholesaler price: ₹{purchaseItem.currentPrice.toFixed(2)}{" "}
                    (Suggested: ₹{(purchaseItem.currentPrice * 1.15).toFixed(2)}
                    )
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">MRP</p>
                  <input
                    type="number"
                    value={retailerMrp}
                    onChange={(e) => setRetailerMrp(Number(e.target.value))}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setPurchaseItem(null);
                    setPurchaseQuantity(0);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitPurchase}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Buy & Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Purchase Modal would render within the page component scope above; keeping file end unchanged.
