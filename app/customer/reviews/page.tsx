"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { Star, Package, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  can_review: boolean;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  actual_delivery: string;
  items: OrderItem[];
}

export default function ReviewOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingProduct, setReviewingProduct] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<{
    orderId: string;
    productId: string;
    rating: number;
    review_text: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.getRole() !== "customer") {
      router.push(`/${user?.getRole()}/dashboard`);
      return;
    }

    loadOrders();
  }, [isAuthenticated, user, router]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders/feedback-eligible");
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStartReview = (orderId: string, productId: string) => {
    setReviewingProduct(productId);
    setReviewData({
      orderId,
      productId,
      rating: 5,
      review_text: "",
    });
  };

  const handleSubmitReview = async () => {
    if (!reviewData) return;

    if (!reviewData.review_text.trim()) {
      toast.error("Please write a review");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: reviewData.productId,
          order_id: reviewData.orderId,
          rating: reviewData.rating,
          review_text: reviewData.review_text,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit review");
      }

      toast.success("Review submitted successfully!");
      setReviewingProduct(null);
      setReviewData(null);
      await loadOrders(); // Reload to update can_review status
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit review"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Review Your Orders
          </h1>
          <p className="text-gray-600 mt-2">
            Share your experience with products you&apos;ve received
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No delivered orders to review
            </h3>
            <p className="text-gray-600 mb-6">
              Once you receive your orders, you can review them here
            </p>
            <button
              onClick={() => router.push("/customer/products")}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Order #{order.order_number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Delivered on{" "}
                      {new Date(order.actual_delivery).toLocaleDateString(
                        "en-IN",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <CheckCircle className="text-green-500" size={24} />
                </div>

                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                        {item.product_image ? (
                          <Image
                            src={item.product_image}
                            alt={item.product_name}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={32} className="text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {item.product_name}
                        </h4>

                        {reviewingProduct === item.product_id ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Rating
                              </label>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <button
                                    key={rating}
                                    onClick={() =>
                                      setReviewData(
                                        reviewData
                                          ? { ...reviewData, rating }
                                          : null
                                      )
                                    }
                                    className="transition"
                                  >
                                    <Star
                                      size={28}
                                      className={
                                        rating <= (reviewData?.rating || 0)
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Review
                              </label>
                              <textarea
                                value={reviewData?.review_text || ""}
                                onChange={(e) =>
                                  setReviewData(
                                    reviewData
                                      ? {
                                          ...reviewData,
                                          review_text: e.target.value,
                                        }
                                      : null
                                  )
                                }
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-gray-900"
                                placeholder="Share your experience with this product..."
                              />
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={handleSubmitReview}
                                disabled={submitting}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium disabled:opacity-50"
                              >
                                {submitting ? "Submitting..." : "Submit Review"}
                              </button>
                              <button
                                onClick={() => {
                                  setReviewingProduct(null);
                                  setReviewData(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-900"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : item.can_review ? (
                          <button
                            onClick={() =>
                              handleStartReview(order.id, item.product_id)
                            }
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium text-sm"
                          >
                            Write a Review
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle size={16} />
                            <span className="text-sm font-medium">
                              Review Submitted
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
