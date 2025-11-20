"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { ProductService } from "@/lib/services/ProductService";
import { Inventory } from "@/lib/models/Product";
import {
  Plus,
  Package,
  TrendingDown,
  Search,
  Filter,
  Edit,
  Eye,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

export default function RetailerProductsPage() {
  const { user } = useAuthStore();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "available" | "low_stock" | "out_of_stock"
  >("all");

  const loadInventory = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userId = user.getId();
      const data = await ProductService.getInventoryForSeller(userId);
      setInventory(data);
      setFilteredInventory(data);
    } catch (error) {
      console.error("Failed to load inventory:", error);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const filterProducts = useCallback(() => {
    let filtered = [...inventory];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (inv) =>
          inv.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.product?.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      if (filterStatus === "available") {
        filtered = filtered.filter(
          (inv) => inv.is_available && inv.quantity > inv.low_stock_threshold
        );
      } else if (filterStatus === "low_stock") {
        filtered = filtered.filter(
          (inv) => inv.quantity > 0 && inv.quantity <= inv.low_stock_threshold
        );
      } else if (filterStatus === "out_of_stock") {
        filtered = filtered.filter(
          (inv) => inv.quantity === 0 || !inv.is_available
        );
      }
    }

    setFilteredInventory(filtered);
  }, [inventory, searchQuery, filterStatus]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const toggleAvailability = async (
    inventoryId: string,
    currentStatus: boolean
  ) => {
    try {
      await ProductService.toggleInventoryAvailability(
        inventoryId,
        !currentStatus
      );
      toast.success(
        `Product ${!currentStatus ? "enabled" : "disabled"} successfully`
      );
      loadInventory();
    } catch (error) {
      console.error("Failed to update availability:", error);
      toast.error("Failed to update product status");
    }
  };

  // Calculate stats
  const stats = {
    total: inventory.length,
    available: inventory.filter(
      (inv: Inventory) =>
        inv.is_available && inv.quantity > inv.low_stock_threshold
    ).length,
    lowStock: inventory.filter(
      (inv: Inventory) =>
        inv.quantity > 0 && inv.quantity <= inv.low_stock_threshold
    ).length,
    outOfStock: inventory.filter(
      (inv: Inventory) => inv.quantity === 0 || !inv.is_available
    ).length,
    totalValue: inventory.reduce(
      (sum: number, inv: Inventory) => sum + inv.price * inv.quantity,
      0
    ),
  };

  const getStockBadge = (inv: Inventory) => {
    if (inv.quantity === 0 || !inv.is_available) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          Out of Stock
        </span>
      );
    }
    if (inv.quantity <= inv.low_stock_threshold) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
          Low Stock
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
        In Stock
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Product Inventory
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your product catalog and stock levels
              </p>
            </div>
            <Link
              href="/dashboard/retailer/products/add"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus size={20} className="mr-2" />
              Add Product
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.available}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {stats.lowStock}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingDown className="text-orange-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Out of Stock
                </p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats.outOfStock}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ₹{stats.totalValue.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as
                      | "all"
                      | "available"
                      | "low_stock"
                      | "out_of_stock"
                  )
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              >
                <option value="all">All Products</option>
                <option value="available">Available</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredInventory.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your filters"
                : "Start by adding your first product"}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <Link
                href="/dashboard/retailer/products/add"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Plus size={20} className="mr-2" />
                Add Product
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredInventory.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg shrink-0 overflow-hidden relative">
                    {inv.product?.images && inv.product.images.length > 0 ? (
                      <Image
                        src={
                          inv.product.images.find((img) => img.is_primary)
                            ?.image_url || inv.product.images[0].image_url
                        }
                        alt={inv.product.name || "Product"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {inv.product?.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {inv.product?.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>SKU: {inv.product?.sku || "N/A"}</span>
                          <span>•</span>
                          <span>
                            Category:{" "}
                            {inv.product?.category?.name || "Uncategorized"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">{getStockBadge(inv)}</div>
                    </div>

                    {/* Inventory Details */}
                    <div className="mt-4 grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">
                          Stock Quantity
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {inv.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">
                          Selling Price
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{inv.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">MRP</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {inv.mrp
                            ? `₹${inv.mrp.toLocaleString("en-IN")}`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">
                          Stock Value
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{(inv.price * inv.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-3">
                      <Link
                        href={`/dashboard/retailer/products/${inv.product?.id}`}
                        className="flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Link>
                      <Link
                        href={`/dashboard/retailer/products/edit/${inv.id}`}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() =>
                          toggleAvailability(inv.id, inv.is_available)
                        }
                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition ${
                          inv.is_available
                            ? "text-orange-600 hover:bg-orange-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {inv.is_available ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
