export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET -> fetch single retailer inventory/product by inventory id
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const p = (context.params as any)?.then
      ? await (context.params as Promise<{ id: string }>)
      : (context.params as { id: string });
    const inventoryId = p.id;
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
        product_id,
        quantity,
        price,
        mrp,
        low_stock_threshold,
        is_available,
        product:products(
          id,
          name,
          description,
          category_id,
          base_price,
          unit,
          product_images(id, image_url, is_primary, display_order)
        )
      `
      )
      .eq("id", inventoryId)
      .eq("owner_id", user.id)
      .eq("owner_type", "retailer")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ inventory: data });
  } catch (err: any) {
    console.error("RETAILER PRODUCT GET ERROR:", err);
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
