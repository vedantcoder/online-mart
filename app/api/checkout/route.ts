export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Stripe from "stripe";

/**
 * POST /api/checkout
 * Body: { delivery_address: { street, city, state, pincode }, delivery_notes?: string }
 * Creates an order from the customer's cart
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
    const { delivery_address, delivery_notes, payment_method } = body || {};

    if (
      !delivery_address ||
      !delivery_address.street ||
      !delivery_address.city ||
      !delivery_address.state ||
      !delivery_address.pincode
    ) {
      return NextResponse.json(
        { error: "Complete delivery address is required" },
        { status: 400 }
      );
    }

    // Get customer profile
    const { data: customer, error: customerErr } = await supabase
      .from("customers")
      .select("id")
      .eq("id", user.id)
      .single();

    if (customerErr || !customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Get customer's cart with items
    const { data: cart, error: cartErr } = await supabase
      .from("carts")
      .select(
        `
        id,
        items:cart_items(
          id,
          product_id,
          quantity,
          price_at_addition,
          product:products(
            id,
            name,
            images:product_images(image_url, is_primary),
            inventory(owner_id)
          )
        )
      `
      )
      .eq("customer_id", user.id)
      .single();

    if (cartErr) {
      console.error("Cart fetch error:", cartErr);
      return NextResponse.json(
        { error: `Cart error: ${cartErr.message}` },
        { status: 400 }
      );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum: number, item: { price_at_addition: number; quantity: number }) =>
        sum + item.price_at_addition * item.quantity,
      0
    );
    const taxRate = 0.18; // 18% GST
    const taxAmount = subtotal * taxRate;
    const deliveryCharges = subtotal >= 500 ? 0 : 50; // Free delivery above 500
    const totalAmount = subtotal + taxAmount + deliveryCharges;

    // Get the retailer/seller ID from the first product's inventory (assuming single-seller cart)
    const firstItem = cart.items[0];
    const firstProduct = Array.isArray(firstItem?.product)
      ? firstItem.product[0]
      : firstItem?.product;
    const inventory = Array.isArray(firstProduct?.inventory)
      ? firstProduct.inventory[0]
      : firstProduct?.inventory;
    const sellerId = inventory?.owner_id;
    if (!sellerId) {
      return NextResponse.json(
        { error: "Seller not found for products" },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    const isOnline = payment_method === "online";
    const isCOD =
      payment_method === "cash_on_delivery" || payment_method === "cod";
    const paymentMethodToStore = isOnline
      ? "online"
      : isCOD
      ? "cash_on_delivery"
      : null;
    const paymentStatusToStore = isOnline
      ? "pending"
      : isCOD
      ? "pending_cod"
      : "pending";

    // Create order using admin client to bypass RLS
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: user.id,
        seller_id: sellerId,
        status: "pending",
        payment_status: paymentStatusToStore,
        payment_method: paymentMethodToStore,
        subtotal,
        tax_amount: taxAmount,
        delivery_charges: deliveryCharges,
        discount_amount: 0,
        total_amount: totalAmount,
        delivery_address,
        delivery_notes: delivery_notes || null,
        estimated_delivery: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // 7 days from now
      })
      .select()
      .single();

    if (orderErr || !order) {
      console.error("Order creation error:", orderErr);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = cart.items.map((item) => {
      const productData = Array.isArray(item.product)
        ? item.product[0]
        : item.product;
      const primaryImage = productData?.images?.find((img) => img.is_primary);
      return {
        order_id: order.id,
        product_id: item.product_id,
        product_name: productData?.name || "Unknown Product",
        product_image: primaryImage?.image_url || null,
        quantity: item.quantity,
        price_per_unit: item.price_at_addition,
        subtotal: item.price_at_addition * item.quantity,
      };
    });

    const { error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsErr) {
      console.error("Order items creation error:", itemsErr);
      // Rollback: delete the order
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 }
      );
    }

    // Clear the cart
    await supabase.from("cart_items").delete().eq("cart_id", cart.id);

    // If online, create Stripe PaymentIntent and return clientSecret
    if (isOnline) {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        return NextResponse.json(
          { error: "Stripe key not configured" },
          { status: 500 }
        );
      }
      const stripe = new Stripe(stripeSecretKey);
      const amountInSmallestUnit = Math.round(Number(order.total_amount) * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInSmallestUnit,
        currency: "inr",
        metadata: {
          order_id: order.id,
          order_number: order.order_number || "",
        },
        automatic_payment_methods: { enabled: true },
      });

      await supabaseAdmin
        .from("orders")
        .update({
          payment_gateway: "stripe",
          payment_gateway_order_id: paymentIntent.id,
        })
        .eq("id", order.id);

      return NextResponse.json({
        success: true,
        order: {
          id: order.id,
          order_number: order.order_number,
          total_amount: order.total_amount,
          status: order.status,
          payment_status: order.payment_status,
        },
        stripe: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        },
      });
    }

    // COD or default path
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        status: order.status,
        payment_status: order.payment_status,
      },
    });
  } catch (err: unknown) {
    console.error("CHECKOUT ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
