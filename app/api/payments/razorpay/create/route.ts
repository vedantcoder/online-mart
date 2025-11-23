export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

/**
 * POST /api/payments/stripe/create
 * Body: { order_id: string }
 * Returns: { clientSecret, paymentIntentId }
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
    const { order_id } = body || {};
    if (!order_id) {
      return NextResponse.json({ error: "order_id required" }, { status: 400 });
    }

    // Fetch the internal order belonging to this customer
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
      apiVersion: "2024-11-20.acacia",
    });

    // Amount in smallest currency unit (paise for INR)
    const amountInCents = Math.round(Number(orderRow.total_amount) * 100);

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "inr",
      metadata: {
        order_id: orderRow.id,
        order_number: orderRow.order_number || "",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Store gateway payment intent id
    await supabase
      .from("orders")
      .update({
        payment_gateway: "stripe",
        payment_gateway_order_id: paymentIntent.id,
      })
      .eq("id", orderRow.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err: unknown) {
    console.error("STRIPE CREATE ERROR", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
