"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import {
  Search,
  ShoppingCart,
  Heart,
  Package,
  User,
  ChevronDown,
  TrendingUp,
  Zap,
  Gift,
  Truck,
  Shield,
  CreditCard,
  ArrowRight,
  Star,
} from "lucide-react";
import { ProductService } from "@/lib/services/ProductService";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { cart, fetchCart } = useCartStore();

  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchCart(user.id);
    }
  }, [user?.id, fetchCart]);

  const loadData = async () => {
    try {
      setLoading(true);
      const categoriesData = await ProductService.getCategories();
      const { products: productsData } = await ProductService.searchProducts({
        in_stock_only: true,
        limit: 8,
      });

      setCategories(categoriesData);
      setFeaturedProducts(productsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/customer/products?search=${encodeURIComponent(searchQuery)}`
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const getTotalCartItems = (): number => {
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
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

            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
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
            </form>

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
                      {user?.getFullName() ||
                        user?.getEmail()?.split("@")[0] ||
                        "Customer"}
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
                    Profile
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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Welcome,{" "}
                {user?.getFullName() ||
                  user?.getEmail()?.split("@")[0] ||
                  "Customer"}
                ! 👋
              </h1>
              <p className="text-xl text-orange-100 mb-6">
                Discover amazing products at unbeatable prices
              </p>
              <Link
                href="/customer/products"
                className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition"
              >
                Shop Now <ArrowRight size={20} />
              </Link>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <TrendingUp size={32} className="mb-2" />
                  <p className="font-semibold">Trending Products</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <Zap size={32} className="mb-2" />
                  <p className="font-semibold">Flash Deals</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <Gift size={32} className="mb-2" />
                  <p className="font-semibold">Special Offers</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <Package size={32} className="mb-2" />
                  <p className="font-semibold">New Arrivals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Truck className="text-orange-600" size={32} />
              <div>
                <p className="font-semibold text-gray-900">Free Delivery</p>
                <p className="text-sm text-gray-600">On orders above ₹500</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="text-orange-600" size={32} />
              <div>
                <p className="font-semibold text-gray-900">Secure Payments</p>
                <p className="text-sm text-gray-600">100% protected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="text-orange-600" size={32} />
              <div>
                <p className="font-semibold text-gray-900">Easy Returns</p>
                <p className="text-sm text-gray-600">7 days return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package className="text-orange-600" size={32} />
              <div>
                <p className="font-semibold text-gray-900">Quality Products</p>
                <p className="text-sm text-gray-600">Verified sellers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Shop by Category
            </h2>
            <Link
              href="/customer/products"
              className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
            >
              View All <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/customer/products?category=${cat.id}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 text-center group"
                >
                  <div className="w-16 h-16 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition">
                    <Package size={32} className="text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition">
                    {cat.name}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <Link
              href="/customer/products"
              className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
            >
              View All <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => {
                const inventory = product.inventory?.[0];
                if (!inventory) return null;

                return (
                  <Link
                    key={product.id}
                    href="/customer/products"
                    className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden group"
                  >
                    <div className="relative aspect-square bg-gray-100">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={
                            product.images.find((img: any) => img.is_primary)
                              ?.image_url || product.images[0].image_url
                          }
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={48} className="text-gray-300" />
                        </div>
                      )}
                      {inventory.mrp && inventory.mrp > inventory.price && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                          {Math.round(
                            ((inventory.mrp - inventory.price) /
                              inventory.mrp) *
                              100
                          )}
                          % OFF
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4].map((i) => (
                          <Star
                            key={i}
                            size={12}
                            className="fill-yellow-400 text-yellow-400"
                          />
                        ))}
                        <Star size={12} className="text-gray-300" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{inventory.price.toLocaleString("en-IN")}
                        </span>
                        {inventory.mrp && inventory.mrp > inventory.price && (
                          <span className="text-xs text-gray-500 line-through">
                            ₹{inventory.mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
