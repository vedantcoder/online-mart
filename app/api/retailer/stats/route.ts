export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    // Total products and low stock items from inventory
    const { data: inventoryRows, error: invErr } = await supabase
      .from("inventory")
      .select("id, quantity, price, low_stock_threshold")
      .eq("owner_id", user.id)
      .eq("owner_type", "retailer")
      .eq("is_available", true);

    if (invErr) throw invErr;

    const totalProducts = inventoryRows?.length ?? 0;
    const lowStockItems = (inventoryRows || []).filter((row) => {
      const qty = Number(row.quantity ?? 0);
      const threshold = Number(row.low_stock_threshold ?? 10);
      return qty <= threshold;
    }).length;

    // Calculate total inventory value
    const totalValue = (inventoryRows || []).reduce((sum, row) => {
      return sum + Number(row.price ?? 0) * Number(row.quantity ?? 0);
    }, 0);

    // Get most recently added product name
    const { data: latestProduct } = await supabase
      .from("inventory")
      .select("product:products(name)")
      .eq("owner_id", user.id)
      .eq("owner_type", "retailer")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const lastAdded = latestProduct?.product?.name || "None";

    // Count pending orders from customers
    const { data: orders } = await supabase
      .from("orders")
      .select("id, status")
      .eq("seller_id", user.id)
      .in("status", ["pending", "confirmed", "processing", "packed"]);

    const pendingOrders = orders?.length ?? 0;

    // Count connected wholesalers (wholesalers we have proxy items from)
    const { data: proxyInventory } = await supabase
      .from("inventory")
      .select("specifications")
      .eq("owner_id", user.id)
      .eq("owner_type", "retailer");

    const wholesalerIds = new Set();
    proxyInventory?.forEach((item) => {
      const specs = item.specifications as Record<string, string> | null;
      if (specs?.is_proxy && specs?.wholesaler_id) {
        wholesalerIds.add(specs.wholesaler_id);
      }
    });

    const connectedWholesalers = wholesalerIds.size;

    return NextResponse.json({
      totalProducts,
      lowStockItems,
      pendingOrders,
      connectedWholesalers,
      totalValue,
      lastAdded,
    });
  } catch (err: unknown) {
    console.error("RETAILER STATS GET ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
