export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Stripe from "stripe";

// POST /api/payments/stripe/verify
// Body: { order_id: string, payment_intent_id: string }
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
    const { order_id, payment_intent_id, session_id } = body || {};
    if (!order_id || (!payment_intent_id && !session_id)) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .select("id, customer_id, payment_status")
      .eq("id", order_id)
      .single();
    if (orderErr || !orderRow) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (orderRow.customer_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (orderRow.payment_status === "completed") {
      return NextResponse.json({ success: true, alreadyPaid: true });
    }
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe key not configured" },
        { status: 500 }
      );
    }
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-11-17.clover",
    });

    let finalPaymentIntentId = payment_intent_id;

    if (session_id) {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status !== "paid") {
        return NextResponse.json(
          { error: `Payment status is ${session.payment_status}` },
          { status: 400 }
        );
      }
      finalPaymentIntentId = session.payment_intent as string;
    } else {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        payment_intent_id
      );
      if (paymentIntent.status !== "succeeded") {
        return NextResponse.json(
          { error: `Payment status is ${paymentIntent.status}` },
          { status: 400 }
        );
      }
    }

    const updateData = {
      payment_status: "completed",
      payment_method: "online",
      payment_gateway: "stripe",
      payment_gateway_order_id: session_id || finalPaymentIntentId, // Store session ID if available, else PI ID
      payment_gateway_payment_id: finalPaymentIntentId,
      updated_at: new Date().toISOString(),
    };

    // Before marking as completed, decrement inventory for each order item (idempotent: only when not completed yet)
    // Fetch order details with seller and items using admin client to bypass RLS
    const { data: fullOrder } = await supabaseAdmin
      .from("orders")
      .select(
        `id, seller_id,
         items:order_items(product_id, quantity, product_name)`
      )
      .eq("id", order_id)
      .single();

    if (fullOrder && orderRow.payment_status !== "completed") {
      for (const it of fullOrder.items || []) {
        // Check inventory
        const { data: invRow } = await supabaseAdmin
          .from("inventory")
          .select("id, quantity")
          .eq("product_id", it.product_id)
          .eq("owner_id", fullOrder.seller_id)
          .eq("owner_type", "retailer")
          .single();
        const cur = Number(invRow?.quantity ?? 0);
        const newQty = Math.max(cur - Number(it.quantity ?? 0), 0);
        await supabaseAdmin
          .from("inventory")
          .update({
            quantity: newQty,
            is_available: newQty > 0,
            updated_at: new Date().toISOString(),
          })
          .eq("product_id", it.product_id)
          .eq("owner_id", fullOrder.seller_id)
          .eq("owner_type", "retailer");
      }
    }

    // Use admin client to update order status to bypass RLS restrictions on status updates
    await supabaseAdmin.from("orders").update(updateData).eq("id", order_id);

    // After successful payment, clear the customer's cart items
    try {
      // Use admin client to ensure we can find and clear the cart regardless of RLS
      const { data: customerOrder } = await supabaseAdmin
        .from("orders")
        .select("customer_id")
        .eq("id", order_id)
        .single();
      if (customerOrder?.customer_id) {
        const { data: cartRow } = await supabaseAdmin
          .from("carts")
          .select("id")
          .eq("customer_id", customerOrder.customer_id)
          .single();
        if (cartRow?.id) {
          await supabaseAdmin
            .from("cart_items")
            .delete()
            .eq("cart_id", cartRow.id);
        }
      }
    } catch (e) {
      console.error("Cart clear after payment failed (non-fatal):", e);
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("STRIPE VERIFY ERROR", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
