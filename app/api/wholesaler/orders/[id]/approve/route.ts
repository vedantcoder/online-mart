import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is missing" },
        { status: 400 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "wholesaler") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: order, error } = await supabase
      .from("retailer_wholesaler_orders")
      .update({
        status: "confirmed",
        fulfilled_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("wholesaler_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error confirming order:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error in POST /api/wholesaler/orders/[id]/approve:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
