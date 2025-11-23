export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

/**
 * POST /api/payments/stripe/verify
 * Body: { order_id: string, payment_intent_id: string }
 */
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
    const { order_id, payment_intent_id } = body || {};

    if (!order_id || !payment_intent_id) {
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
      apiVersion: "2024-11-20.acacia",
    });

    // Verify payment intent status with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(
      payment_intent_id
    );

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: `Payment status is ${paymentIntent.status}` },
        { status: 400 }
      );
    }

    // Update payment status + metadata
    const updateData: Record<string, string> = {
      payment_status: "completed",
      payment_method: "online",
      payment_gateway: "stripe",
      payment_gateway_order_id: paymentIntent.id,
      payment_gateway_payment_id: paymentIntent.id,
      updated_at: new Date().toISOString(),
    };

    await supabase.from("orders").update(updateData).eq("id", order_id);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("STRIPE VERIFY ERROR", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
