import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all orders within the time range
    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        customer_id,
        total_amount,
        status,
        created_at,
        customer:customers!customer_id(
          id,
          profiles!id(full_name)
        ),
        order_items(
          product_name,
          quantity,
          subtotal
        )
      `
      )
      .eq("seller_id", user.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });

    if (ordersErr) throw ordersErr;

    // Calculate metrics
    const totalRevenue =
      orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
    const totalOrders = orders?.length || 0;
    const customerIds = new Set(orders?.map((o) => o.customer_id) || []);
    const totalCustomers = customerIds.size;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top products
    const productMap = new Map();
    orders?.forEach((order) => {
      order.order_items?.forEach((item) => {
        const existing = productMap.get(item.product_name) || {
          total_quantity: 0,
          total_revenue: 0,
        };
        productMap.set(item.product_name, {
          product_name: item.product_name,
          total_quantity: existing.total_quantity + item.quantity,
          total_revenue: existing.total_revenue + Number(item.subtotal),
        });
      });
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 10);

    // Top customers
    const customerMap = new Map();
    orders?.forEach((order) => {
      const customerName = order.customer?.profiles?.full_name || "Unknown";
      const existing = customerMap.get(order.customer_id) || {
        total_orders: 0,
        total_spent: 0,
      };
      customerMap.set(order.customer_id, {
        customer_name: customerName,
        total_orders: existing.total_orders + 1,
        total_spent: existing.total_spent + Number(order.total_amount),
      });
    });

    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 10);

    // Recent orders
    const recentOrders = (orders || []).slice(0, 10).map((order) => ({
      order_number: order.order_number,
      customer_name: order.customer?.profiles?.full_name || "Unknown",
      total_amount: Number(order.total_amount),
      status: order.status,
      created_at: order.created_at,
    }));

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      averageOrderValue,
      topProducts,
      topCustomers,
      recentOrders,
    });
  } catch (err: unknown) {
    console.error("RETAILER ANALYTICS GET ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
