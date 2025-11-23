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

    // Verify user is a retailer
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "retailer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get retailer's proxy listings
    const { data: proxyListings, error } = await supabase
      .from("proxy_listings")
      .select(
        `
        *,
        wholesaler:wholesalers (
          id,
          business_name,
          profile:profiles (
            full_name,
            email
          )
        ),
        wholesaler_inventory:inventory!proxy_listings_wholesaler_inventory_id_fkey (
          id,
          quantity,
          price,
          mrp,
          product:products (
            id,
            name,
            description,
            unit,
            category:categories (
              name
            ),
            images:product_images (*)
          )
        )
      `
      )
      .eq("retailer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching proxy listings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ proxyListings });
  } catch (error) {
    console.error("Error in GET /api/retailer/proxy-listings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const {
      wholesaler_id,
      wholesaler_inventory_id,
      quantity_to_list,
      markup_percentage,
      custom_price,
    } = body;

    if (!wholesaler_id || !wholesaler_inventory_id || !quantity_to_list) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the wholesaler inventory exists and has enough quantity
    const { data: inventory, error: invError } = await supabase
      .from("inventory")
      .select("quantity, price")
      .eq("id", wholesaler_inventory_id)
      .eq("owner_id", wholesaler_id)
      .eq("owner_type", "wholesaler")
      .eq("is_available", true)
      .single();

    if (invError || !inventory) {
      return NextResponse.json(
        { error: "Wholesaler inventory not found or unavailable" },
        { status: 400 }
      );
    }

    if (inventory.quantity < quantity_to_list) {
      return NextResponse.json(
        { error: "Insufficient quantity available from wholesaler" },
        { status: 400 }
      );
    }

    // Create proxy listing
    const { data: proxyListing, error } = await supabase
      .from("proxy_listings")
      .insert({
        retailer_id: user.id,
        wholesaler_id,
        wholesaler_inventory_id,
        quantity_to_list,
        markup_percentage: markup_percentage || 0,
        custom_price,
        is_active: true,
      })
      .select(
        `
        *,
        wholesaler:wholesalers (
          id,
          business_name,
          profile:profiles (
            full_name
          )
        ),
        wholesaler_inventory:inventory!proxy_listings_wholesaler_inventory_id_fkey (
          id,
          quantity,
          price,
          product:products (
            id,
            name,
            unit,
            images:product_images (*)
          )
        )
      `
      )
      .single();

    if (error) {
      console.error("Error creating proxy listing:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ proxyListing }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/retailer/proxy-listings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
