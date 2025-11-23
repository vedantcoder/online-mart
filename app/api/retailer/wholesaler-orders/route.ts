import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a retailer
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "retailer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { wholesaler_id, items, delivery_address, notes } = body;

    if (!wholesaler_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { quantity: number; price_per_unit: number }) =>
        sum + item.quantity * item.price_per_unit,
      0
    );
    const tax_amount = subtotal * 0.18; // 18% GST
    const total_amount = subtotal + tax_amount;

    // Generate order number
    const order_number = `RWO-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("retailer_wholesaler_orders")
      .insert({
        order_number,
        retailer_id: user.id,
        wholesaler_id,
        subtotal,
        tax_amount,
        total_amount,
        delivery_address,
        notes,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Create order items
    const orderItems = items.map(
      (item: {
        wholesaler_product_id: string;
        product_name: string;
        quantity: number;
        price_per_unit: number;
      }) => ({
        order_id: order.id,
        wholesaler_product_id: item.wholesaler_product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price_per_unit: item.price_per_unit,
        subtotal: item.quantity * item.price_per_unit,
      })
    );

    const { error: itemsError } = await supabaseAdmin
      .from("retailer_wholesaler_order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      // Rollback order
      await supabaseAdmin
        .from("retailer_wholesaler_orders")
        .delete()
        .eq("id", order.id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Create notification for wholesaler
    await supabase.from("notifications").insert({
      user_id: wholesaler_id,
      type: "order",
      title: `New order ${order_number}`,
      message: `You have received a new order from a retailer`,
      link: `/wholesaler/orders/${order.id}`,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/retailer/wholesaler-orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a retailer
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "retailer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: orders, error } = await supabase
      .from("retailer_wholesaler_orders")
      .select(
        `
        *,
        wholesaler:wholesalers (
          *,
          profile:profiles (*)
        ),
        items:retailer_wholesaler_order_items (
          *,
          product:products (
            *,
            images:product_images (*)
          ),
          wholesaler_product:wholesaler_products (
            *,
            category:categories (*)
          )
        )
      `
      )
      .eq("retailer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error in GET /api/retailer/wholesaler-orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
