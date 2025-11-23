import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Get products with proxy availability (retailer showing wholesaler products)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const retailerId = searchParams.get("retailer_id");

    if (!retailerId) {
      return NextResponse.json(
        { error: "Retailer ID is required" },
        { status: 400 }
      );
    }

    // Get retailer's own inventory
    const { data: retailerInventory, error: retailerError } = await supabase
      .from("inventory")
      .select(
        `
        *,
        product:products(
          *,
          category:categories(*),
          images:product_images(*)
        )
      `
      )
      .eq("owner_id", retailerId)
      .eq("owner_type", "retailer");

    if (retailerError) throw retailerError;

    // Get retailer's location to find nearby wholesalers
    const { data: retailer } = await supabase
      .from("retailers")
      .select("shop_latitude, shop_longitude, shop_city, shop_state")
      .eq("id", retailerId)
      .single();

    // Get wholesaler products from the same city/state (proxy availability)
    let wholesalerQuery = supabase
      .from("inventory")
      .select(
        `
        *,
        product:products!inner(
          *,
          category:categories(*),
          images:product_images(*)
        ),
        owner:wholesalers!inner(
          id,
          business_name,
          business_city,
          business_state,
          business_latitude,
          business_longitude
        )
      `
      )
      .eq("owner_type", "wholesaler")
      .eq("is_available", true)
      .gt("quantity", 0);

    // Filter by location if available
    if (retailer?.shop_city) {
      wholesalerQuery = wholesalerQuery.eq(
        "owner.business_city",
        retailer.shop_city
      );
    }

    const { data: wholesalerInventory, error: wholesalerError } =
      await wholesalerQuery;

    if (wholesalerError && wholesalerError.code !== "PGRST116") {
      // PGRST116 means no rows, which is acceptable
      console.error("Wholesaler inventory error:", wholesalerError);
    }

    // Combine both inventories with proxy flag
    const combined = [
      ...(retailerInventory || []).map((inv) => ({
        ...inv,
        is_proxy: false,
        proxy_from: null,
      })),
      ...(wholesalerInventory || []).map((inv) => ({
        ...inv,
        is_proxy: true,
        proxy_from: {
          id: inv.owner.id,
          name: inv.owner.business_name,
          city: inv.owner.business_city,
          state: inv.owner.business_state,
        },
      })),
    ];

    // Group by product and sort by price
    const productMap = new Map();

    combined.forEach((inv) => {
      const productId = inv.product.id;
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          product: inv.product,
          inventories: [],
        });
      }
      productMap.get(productId).inventories.push({
        id: inv.id,
        price: inv.price,
        mrp: inv.mrp,
        quantity: inv.quantity,
        is_proxy: inv.is_proxy,
        proxy_from: inv.proxy_from,
        owner_id: inv.owner_id,
      });
    });

    // Convert map to array and sort inventories by price
    const products = Array.from(productMap.values()).map((item) => ({
      ...item.product,
      inventory: item.inventories.sort(
        (a: { price: number }, b: { price: number }) => a.price - b.price
      ),
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching proxy products:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
