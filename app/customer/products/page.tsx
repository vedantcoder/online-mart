"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import {
  Search,
  ShoppingCart,
  Heart,
  Package,
  User,
  ChevronDown,
  Star,
  Plus,
  Minus,
  Filter,
} from "lucide-react";
import { ProductService } from "@/lib/services/ProductService";
import { Inventory } from "@/lib/models/Product";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

interface CartItem {
  inventoryId: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function CustomerProducts() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuthStore();
  const { cart, fetchCart, addItem, updateItem, removeItem } = useCartStore();
  const {
    items: wishlistItems,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();

  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "all"
  );
  // const [cart, setCart] = useState<Map<string, CartItem>>(new Map()); // Removed local cart state
  const [priceRange, setPriceRange] = useState<
    "all" | "under500" | "500-1000" | "1000-5000" | "above5000" | "custom"
  >("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchCart(user.id);
      fetchWishlist(user.id);
    }
  }, [user?.id, fetchCart, fetchWishlist]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchParams.get("category")) {
      setSelectedCategory(searchParams.get("category") || "all");
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { products: productsData } = await ProductService.searchProducts({
        in_stock_only: true,
        limit: 100,
      });
      const categoriesData = await ProductService.getCategories();

      // Keep products with their inventory, filter for available items
      const availableProducts = productsData
        .filter((p) => p.inventory && p.inventory.length > 0)
        .map((p) => ({
          ...p,
          inventory: p.inventory.filter(
            (inv: any) => inv.is_available && inv.quantity > 0
          ),
        }))
        .filter((p) => p.inventory.length > 0);

      setProducts(availableProducts);
      setFilteredProducts(availableProducts);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, priceRange, products, minPrice, maxPrice]);

  const filterProducts = () => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category_id === selectedCategory);
    }

    if (priceRange !== "all") {
      filtered = filtered.filter((p) => {
        const price = p.inventory?.[0]?.price || 0;
        if (priceRange === "under500") {
          return price < 500;
        } else if (priceRange === "500-1000") {
          return price >= 500 && price < 1000;
        } else if (priceRange === "1000-5000") {
          return price >= 1000 && price < 5000;
        } else if (priceRange === "above5000") {
          return price >= 5000;
        } else if (priceRange === "custom") {
          const min = minPrice ? parseFloat(minPrice) : 0;
          const max = maxPrice ? parseFloat(maxPrice) : Infinity;
          return price >= min && price <= max;
        }
        return true;
      });
    }

    setFilteredProducts(filtered);
  };

  // Update custom range when inputs change
  useEffect(() => {
    if (minPrice || maxPrice) {
      setPriceRange("custom");
    }
  }, [minPrice, maxPrice]);

  const addToCart = async (product: any) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      router.push("/auth/login");
      return;
    }

    if (!product.inventory || product.inventory.length === 0) return;

    const inv = product.inventory[0]; // Use first available inventory

    // Check if item is already in cart
    const existingItem = cart?.items.find(
      (item) => item.product_id === product.id
    );

    try {
      if (existingItem) {
        if (existingItem.quantity < inv.quantity) {
          await updateItem(
            cart!.id,
            existingItem.id,
            existingItem.quantity + 1
          );
          toast.success(`Added another ${product.name}`);
        } else {
          toast.error("Cannot add more than available stock");
        }
      } else {
        if (!cart) {
          // If cart doesn't exist, fetchCart should have created it or we need to handle it.
          // But fetchCart is called on mount.
          // If it's still null, maybe we should wait or retry.
          // For now assume cart exists if user is logged in and fetchCart finished.
          // Actually fetchCart creates one if not found.
          await fetchCart(user.id);
        }

        // We need the cart ID. If cart is null, we can't add.
        // But fetchCart ensures cart is set.
        if (cart) {
          await addItem(cart.id, {
            product_id: product.id,
            quantity: 1,
            price_at_addition: inv.price,
            seller_id: inv.owner_id, // Use inventory owner as seller
          });
          toast.success(`Added ${product.name} to cart`);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update cart");
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!cart) return;
    const existingItem = cart.items.find(
      (item) => item.product_id === productId
    );

    if (existingItem) {
      try {
        if (existingItem.quantity > 1) {
          await updateItem(cart.id, existingItem.id, existingItem.quantity - 1);
        } else {
          await removeItem(cart.id, existingItem.id);
          toast.success("Removed from cart");
        }
      } catch (error) {
        toast.error("Failed to update cart");
      }
    }
  };

  const getCartQuantity = (productId: string): number => {
    return (
      cart?.items.find((item) => item.product_id === productId)?.quantity || 0
    );
  };

  const getTotalCartItems = (): number => {
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

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
                  {wishlistItems.length}
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
                      {user?.fullName || "Customer"}
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

          {/* Categories Bar */}
          <div className="border-t border-gray-200">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-4 overflow-x-auto flex-1">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedCategory === "all"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedCategory === cat.id
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="ml-4 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 lg:hidden"
              >
                <Filter size={18} />
                Filters
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside
            className={`w-64 shrink-0 ${
              showFilters ? "block" : "hidden"
            } lg:block`}
          >
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    value="all"
                    checked={priceRange === "all"}
                    onChange={(e) => {
                      setPriceRange("all");
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900">All Prices</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    value="under500"
                    checked={priceRange === "under500"}
                    onChange={(e) => {
                      setPriceRange("under500");
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900">Under ₹500</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    value="500-1000"
                    checked={priceRange === "500-1000"}
                    onChange={(e) => {
                      setPriceRange("500-1000");
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900">₹500 - ₹1,000</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    value="1000-5000"
                    checked={priceRange === "1000-5000"}
                    onChange={(e) => {
                      setPriceRange("1000-5000");
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900">₹1,000 - ₹5,000</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    value="above5000"
                    checked={priceRange === "above5000"}
                    onChange={(e) => {
                      setPriceRange("above5000");
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900">Above ₹5,000</span>
                </label>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Custom Range
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-1 focus:ring-orange-500 outline-none"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-1 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCategory === "all"
                      ? "All Products"
                      : categories.find((c) => c.id === selectedCategory)?.name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {filteredProducts.length} products available
                  </p>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-500">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => {
                      const inv = product.inventory?.[0]; // Get first available inventory
                      if (!inv) return null;
                      const cartQty = getCartQuantity(product.id);

                      return (
                        <div
                          key={product.id}
                          className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden"
                        >
                          {/* Product Image - Clickable */}
                          <Link href={`/customer/products/${product.id}`}>
                            <div className="relative aspect-square bg-gray-100 cursor-pointer">
                              {product.images && product.images.length > 0 ? (
                                <Image
                                  src={
                                    product.images.find(
                                      (img: any) => img.is_primary
                                    )?.image_url || product.images[0].image_url
                                  }
                                  alt={product.name || "Product"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package
                                    size={48}
                                    className="text-gray-300"
                                  />
                                </div>
                              )}
                              {inv.mrp && inv.mrp > inv.price && (
                                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                  {Math.round(
                                    ((inv.mrp - inv.price) / inv.mrp) * 100
                                  )}
                                  % OFF
                                </div>
                              )}
                              {/* Wishlist Heart */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!user) {
                                    toast.error(
                                      "Please login to manage wishlist"
                                    );
                                    router.push("/auth/login");
                                    return;
                                  }
                                  if (isInWishlist(product.id)) {
                                    removeFromWishlist(user.id, product.id);
                                    toast.success("Removed from wishlist");
                                  } else {
                                    addToWishlist(user.id, product.id);
                                    toast.success("Added to wishlist");
                                  }
                                }}
                                className="absolute top-2 right-2 p-2 rounded-full shadow bg-white/80 backdrop-blur hover:bg-white transition"
                              >
                                <Heart
                                  size={18}
                                  className={
                                    isInWishlist(product.id)
                                      ? "fill-red-500 text-red-500"
                                      : "text-gray-600"
                                  }
                                />
                              </button>
                            </div>
                          </Link>

                          {/* Product Info */}
                          <div className="p-4">
                            <Link href={`/customer/products/${product.id}`}>
                              <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2 h-10 cursor-pointer hover:text-orange-600 transition">
                                {product.name}
                              </h3>
                            </Link>

                            {/* Dynamic Rating */}
                            <div className="flex items-center gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={
                                    i <= Math.round(product.average_rating || 0)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }
                                />
                              ))}
                              <span className="text-xs text-gray-500 ml-1">
                                {(product.average_rating || 0).toFixed(1)}
                              </span>
                              {product.review_count > 0 && (
                                <span className="text-[10px] text-gray-400 ml-1">
                                  ({product.review_count})
                                </span>
                              )}
                            </div>

                            <div className="flex items-baseline gap-2 mb-3">
                              <span className="text-lg font-bold text-gray-900">
                                ₹{inv.price.toLocaleString("en-IN")}
                              </span>
                              {inv.mrp && inv.mrp > inv.price && (
                                <span className="text-xs text-gray-500 line-through">
                                  ₹{inv.mrp.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>

                            {/* Add to Cart Controls */}
                            {cartQty > 0 ? (
                              <div className="flex items-center justify-between bg-orange-500 rounded-lg p-2">
                                <button
                                  onClick={() => removeFromCart(product.id)}
                                  className="text-white hover:bg-orange-600 rounded p-1 transition"
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="text-white font-medium px-2">
                                  {cartQty}
                                </span>
                                <button
                                  onClick={() => addToCart(product)}
                                  className="text-white hover:bg-orange-600 rounded p-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={cartQty >= inv.quantity}
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(product)}
                                className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-medium text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                                disabled={inv.quantity === 0}
                              >
                                {inv.quantity > 0
                                  ? "Add to Cart"
                                  : "Out of Stock"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
