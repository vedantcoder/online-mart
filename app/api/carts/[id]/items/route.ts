import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const cartId = context.params.id;
    const body = await req.json();

    const { product_id, seller_id, quantity, price_at_addition } = body;

    const { data, error } = await supabase
      .from("cart_items")
      .insert({
        cart_id: cartId,
        product_id,
        seller_id,
        quantity,
        price_at_addition
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const cartId = context.params.id;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
