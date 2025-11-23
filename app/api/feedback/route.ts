import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Fetch feedback for a product
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");
    const customerId = searchParams.get("customer_id");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("feedback")
      .select(
        `
        *,
        customer:customers!inner(
          id,
          profile:profiles!inner(
            full_name,
            avatar_url
          )
        )
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (productId) {
      query = query.eq("product_id", productId);
    }

    if (customerId) {
      query = query.eq("customer_id", customerId);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      feedback: data || [],
      total: count || 0,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch feedback";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - Create new feedback
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a customer
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!customer) {
      return NextResponse.json(
        { error: "Only customers can submit feedback" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { product_id, order_id, rating, review_text, images } = body;

    if (!product_id || !rating) {
      return NextResponse.json(
        { error: "Product ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if order exists and is delivered (for verified purchase)
    let verified_purchase = false;
    if (order_id) {
      const { data: order } = await supabase
        .from("orders")
        .select("id, status, customer_id")
        .eq("id", order_id)
        .eq("customer_id", user.id)
        .single();

      if (order && order.status === "delivered") {
        verified_purchase = true;
      }
    }

    // Insert feedback
    const { data: feedback, error } = await supabase
      .from("feedback")
      .insert({
        product_id,
        customer_id: user.id,
        order_id,
        rating,
        review_text,
        images: images || [],
        verified_purchase,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error) {
    console.error("Error creating feedback:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create feedback";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT - Update feedback
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, rating, review_text, images } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Feedback ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from("feedback")
      .select("customer_id")
      .eq("id", id)
      .single();

    if (!existing || existing.customer_id !== user.id) {
      return NextResponse.json(
        { error: "Feedback not found or unauthorized" },
        { status: 403 }
      );
    }

    // Update feedback
    const updateData: Record<string, string | number | string[]> = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: "Rating must be between 1 and 5" },
          { status: 400 }
        );
      }
      updateData.rating = rating;
    }
    if (review_text !== undefined) updateData.review_text = review_text;
    if (images !== undefined) updateData.images = images;

    const { data: feedback, error } = await supabase
      .from("feedback")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Error updating feedback:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update feedback";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - Delete feedback
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Feedback ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from("feedback")
      .select("customer_id")
      .eq("id", id)
      .single();

    if (!existing || existing.customer_id !== user.id) {
      return NextResponse.json(
        { error: "Feedback not found or unauthorized" },
        { status: 403 }
      );
    }

    const { error } = await supabase.from("feedback").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete feedback";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
