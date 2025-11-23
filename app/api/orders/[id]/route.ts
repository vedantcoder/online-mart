import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderStatusEmail } from "@/lib/utils/email";

// GET - Get single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select(
        `
        *,
        customer:customers!customer_id(id, street_address, city, state, pincode, profiles!id(full_name, email, phone)),
        seller:profiles!seller_id(id, full_name, email, phone, role),
        delivery_person:delivery_persons(id, profiles!id(full_name, phone, email)),
        items:order_items(id, product_id, product_name, product_image, quantity, price_per_unit, subtotal)
      `
      )
      .eq("id", id)
      .single();

    if (orderErr) throw orderErr;
    // Normalize shape: flatten delivery_person to expected { full_name, phone }
    let normalized = order as any;
    if (normalized?.delivery_person?.profiles) {
      normalized = {
        ...normalized,
        delivery_person: {
          full_name: normalized.delivery_person.profiles.full_name,
          phone: normalized.delivery_person.profiles.phone,
        },
      };
    }

    return NextResponse.json({ order: normalized });
  } catch (err: unknown) {
    console.error("ORDER GET ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

// PATCH - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { status, delivery_person_id, payment_status } = body;

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get existing order
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("*, customer:customers!customer_id(id)")
      .eq("id", id)
      .single();

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Authorization checks
    if (profile.role === "retailer" || profile.role === "wholesaler") {
      if (existingOrder.seller_id !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else if (profile.role === "delivery") {
      if (existingOrder.delivery_person_id !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updateData: Record<string, string | number | boolean> = {};

    // Retailers/Wholesalers can update status to: packed, shipped
    // They can also assign delivery person
    if (profile.role === "retailer" || profile.role === "wholesaler") {
      if (status && ["packed", "shipped"].includes(status)) {
        updateData.status = status;

        // If status is shipped, set estimated delivery to 3 days from now
        if (status === "shipped") {
          const estimatedDelivery = new Date();
          estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);
          updateData.estimated_delivery = estimatedDelivery.toISOString();
        }
      }

      const assigningDeliveryPerson = !!delivery_person_id;
      if (assigningDeliveryPerson) {
        updateData.delivery_person_id = delivery_person_id;
        // Do NOT change order status to 'assigned' to satisfy DB constraint; we'll still notify as assigned
      }

      if (
        payment_status &&
        ["completed", "failed", "pending"].includes(payment_status)
      ) {
        updateData.payment_status = payment_status;
      }
      // Optional metadata passthrough (e.g., manual offline payment confirmation)
      if (body.payment_method) updateData.payment_method = body.payment_method;
      if (body.payment_gateway)
        updateData.payment_gateway = body.payment_gateway;
      if (body.payment_gateway_payment_id)
        updateData.payment_gateway_payment_id = body.payment_gateway_payment_id;
      if (body.payment_gateway_order_id)
        updateData.payment_gateway_order_id = body.payment_gateway_order_id;
    }

    // Delivery persons can update status to: out_for_delivery, delivered
    if (profile.role === "delivery") {
      if (status && ["out_for_delivery", "delivered"].includes(status)) {
        updateData.status = status;

        // If delivered, set actual delivery time
        if (status === "delivered") {
          updateData.actual_delivery = new Date().toISOString();
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 }
      );
    }

    // Update order
    const { data: updatedOrder, error: updateErr } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Create notification for customer
    const notificationMessages: Record<string, string> = {
      packed: "Your order has been packed",
      shipped: "Your order has been shipped",
      assigned: "A delivery partner has been assigned to your order",
      out_for_delivery: "Your order is out for delivery",
      delivered: "Your order has been delivered",
    };
    const finalStatus = (updateData.status as string) || status;
    const didAssign = !!updateData.delivery_person_id && !status;
    const customerId =
      (existingOrder as any).customer?.id || (existingOrder as any).customer_id;

    if ((finalStatus && customerId) || (didAssign && customerId)) {
      const statusKey = didAssign ? "assigned" : finalStatus;
      if (statusKey && notificationMessages[statusKey]) {
        await supabase.from("notifications").insert({
          user_id: customerId,
          type: "order",
          title: "Order Status Update",
          message: `${notificationMessages[statusKey]} - Order #${existingOrder.order_number}`,
          link: `/customer/orders/${id}`,
          metadata: {
            order_id: id,
            order_number: existingOrder.order_number,
            status: statusKey,
          },
        });

        // Get customer email
        const { data: customerProfile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", customerId)
          .single();

        // Send email notification
        if (customerProfile?.email) {
          await sendOrderStatusEmail({
            to: customerProfile.email,
            subject: "Order Status Update - Online-MART",
            message: notificationMessages[statusKey],
            orderNumber: existingOrder.order_number,
            status: statusKey,
          });
        }
      }
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (err: unknown) {
    console.error("ORDER UPDATE ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
