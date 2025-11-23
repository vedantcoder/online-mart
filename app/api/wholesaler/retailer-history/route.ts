import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Get retailer purchase history for wholesaler
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify user is a wholesaler
    const { data: wholesaler } = await supabase
      .from("wholesalers")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!wholesaler) {
      return NextResponse.json(
        { error: "Only wholesalers can access this endpoint" },
        { status: 403 }
      );
    }

    // Get all retailer-wholesaler orders for this wholesaler
    const { data: orders, error: ordersErr } = await supabase
      .from("retailer_wholesaler_orders")
      .select(
        `
        id,
        order_number,
        retailer_id,
        status,
        payment_status,
        total_amount,
        created_at,
        retailer:retailers!retailer_id(
          id,
          shop_name,
          shop_address,
          shop_city,
          shop_state,
          profiles!id(full_name, email, phone)
        ),
        retailer_wholesaler_order_items(
          id,
          product_id,
          product_name,
          quantity,
          price_per_unit,
          subtotal
        )
      `
      )
      .eq("wholesaler_id", user.id)
      .order("created_at", { ascending: false });

    if (ordersErr) throw ordersErr;

    // Group by retailer and calculate stats
    const retailerMap = new Map();

    orders?.forEach((order) => {
      const retailerId = order.retailer_id;
      if (!retailerMap.has(retailerId)) {
        retailerMap.set(retailerId, {
          retailer: order.retailer,
          orders: [],
          totalSpent: 0,
          totalOrders: 0,
          lastOrderDate: order.created_at,
        });
      }

      const retailerData = retailerMap.get(retailerId);
      retailerData.orders.push(order);
      retailerData.totalSpent += Number(order.total_amount);
      retailerData.totalOrders += 1;
      if (new Date(order.created_at) > new Date(retailerData.lastOrderDate)) {
        retailerData.lastOrderDate = order.created_at;
      }
    });

    const purchaseHistory = Array.from(retailerMap.values());

    return NextResponse.json({ purchaseHistory });
  } catch (err: unknown) {
    console.error("RETAILER PURCHASE HISTORY GET ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
