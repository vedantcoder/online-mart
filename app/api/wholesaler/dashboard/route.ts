import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "wholesaler") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalOrdersRes,
      pendingOrdersRes,
      inventoryCountRes,
      connectedRetailersRes,
      recentOrdersRes,
    ] = await Promise.all([
      supabase
        .from("retailer_wholesaler_orders")
        .select("id", { count: "exact", head: true })
        .eq("wholesaler_id", user.id),
      supabase
        .from("retailer_wholesaler_orders")
        .select("id", { count: "exact", head: true })
        .eq("wholesaler_id", user.id)
        .eq("status", "pending"),
      supabase
        .from("wholesaler_products")
        .select("id", { count: "exact", head: true })
        .eq("wholesaler_id", user.id),
      supabase
        .from("retailer_wholesaler_connections")
        .select("id", { count: "exact", head: true })
        .eq("wholesaler_id", user.id)
        .eq("status", "connected"),
      supabase
        .from("retailer_wholesaler_orders")
        .select(
          `
          *,
          retailer:retailers (
            shop_name
          ),
          items:retailer_wholesaler_order_items (
            product_name,
            quantity
          )
        `
        )
        .eq("wholesaler_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const stats = {
      totalOrders: totalOrdersRes.count || 0,
      pendingOrders: pendingOrdersRes.count || 0,
      inventoryCount: inventoryCountRes.count || 0,
      connectedRetailers: connectedRetailersRes.count || 0,
    };

    const recentOrders = recentOrdersRes.data;

    return NextResponse.json({ stats, recentOrders });
  } catch (error) {
    console.error("Error in GET /api/wholesaler/dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
