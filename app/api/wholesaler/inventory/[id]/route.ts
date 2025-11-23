import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
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

    const { data: product, error } = await supabase
      .from("wholesaler_products")
      .select(
        `
        *,
        category:categories (*)
      `
      )
      .eq("id", id)
      .eq("wholesaler_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching wholesaler product:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ inventory: product });
  } catch (error) {
    console.error("Error in GET /api/wholesaler/inventory/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
      quantity,
      price,
      mrp,
      is_available,
      low_stock_threshold,
      quantity_in_stock,
      wholesale_price,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (quantity !== undefined || quantity_in_stock !== undefined) {
      const qty = quantity !== undefined ? quantity : quantity_in_stock;
      updateData.quantity_in_stock = qty;
      updateData.is_available = qty > 0;
    }
    if (price !== undefined || wholesale_price !== undefined) {
      updateData.wholesale_price =
        price !== undefined ? price : wholesale_price;
    }
    if (mrp !== undefined) updateData.mrp = mrp;
    if (is_available !== undefined) updateData.is_available = is_available;
    if (low_stock_threshold !== undefined)
      updateData.low_stock_threshold = low_stock_threshold;

    const { data: product, error } = await supabase
      .from("wholesaler_products")
      .update(updateData)
      .eq("id", id)
      .eq("wholesaler_id", user.id)
      .select(
        `
        *,
        category:categories (*)
      `
      )
      .single();

    if (error) {
      console.error("Error updating wholesaler product:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ inventory: product });
  } catch (error) {
    console.error("Error in PATCH /api/wholesaler/inventory/[id]:", error);
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

    // Verify user is a wholesaler
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "wholesaler") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
      .from("wholesaler_products")
      .delete()
      .eq("id", id)
      .eq("wholesaler_id", user.id);

    if (error) {
      console.error("Error deleting inventory:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/wholesaler/inventory/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
