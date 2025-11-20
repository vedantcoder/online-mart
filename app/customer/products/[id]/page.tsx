"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
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
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ProductService } from "@/lib/services/ProductService";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase/client";

interface Feedback {
  id: string;
  customer_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  customer_name?: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { user, logout } = useAuthStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(0);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    loadProduct();
    loadFeedbacks();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await ProductService.getProductById(productId);

      if (!productData) {
        toast.error("Product not found");
        router.push("/customer/products");
        return;
      }

      // Filter for available inventory
      productData.inventory = productData.inventory?.filter(
        (inv: any) => inv.is_available && inv.quantity > 0
      );

      setProduct(productData);
    } catch (error) {
      console.error("Failed to load product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const loadFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select(
          `
          id,
          customer_id,
          rating,
          title,
          comment,
          is_verified_purchase,
          created_at,
          customers:customer_id (
            users:user_id (
              full_name
            )
          )
        `
        )
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedFeedbacks = data.map((fb: any) => ({
        ...fb,
        customer_name: fb.customers?.users?.full_name || "Anonymous",
      }));

      setFeedbacks(formattedFeedbacks);
    } catch (error) {
      console.error("Failed to load feedbacks:", error);
    }
  };

  const handleAddToCart = () => {
    if (!product.inventory || product.inventory.length === 0) {
      toast.error("Product not available");
      return;
    }

    const inv = product.inventory[0];
    if (quantity < inv.quantity) {
      setQuantity(quantity + 1);
      toast.success("Added to cart");
    } else {
      toast.error("Cannot add more than available stock");
    }
  };

  const handleRemoveFromCart = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to submit feedback");
      return;
    }

    if (feedbackData.rating < 1 || feedbackData.rating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }

    try {
      setSubmittingFeedback(true);

      // Get customer_id from user
      const { data: customerData } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!customerData) {
        toast.error("Customer profile not found");
        return;
      }

      const { error } = await supabase.from("feedback").insert({
        customer_id: customerData.id,
        product_id: productId,
        rating: feedbackData.rating,
        title: feedbackData.title || null,
        comment: feedbackData.comment || null,
        is_verified_purchase: false, // Set to true if order verification is implemented
      });

      if (error) throw error;

      toast.success("Feedback submitted successfully!");
      setShowFeedbackForm(false);
      setFeedbackData({ rating: 5, title: "", comment: "" });
      loadFeedbacks();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, fb) => acc + fb.rating, 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach((fb) => {
      dist[fb.rating as keyof typeof dist]++;
    });
    return dist;
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product not found
          </h2>
          <Link
            href="/customer/products"
            className="text-orange-600 hover:underline"
          >
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const inv = product.inventory?.[0];
  const avgRating = getAverageRating();
  const ratingDist = getRatingDistribution();

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
                  0
                </span>
              </Link>

              <Link
                href="/customer/cart"
                className="relative hover:text-orange-600 transition"
              >
                <ShoppingCart size={24} className="text-gray-700" />
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {quantity}
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/customer/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={
                    product.images.find((img: any) => img.is_primary)
                      ?.image_url || product.images[0].image_url
                  }
                  alt={product.name || "Product"}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={96} className="text-gray-300" />
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i <= Math.floor(Number(avgRating))
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-lg font-medium text-gray-700">
                {avgRating}
              </span>
              <span className="text-gray-500">
                ({feedbacks.length} reviews)
              </span>
            </div>

            {/* Price */}
            {inv && (
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-gray-900">
                    ₹{inv.price.toLocaleString("en-IN")}
                  </span>
                  {inv.mrp && inv.mrp > inv.price && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ₹{inv.mrp.toLocaleString("en-IN")}
                      </span>
                      <span className="text-lg text-green-600 font-semibold">
                        {Math.round(((inv.mrp - inv.price) / inv.mrp) * 100)}%
                        OFF
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock Status */}
            {inv && (
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  {inv.quantity > 0 ? (
                    <>
                      <CheckCircle className="text-green-500" size={20} />
                      <span className="text-green-700 font-medium">
                        In Stock ({inv.quantity} available)
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-500" size={20} />
                      <span className="text-red-700 font-medium">
                        Out of Stock
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            {inv && inv.quantity > 0 && (
              <div className="space-y-4">
                {quantity > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-between bg-orange-500 rounded-lg p-3 flex-1">
                      <button
                        onClick={handleRemoveFromCart}
                        className="text-white hover:bg-orange-600 rounded p-2 transition"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="text-white font-bold text-xl px-4">
                        {quantity}
                      </span>
                      <button
                        onClick={handleAddToCart}
                        className="text-white hover:bg-orange-600 rounded p-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={quantity >= inv.quantity}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <button className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition">
                      Buy Now
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-orange-500 text-white py-4 rounded-lg hover:bg-orange-600 transition font-bold text-lg"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ratings & Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Ratings & Reviews
            </h2>
            <button
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
            >
              Write a Review
            </button>
          </div>

          {/* Feedback Form */}
          {showFeedbackForm && (
            <form
              onSubmit={handleSubmitFeedback}
              className="bg-gray-50 rounded-lg p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Share Your Experience
              </h3>

              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setFeedbackData({ ...feedbackData, rating: star })
                      }
                      className="transition"
                    >
                      <Star
                        size={32}
                        className={
                          star <= feedbackData.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600 font-medium">
                    {feedbackData.rating} / 5
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  value={feedbackData.title}
                  onChange={(e) =>
                    setFeedbackData({ ...feedbackData, title: e.target.value })
                  }
                  placeholder="Summarize your experience"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                />
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={feedbackData.comment}
                  onChange={(e) =>
                    setFeedbackData({
                      ...feedbackData,
                      comment: e.target.value,
                    })
                  }
                  placeholder="Tell us what you think about this product..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {submittingFeedback ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Rating Summary */}
          {feedbacks.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 pb-8 border-b">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {avgRating}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i <= Math.floor(Number(avgRating))
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <p className="text-gray-600">
                  Based on {feedbacks.length} reviews
                </p>
              </div>

              <div className="lg:col-span-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingDist[star as keyof typeof ratingDist];
                  const percentage =
                    feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-600 w-12">
                        {star} star
                      </span>
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {feedbacks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No reviews yet. Be the first to review this product!
                </p>
              </div>
            ) : (
              feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="border-b border-gray-200 pb-6 last:border-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {feedback.customer_name}
                        </span>
                        {feedback.is_verified_purchase && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i <= feedback.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {feedback.title && (
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {feedback.title}
                    </h4>
                  )}
                  {feedback.comment && (
                    <p className="text-gray-700 leading-relaxed">
                      {feedback.comment}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
