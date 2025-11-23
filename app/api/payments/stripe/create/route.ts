export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

// POST /api/payments/stripe/create
// Body: { order_id: string }
// Returns: { clientSecret, paymentIntentId }
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
    const { order_id } = body || {};
    if (!order_id) {
      return NextResponse.json({ error: "order_id required" }, { status: 400 });
    }
    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .select("id, customer_id, total_amount, payment_status, order_number")
      .eq("id", order_id)
      .single();
    if (orderErr || !orderRow) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (orderRow.customer_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (orderRow.payment_status === "completed") {
      return NextResponse.json(
        { error: "Order already paid" },
        { status: 409 }
      );
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
    const amountInSmallestUnit = Math.round(
      Number(orderRow.total_amount) * 100
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Order #${orderRow.order_number}`,
            },
            unit_amount: amountInSmallestUnit,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer/orders/${orderRow.id}?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer/orders/${orderRow.id}?canceled=true`,
      metadata: {
        order_id: orderRow.id,
        order_number: orderRow.order_number || "",
      },
      customer_email: user.email,
    });

    await supabase
      .from("orders")
      .update({
        payment_gateway: "stripe",
        payment_gateway_order_id: session.id,
      })
      .eq("id", orderRow.id);

    return NextResponse.json({
      sessionUrl: session.url,
      sessionId: session.id,
    });
  } catch (err: unknown) {
    console.error("STRIPE CREATE ERROR", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
