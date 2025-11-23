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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const isAvailable = searchParams.get("isAvailable");

    const offset = (page - 1) * limit;

    let query = supabase
      .from("wholesaler_products")
      .select(
        `
        *,
        category:categories (*)
      `,
        { count: "exact" }
      )
      .eq("wholesaler_id", user.id)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    if (isAvailable !== null && isAvailable !== undefined) {
      query = query.eq("is_available", isAvailable === "true");
    }

    const { data: products, error, count } = await query;

    if (error) {
      console.error("Error fetching wholesaler products:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      inventory: products,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/wholesaler/inventory:", error);
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

    // Verify user is a wholesaler
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "wholesaler") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      sku = null,
      description = null,
      category_id = null,
      unit = "piece",
      quantity_in_stock = 0,
      wholesale_price = null,
      mrp = null,
      low_stock_threshold = 5,
      is_available = true,
      images = [],
      specifications = {},
    } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { error: "Product name required" },
        { status: 400 }
      );
    }

    if (!wholesale_price || Number(wholesale_price) <= 0) {
      return NextResponse.json(
        { error: "Wholesale price required" },
        { status: 400 }
      );
    }

    // Format images as JSONB array
    const imagesJsonb = images.map((url: string, idx: number) => ({
      url,
      is_primary: idx === 0,
      display_order: idx,
    }));

    // Create wholesaler product
    const { data: product, error: prodErr } = await supabase
      .from("wholesaler_products")
      .insert({
        wholesaler_id: user.id,
        name,
        sku,
        description,
        category_id,
        unit,
        wholesale_price: Number(wholesale_price),
        mrp: mrp ? Number(mrp) : null,
        quantity_in_stock: Number(quantity_in_stock || 0),
        low_stock_threshold: Number(low_stock_threshold ?? 5),
        is_available: is_available && Number(quantity_in_stock) > 0,
        images: imagesJsonb,
        specifications,
      })
      .select(
        `
        *,
        category:categories (*)
      `
      )
      .single();

    if (prodErr) {
      console.error("Error creating wholesaler product:", prodErr);
      return NextResponse.json({ error: prodErr.message }, { status: 500 });
    }

    return NextResponse.json({ inventory: product }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/wholesaler/inventory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
