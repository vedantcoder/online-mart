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

    // Verify user is a wholesaler
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "wholesaler") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get retailers who have ordered from this wholesaler
    const { data: retailers, error } = await supabase
      .from("retailer_wholesaler_orders")
      .select(
        `
        retailer:retailers (
          id,
          shop_name,
          shop_city,
          shop_state,
          profile:profiles (
            id,
            full_name,
            email,
            phone
          )
        )
      `
      )
      .eq("wholesaler_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching retailers:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Remove duplicates
    const uniqueRetailers = retailers?.reduce((acc, item) => {
      if (item.retailer && !acc.find((r) => r.id === item.retailer.id)) {
        acc.push(item.retailer);
      }
      return acc;
    }, [] as (typeof retailers)[0]["retailer"][]);

    return NextResponse.json({ retailers: uniqueRetailers || [] });
  } catch (error) {
    console.error("Error in GET /api/wholesaler/retailers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
