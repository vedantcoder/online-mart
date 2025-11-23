import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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
    const { quantity_to_list, markup_percentage, custom_price, is_active } =
      body;

    const updateData: Record<string, unknown> = {};

    if (quantity_to_list !== undefined)
      updateData.quantity_to_list = quantity_to_list;
    if (markup_percentage !== undefined)
      updateData.markup_percentage = markup_percentage;
    if (custom_price !== undefined) updateData.custom_price = custom_price;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: proxyListing, error } = await supabase
      .from("proxy_listings")
      .update(updateData)
      .eq("id", id)
      .eq("retailer_id", user.id)
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
      console.error("Error updating proxy listing:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ proxyListing });
  } catch (error) {
    console.error("Error in PATCH /api/retailer/proxy-listings/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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

    const { error } = await supabase
      .from("proxy_listings")
      .delete()
      .eq("id", id)
      .eq("retailer_id", user.id);

    if (error) {
      console.error("Error deleting proxy listing:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/retailer/proxy-listings/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
