import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// POST - Add wholesaler product as proxy to retailer inventory
export async function POST(request: NextRequest) {
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
        { error: "Only retailers can add proxy items" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      mode = "proxy", // "proxy" | "purchase"
      wholesaler_inventory_id,
      proxy_quantity,
      proxy_price,
      proxy_mrp,
      purchase_quantity,
      retailer_price,
      retailer_mrp,
    } = body;

    if (!wholesaler_inventory_id) {
      return NextResponse.json(
        { error: "Wholesaler inventory ID is required" },
        { status: 400 }
      );
    }

    // Get wholesaler inventory item
    const { data: wholesalerInventory, error: invErr } = await supabase
      .from("inventory")
      .select(
        `
        *,
        product:products(id, name, description, category_id, sku, unit, specifications),
        owner:profiles!owner_id(id, full_name, role)
      `
      )
      .eq("id", wholesaler_inventory_id)
      .eq("owner_type", "wholesaler")
      .single();

    if (invErr || !wholesalerInventory) {
      return NextResponse.json(
        { error: "Wholesaler inventory item not found" },
        { status: 404 }
      );
    }

    if (mode === "proxy") {
      // Check if wholesaler has enough stock only if retailer wants to mirror limited quantity (>0)
      if (
        typeof proxy_quantity === "number" &&
        proxy_quantity > 0 &&
        wholesalerInventory.quantity < proxy_quantity
      ) {
        return NextResponse.json(
          { error: "Wholesaler does not have enough stock" },
          { status: 400 }
        );
      }

      // Create proxy entry in retailer inventory
      const { data: proxyInventory, error: proxyErr } = await supabase
        .from("inventory")
        .insert({
          product_id: wholesalerInventory.product_id,
          owner_id: user.id,
          owner_type: "retailer",
          quantity: proxy_quantity || 0,
          price: proxy_price || wholesalerInventory.price * 1.1, // default 10% markup
          mrp: proxy_mrp || wholesalerInventory.mrp,
          is_available: true,
          low_stock_threshold: 5,
          specifications: {
            ...(wholesalerInventory.product.specifications || {}),
            is_proxy: true,
            wholesaler_id: wholesalerInventory.owner_id,
            wholesaler_name: wholesalerInventory.owner.full_name,
            wholesaler_inventory_id: wholesaler_inventory_id,
          },
        })
        .select()
        .single();

      if (proxyErr) throw proxyErr;

      return NextResponse.json({
        proxyInventory,
        message: "Proxy item added successfully",
      });
    }

    // mode === "purchase" : move stock from wholesaler to retailer (non-proxy)
    const qty = Number(purchase_quantity ?? 0);
    if (!qty || qty <= 0)
      return NextResponse.json(
        { error: "Purchase quantity must be > 0" },
        { status: 400 }
      );

    if (Number(wholesalerInventory.quantity ?? 0) < qty) {
      return NextResponse.json(
        { error: "Wholesaler does not have enough stock" },
        { status: 400 }
      );
    }

    // 1) Decrement wholesaler stock
    const { error: decErr } = await supabase
      .from("inventory")
      .update({
        quantity: Number(wholesalerInventory.quantity) - qty,
        updated_at: new Date().toISOString(),
        is_available: Number(wholesalerInventory.quantity) - qty > 0,
      })
      .eq("id", wholesaler_inventory_id);
    if (decErr) throw decErr;

    // 2) Upsert retailer inventory for same product (non-proxy)
    const { data: existingRetailInv } = await supabase
      .from("inventory")
      .select("id, quantity, price, mrp")
      .eq("product_id", wholesalerInventory.product_id)
      .eq("owner_id", user.id)
      .eq("owner_type", "retailer")
      .single();

    let retailerInventoryRow: unknown = null;
    if (existingRetailInv) {
      const { data, error } = await supabase
        .from("inventory")
        .update({
          quantity: Number(existingRetailInv.quantity ?? 0) + qty,
          price:
            retailer_price !== undefined && retailer_price !== null
              ? Number(retailer_price)
              : existingRetailInv.price,
          mrp:
            retailer_mrp !== undefined && retailer_mrp !== null
              ? Number(retailer_mrp)
              : existingRetailInv.mrp,
          is_available: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRetailInv.id)
        .select()
        .single();
      if (error) throw error;
      retailerInventoryRow = data;
    } else {
      const { data, error } = await supabase
        .from("inventory")
        .insert({
          product_id: wholesalerInventory.product_id,
          owner_id: user.id,
          owner_type: "retailer",
          quantity: qty,
          price:
            retailer_price !== undefined && retailer_price !== null
              ? Number(retailer_price)
              : wholesalerInventory.price,
          mrp:
            retailer_mrp !== undefined && retailer_mrp !== null
              ? Number(retailer_mrp)
              : wholesalerInventory.mrp,
          is_available: true,
          low_stock_threshold: 5,
          specifications: {
            ...(wholesalerInventory.product.specifications || {}),
            source: "wholesale_purchase",
            wholesaler_id: wholesalerInventory.owner_id,
            wholesaler_name: wholesalerInventory.owner.full_name,
            wholesaler_inventory_id: wholesaler_inventory_id,
            purchased_quantity: qty,
            purchased_at: new Date().toISOString(),
          },
        })
        .select()
        .single();
      if (error) throw error;
      retailerInventoryRow = data;
    }

    return NextResponse.json({
      retailerInventory: retailerInventoryRow,
      message: "Purchased and added to your inventory",
    });
  } catch (err: unknown) {
    console.error("PROXY INVENTORY POST ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

// GET - Get wholesalers and their inventory for proxy listing
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

    // Prefer admin client when available to bypass RLS for read-only listing
    const useAdmin =
      !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
      // prevent accidental placeholder usage
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
    const db = useAdmin ? supabaseAdmin : supabase;

    // Get all wholesalers with their inventory
    const { data: wholesalers, error: wsErr } = await db
      .from("wholesalers")
      .select(
        `
        id,
        business_name,
        business_address,
        business_city,
        business_state,
        business_latitude,
        business_longitude,
        profiles!id(full_name, email, phone)
      `
      );
    // Show all wholesalers, regardless of verification, as requested
    if (wsErr) throw wsErr;

    // For each wholesaler, get their inventory
    const wholesalersWithInventory = await Promise.all(
      (wholesalers || []).map(async (ws) => {
        const { data: inventory } = await db
          .from("inventory")
          .select(
            `
            *,
            product:products(
              id,
              name,
              description,
              category_id,
              sku,
              unit,
              specifications,
              categories(name, slug),
              product_images(image_url, is_primary)
            ),
            owner_id,
            owner_type
          `
          )
          .eq("owner_id", ws.id)
          .eq("owner_type", "wholesaler")
          .eq("is_available", true);

        return {
          ...ws,
          inventory: inventory || [],
        };
      })
    );

    return NextResponse.json({ wholesalers: wholesalersWithInventory });
  } catch (err: unknown) {
    console.error("PROXY INVENTORY GET ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
