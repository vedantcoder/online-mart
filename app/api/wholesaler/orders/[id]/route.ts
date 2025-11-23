import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: order, error } = await supabase
      .from("retailer_wholesaler_orders")
      .select(
        `
        *,
        retailer:retailers (
          *,
          profile:profiles (*)
        ),
        items:retailer_wholesaler_order_items (
          *,
          product:products (
            *,
            category:categories (*),
            images:product_images (*)
          )
        )
      `
      )
      .eq("id", id)
      .eq("wholesaler_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error in GET /api/wholesaler/orders/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a wholesaler
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "wholesaler") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status, fulfillment_notes } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { status };

    if (fulfillment_notes) {
      updateData.fulfillment_notes = fulfillment_notes;
    }

    if (
      status === "confirmed" ||
      status === "ready" ||
      status === "delivered"
    ) {
      updateData.fulfilled_at = new Date().toISOString();
    }

    const { data: order, error } = await supabase
      .from("retailer_wholesaler_orders")
      .update(updateData)
      .eq("id", id)
      .eq("wholesaler_id", user.id)
      .select(
        `
        *,
        retailer:retailers (
          *,
          profile:profiles (*)
        ),
        items:retailer_wholesaler_order_items (
          *,
          product:products (
            *,
            images:product_images (*)
          )
        )
      `
      )
      .single();

    if (error) {
      console.error("Error updating order:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create notification for retailer
    await supabase.from("notifications").insert({
      user_id: order.retailer_id,
      type: "order",
      title: `Order ${order.order_number} ${status}`,
      message: `Your wholesaler order has been ${status}`,
      link: `/retailer/orders/${order.id}`,
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error in PATCH /api/wholesaler/orders/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
