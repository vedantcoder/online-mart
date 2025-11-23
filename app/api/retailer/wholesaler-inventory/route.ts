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

    const searchParams = request.nextUrl.searchParams;
    const wholesalerId = searchParams.get("wholesalerId");

    if (!wholesalerId) {
      return NextResponse.json(
        { error: "Wholesaler ID is required" },
        { status: 400 }
      );
    }

    // Get wholesaler's inventory that's available for retailers
    const { data: inventory, error } = await supabase
      .from("inventory")
      .select(
        `
        *,
        product:products (
          *,
          category:categories (*),
          images:product_images (*)
        )
      `
      )
      .eq("owner_id", wholesalerId)
      .eq("owner_type", "wholesaler")
      .eq("is_available", true)
      .gt("quantity", 0)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching wholesaler inventory:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ inventory });
  } catch (error) {
    console.error("Error in GET /api/retailer/wholesaler-inventory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
