import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Get customer purchase history for retailer
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

    // Verify user is a retailer
    const { data: retailer } = await supabase
      .from("retailers")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!retailer) {
      return NextResponse.json(
        { error: "Only retailers can access this endpoint" },
        { status: 403 }
      );
    }

    // Get all orders for this retailer with customer details
    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        customer_id,
        status,
        payment_status,
        total_amount,
        created_at,
        customer:customers!customer_id(
          id,
          street_address,
          city,
          state,
          pincode,
          profiles!id(full_name, email, phone)
        ),
        order_items(
          id,
          product_id,
          product_name,
          quantity,
          price_per_unit,
          subtotal
        )
      `
      )
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    if (ordersErr) throw ordersErr;

    // Group by customer and calculate stats
    const customerMap = new Map();

    orders?.forEach((order) => {
      const customerId = order.customer_id;
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          customer: order.customer,
          orders: [],
          totalSpent: 0,
          totalOrders: 0,
          lastOrderDate: order.created_at,
        });
      }

      const customerData = customerMap.get(customerId);
      customerData.orders.push(order);
      customerData.totalSpent += Number(order.total_amount);
      customerData.totalOrders += 1;
      if (new Date(order.created_at) > new Date(customerData.lastOrderDate)) {
        customerData.lastOrderDate = order.created_at;
      }
    });

    const purchaseHistory = Array.from(customerMap.values());

    return NextResponse.json({ purchaseHistory });
  } catch (err: unknown) {
    console.error("CUSTOMER PURCHASE HISTORY GET ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
