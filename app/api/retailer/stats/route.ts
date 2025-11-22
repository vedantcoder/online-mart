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
      .select("id, quantity, low_stock_threshold")
      .eq("owner_id", user.id)
      .eq("owner_type", "retailer");

    if (invErr) throw invErr;

    const totalProducts = inventoryRows?.length ?? 0;
    const lowStockItems = (inventoryRows || []).filter((row) => {
      const qty = Number(row.quantity ?? 0);
      const threshold = Number(row.low_stock_threshold ?? 0);
      return threshold > 0 && qty <= threshold;
    }).length;

    // Pending orders and connected wholesalers are placeholders for now
    const pendingOrders = 0;
    const connectedWholesalers = 0;

    return NextResponse.json({
      totalProducts,
      lowStockItems,
      pendingOrders,
      connectedWholesalers,
    });
  } catch (err: any) {
    console.error("RETAILER STATS GET ERROR:", err);
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
