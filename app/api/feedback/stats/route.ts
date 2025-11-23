import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Get feedback statistics for a product
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get all feedback for the product
    const { data: feedbackData, error } = await supabase
      .from("feedback")
      .select("rating, verified_purchase")
      .eq("product_id", productId);

    if (error) throw error;

    const totalReviews = feedbackData?.length || 0;
    const verifiedReviews =
      feedbackData?.filter((f) => f.verified_purchase).length || 0;

    if (totalReviews === 0) {
      return NextResponse.json({
        average_rating: 0,
        total_reviews: 0,
        verified_reviews: 0,
        rating_distribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      });
    }

    // Calculate average rating
    const sumRatings = feedbackData.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = sumRatings / totalReviews;

    // Calculate rating distribution
    const ratingDistribution = {
      5: feedbackData.filter((f) => f.rating === 5).length,
      4: feedbackData.filter((f) => f.rating === 4).length,
      3: feedbackData.filter((f) => f.rating === 3).length,
      2: feedbackData.filter((f) => f.rating === 2).length,
      1: feedbackData.filter((f) => f.rating === 1).length,
    };

    return NextResponse.json({
      average_rating: Number(averageRating.toFixed(1)),
      total_reviews: totalReviews,
      verified_reviews: verifiedReviews,
      rating_distribution: ratingDistribution,
    });
  } catch (error) {
    console.error("Error fetching feedback stats:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch feedback statistics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
