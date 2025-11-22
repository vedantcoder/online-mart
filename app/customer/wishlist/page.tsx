"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useCartStore } from "@/lib/store/cartStore";
import {
  Search,
  ShoppingCart,
  Heart,
  Package,
  User,
  ChevronDown,
  Star,
  Minus,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const {
    items: wishlistItems,
    fetchWishlist,
    removeFromWishlist,
  } = useWishlistStore();
  const { cart, fetchCart, addItem, updateItem, removeItem } = useCartStore();

  // Supabase user type may not expose id directly in our local type defs; cast to unknown and narrow.
  const userId = user ? (user as unknown as { id?: string }).id : undefined;
  useEffect(() => {
    if (userId) {
      fetchWishlist(userId);
      fetchCart(userId);
    }
  }, [userId, fetchWishlist, fetchCart]);

  const getTotalCartItems = (): number => {
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  interface InventoryItem {
    price: number;
    quantity: number;
    owner_id: string;
    mrp?: number;
  }
  interface ProductForCart {
    id: string;
    name: string;
    inventory?: InventoryItem[];
  }
  const handleAddToCart = async (product: ProductForCart) => {
    if (!userId) {
      toast.error("Please login to add items to cart");
      router.push("/auth/login");
      return;
    }
    if (!product.inventory || product.inventory.length === 0) {
      toast.error("No available stock for this product");
      return;
    }
    const inv = product.inventory[0];
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
        if (!cart) await fetchCart(userId);
        if (cart) {
          await addItem(cart.id, {
            product_id: product.id,
            quantity: 1,
            price_at_addition: inv.price,
            seller_id: inv.owner_id,
          });
          toast.success(`Added ${product.name} to cart`);
        }
      }
    } catch {
      toast.error("Failed to update cart");
    }
  };

  const getCartQuantity = (productId: string): number => {
    return (
      cart?.items.find((item) => item.product_id === productId)?.quantity || 0
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      router.push(
                        `/customer/products?search=${e.currentTarget.value}`
                      );
                    }
                  }}
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
          <p className="text-gray-600 mt-1">
            {wishlistItems.length} item(s) saved
          </p>
        </div>
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 mb-4">
              Browse products and add items you love.
            </p>
            <Link
              href="/customer/products"
              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
            >
              Go to Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              interface ProductFromWishlist {
                id: string;
                name: string;
                average_rating?: number;
                review_count?: number;
                images?: { image_url: string; is_primary?: boolean }[];
                inventory?: {
                  price: number;
                  quantity: number;
                  owner_id: string;
                  mrp?: number;
                }[];
              }
              const product = item.product as ProductFromWishlist;
              if (!product) return null;
              const inv =
                product.inventory && product.inventory.length > 0
                  ? product.inventory[0]
                  : null;
              const cartQty = getCartQuantity(product.id);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden"
                >
                  <Link href={`/customer/products/${product.id}`}>
                    <div className="relative aspect-square bg-gray-100">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={
                            (
                              product.images.find(
                                (img: {
                                  image_url: string;
                                  is_primary?: boolean;
                                }) => img.is_primary
                              ) || product.images[0]
                            ).image_url
                          }
                          alt={product.name || "Product"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={48} className="text-gray-300" />
                        </div>
                      )}
                      {inv && inv.mrp && inv.mrp > inv.price && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                          {Math.round(((inv.mrp - inv.price) / inv.mrp) * 100)}%
                          OFF
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!userId) {
                            toast.error("Please login to modify wishlist");
                            router.push("/auth/login");
                            return;
                          }
                          removeFromWishlist(userId, product.id);
                          toast.success("Removed from wishlist");
                        }}
                        className="absolute top-2 right-2 p-2 rounded-full shadow bg-white/80 backdrop-blur hover:bg-white transition"
                      >
                        <Heart
                          size={18}
                          className="fill-red-500 text-red-500"
                        />
                      </button>
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/customer/products/${product.id}`}>
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2 h-10 cursor-pointer hover:text-orange-600 transition">
                        {product.name}
                      </h3>
                    </Link>
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
                      {typeof product.review_count === "number" &&
                        product.review_count > 0 && (
                          <span className="text-[10px] text-gray-400 ml-1">
                            ({product.review_count})
                          </span>
                        )}
                    </div>
                    {inv && (
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
                    )}
                    {inv && inv.quantity > 0 ? (
                      cartQty > 0 ? (
                        <div className="flex items-center justify-between bg-orange-500 rounded-lg p-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const existingItem = cart!.items.find(
                                (ci) => ci.product_id === product.id
                              );
                              if (!existingItem) return;
                              if (existingItem.quantity > 1) {
                                updateItem(
                                  cart!.id,
                                  existingItem.id,
                                  existingItem.quantity - 1
                                );
                              } else {
                                removeItem(cart!.id, existingItem.id);
                              }
                            }}
                            className="text-white hover:bg-orange-600 rounded p-1 transition"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-white font-medium px-2">
                            {cartQty}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            className="text-white hover:bg-orange-600 rounded p-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={cartQty >= inv.quantity}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-medium text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          Add to Cart
                        </button>
                      )
                    ) : (
                      <div className="text-xs text-red-600 font-medium mb-2">
                        Out of Stock
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
