import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Get orders based on user role
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

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    // Get user profile to determine role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    let query = supabase
      .from("orders")
      .select(
        `
        *,
        customer:customers!customer_id(id, street_address, city, state, pincode),
        seller:profiles!seller_id(id, full_name, email, phone, role),
        delivery_person:delivery_persons(id, profiles!id(full_name, phone, email)),
        order_items(id, product_id, product_name, product_image, quantity, price_per_unit, subtotal)
      `
      )
      .order("created_at", { ascending: false });

    // Filter based on user role
    if (profile.role === "customer") {
      query = query.eq("customer_id", user.id);
    } else if (profile.role === "retailer" || profile.role === "wholesaler") {
      query = query.eq("seller_id", user.id);
    } else if (profile.role === "delivery") {
      query = query.eq("delivery_person_id", user.id);
    }

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status);
    }

    const { data: orders, error: ordersErr } = await query;

    if (ordersErr) throw ordersErr;

    return NextResponse.json({ orders: orders || [] });
  } catch (err: unknown) {
    console.error("ORDERS GET ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
