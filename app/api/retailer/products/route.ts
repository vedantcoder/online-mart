export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET -> list products for authenticated retailer (based on inventory ownership)
 * Returns simplified rows with images[], stock, and price derived from inventory
 */
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

    const { data, error } = await supabase
      .from("inventory")
      .select(
        `
        id,
        quantity,
        price,
        mrp,
        created_at,
        product:products(
          id,
          name,
          category_id,
          base_price,
          created_at,
          product_images:product_images(*)
        )
      `
      )
      .eq("owner_id", user.id)
      .eq("owner_type", "retailer")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const rows = (data || []).map((row: any) => {
      const product = row.product || {};
      const imgs = Array.isArray(product.product_images)
        ? product.product_images
            .sort((a: any, b: any) => {
              const ap = a?.is_primary ? 0 : 1;
              const bp = b?.is_primary ? 0 : 1;
              if (ap !== bp) return ap - bp;
              return (a?.display_order ?? 0) - (b?.display_order ?? 0);
            })
            .map((img: any) => img.image_url)
        : [];

      return {
        id: product.id,
        inventory_id: row.id,
        name: product.name,
        images: imgs,
        category_id: product.category_id ?? null,
        stock: Number(row.quantity ?? 0),
        base_price: Number(row.price ?? product.base_price ?? 0),
        created_at: row.created_at ?? product.created_at ?? null,
      };
    });

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("RETAILER PRODUCTS GET ERROR:", err);
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}

/**
 * PATCH -> update inventory/product fields for a retailer's product
 * Body can include: quantity, price, mrp, is_available, name, description, base_price
 * Target row is resolved by inventory id
 */
export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const {
      inventory_id,
      quantity,
      price,
      mrp,
      is_available,
      name,
      description,
      base_price,
    } = body || {};

    if (!inventory_id) {
      return NextResponse.json(
        { error: "inventory_id is required" },
        { status: 400 }
      );
    }

    const { data: inv, error: invErr } = await supabase
      .from("inventory")
      .select("id, product_id")
      .eq("id", inventory_id)
      .eq("owner_id", user.id)
      .eq("owner_type", "retailer")
      .single();

    if (invErr || !inv) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }

    const invUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (quantity !== undefined) invUpdates.quantity = Number(quantity);
    if (price !== undefined) invUpdates.price = Number(price);
    if (mrp !== undefined) invUpdates.mrp = mrp === null ? null : Number(mrp);
    if (is_available !== undefined) invUpdates.is_available = !!is_available;

    if (Object.keys(invUpdates).length > 1) {
      const { error } = await supabase
        .from("inventory")
        .update(invUpdates)
        .eq("id", inventory_id);
      if (error) throw error;
    }

    const prodUpdates: Record<string, any> = {};
    if (name !== undefined) prodUpdates.name = name;
    if (description !== undefined) prodUpdates.description = description;
    if (base_price !== undefined)
      prodUpdates.base_price = base_price === null ? null : Number(base_price);

    if (Object.keys(prodUpdates).length > 0) {
      prodUpdates.updated_at = new Date().toISOString();
      const { error } = await supabase
        .from("products")
        .update(prodUpdates)
        .eq("id", inv.product_id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("RETAILER PRODUCTS PATCH ERROR:", err);
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}

/**
 * DELETE -> soft delete a retailer product's inventory (marks is_available=false)
 */
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const inventoryId = searchParams.get("inventory_id");

    if (!inventoryId) {
      return NextResponse.json(
        { error: "inventory_id is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("inventory")
      .update({ is_available: false, updated_at: new Date().toISOString() })
      .eq("id", inventoryId)
      .eq("owner_id", user.id)
      .eq("owner_type", "retailer");

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("RETAILER PRODUCTS DELETE ERROR:", err);
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}

/**
 * POST -> create product and initial inventory for authenticated retailer
 * - Inserts into products
 * - Inserts product images
 * - Inserts inventory row owned by retailer
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      sku = null,
      description = null,
      category_id = null,
      base_price = null,
      unit = "piece",
      stock = 0,
      images = [],
      specifications = {},
      is_active = true,
    } = body || {};

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { error: "Product name required" },
        { status: 400 }
      );
    }

    // 1) Create product
    const { data: product, error: prodErr } = await supabase
      .from("products")
      .insert({
        name,
        sku,
        description,
        category_id,
        base_price,
        unit,
        specifications,
        is_active,
      })
      .select("*")
      .single();
    if (prodErr) throw prodErr;

    // 2) Add images (first image as primary)
    if (Array.isArray(images) && images.length > 0) {
      const rows = images.map((url: string, idx: number) => ({
        product_id: product.id,
        image_url: url,
        is_primary: idx === 0,
        display_order: idx,
      }));
      const { error: imgErr } = await supabase
        .from("product_images")
        .insert(rows);
      if (imgErr) throw imgErr;
    }

    // 3) Create initial inventory owned by retailer
    const quantity = Number(stock || 0);
    const price =
      base_price !== null && base_price !== undefined ? Number(base_price) : 0;
    const { error: invErr } = await supabase.from("inventory").insert({
      product_id: product.id,
      owner_id: user.id,
      owner_type: "retailer",
      quantity,
      price,
      mrp: price || null,
      is_available: quantity > 0,
    });
    if (invErr) throw invErr;

    // Build simplified response similar to GET result for convenience
    const response = {
      id: product.id,
      name: product.name,
      images: Array.isArray(images) ? images : [],
      category_id: product.category_id ?? null,
      stock: quantity,
      base_price: price,
      created_at: product.created_at ?? null,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err: any) {
    console.error("RETAILER PRODUCTS CREATE ERROR:", err);
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
