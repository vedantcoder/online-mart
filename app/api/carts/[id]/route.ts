import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: customerId } = await context.params;

    // Fetch cart
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("*")
      .eq("customer_id", customerId)
      .single();

    if (cartError) {
      if (cartError.code === "PGRST116") {
        // Not found
        return new NextResponse(null, { status: 404 });
      }
      throw cartError;
    }

    // Fetch items
    const { data: items, error: itemsError } = await supabase
      .from("cart_items")
      .select("*, product:products(*)")
      .eq("cart_id", cart.id);

    if (itemsError) throw itemsError;

    return NextResponse.json({ ...cart, items });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
