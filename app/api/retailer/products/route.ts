export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET -> list products for authenticated retailer
 */
export async function GET(req: Request) {
  try {
    const supabase = await createClient({ req, res: undefined as any });
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("products")
      .select("id, name, images, category_id, stock, base_price, created_at")
      .eq("retailer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("RETAILER PRODUCTS GET ERROR:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

/**
 * POST -> create product for authenticated retailer
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient({ req, res: undefined as any });
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
      sku,
      description,
      category_id = null,
      base_price = null,
      unit = "piece",
      stock = 0,
      images = [],
      specifications = {},
      is_active = true,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Product name required" }, { status: 400 });
    }

    const insertPayload = {
      retailer_id: user.id,
      name,
      sku,
      description,
      category_id,
      base_price,
      unit,
      stock,
      images,
      specifications,
      is_active,
    };

    const { data, error } = await supabase.from("products").insert(insertPayload).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("RETAILER PRODUCTS CREATE ERROR:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}