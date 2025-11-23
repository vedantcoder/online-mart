import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
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

    // Fetch wholesaler-exclusive products using admin client to avoid RLS edge-cases
    // Only list items that are available and have stock
    const { data: wholesalerProducts, error } = await supabaseAdmin
      .from("wholesaler_products")
      .select(
        `
        *,
        wholesaler:wholesalers!inner (
          id,
          business_name,
          business_address,
          business_city,
          business_state,
          business_latitude,
          business_longitude,
          profile:profiles (
            full_name,
            email,
            phone
          )
        ),
        category:categories (
          id,
          name,
          slug
        )
      `
      )
      .eq("is_available", true)
      .gt("quantity_in_stock", 0)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching wholesaler products:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group products by wholesaler
    const wholesalersMap = new Map();

    wholesalerProducts?.forEach((product) => {
      const wholesalerId = product.wholesaler.id;

      if (!wholesalersMap.has(wholesalerId)) {
        wholesalersMap.set(wholesalerId, {
          id: wholesalerId,
          business_name: product.wholesaler.business_name,
          business_address: product.wholesaler.business_address,
          business_city: product.wholesaler.business_city,
          business_state: product.wholesaler.business_state,
          business_latitude: product.wholesaler.business_latitude,
          business_longitude: product.wholesaler.business_longitude,
          profile: product.wholesaler.profile,
          products: [],
        });
      }

      wholesalersMap.get(wholesalerId).products.push({
        id: product.id,
        name: product.name,
        description: product.description,
        sku: product.sku,
        unit: product.unit,
        wholesale_price: product.wholesale_price,
        mrp: product.mrp,
        quantity_in_stock: product.quantity_in_stock,
        low_stock_threshold: product.low_stock_threshold,
        images: product.images,
        specifications: product.specifications,
        category: product.category,
        created_at: product.created_at,
      });
    });

    const wholesalers = Array.from(wholesalersMap.values());

    console.log(
      `Found ${wholesalers.length} wholesalers with ${
        wholesalerProducts?.length || 0
      } products`
    );

    return NextResponse.json({ wholesalers }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/retailer/wholesaler-products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
