import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Get orders with feedback eligibility
export async function GET() {
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
        { error: "Only customers can access this endpoint" },
        { status: 403 }
      );
    }

    // Get delivered orders
    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        created_at,
        actual_delivery,
        items:order_items(
          id,
          product_id,
          product_name,
          product_image
        )
      `
      )
      .eq("customer_id", user.id)
      .eq("status", "delivered")
      .order("actual_delivery", { ascending: false });

    if (error) throw error;

    // Check which products already have feedback
    const productIds =
      orders
        ?.flatMap((order) => order.items.map((item) => item.product_id))
        .filter((id, index, self) => self.indexOf(id) === index) || [];

    const { data: existingFeedback } = await supabase
      .from("feedback")
      .select("product_id, order_id")
      .eq("customer_id", user.id)
      .in("product_id", productIds);

    // Map existing feedback
    const feedbackMap = new Map(
      existingFeedback?.map((fb) => [`${fb.order_id}_${fb.product_id}`, true])
    );

    // Add feedback eligibility to each order item
    const ordersWithEligibility = orders?.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        can_review: !feedbackMap.has(`${order.id}_${item.product_id}`),
      })),
    }));

    return NextResponse.json({ orders: ordersWithEligibility || [] });
  } catch (error) {
    console.error("Error fetching orders for feedback:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
