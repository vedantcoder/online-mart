import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Get customer queries
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customer_id");
    const status = searchParams.get("status");

    // Build query based on user role
    let query = supabase
      .from("customer_queries")
      .select(
        `
        *,
        customer:customers!inner(
          profile:profiles!inner(
            full_name,
            phone
          )
        ),
        order:orders(
          order_number
        )
      `
      )
      .order("created_at", { ascending: false });

    // Customers can only see their own queries
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("id", user.id)
      .single();

    if (customer) {
      query = query.eq("customer_id", user.id);
    }

    if (customerId && !customer) {
      // Only non-customers (support staff) can filter by customer_id
      query = query.eq("customer_id", customerId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ queries: data || [] });
  } catch (error) {
    console.error("Error fetching queries:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch queries";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - Create new query
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a customer
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!customer) {
      return NextResponse.json(
        { error: "Only customers can create queries" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { order_id, subject, description, priority } = body;

    if (!subject || !description) {
      return NextResponse.json(
        { error: "Subject and description are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("customer_queries")
      .insert({
        customer_id: user.id,
        order_id: order_id || null,
        subject,
        description,
        priority: priority || "medium",
        status: "open",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ query: data }, { status: 201 });
  } catch (error) {
    console.error("Error creating query:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create query";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT - Update query status
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, resolution_notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Query ID is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, string> = {};

    if (status) {
      updateData.status = status;
      if (status === "resolved" || status === "closed") {
        updateData.resolved_at = new Date().toISOString();
      }
    }

    if (resolution_notes) {
      updateData.resolution_notes = resolution_notes;
    }

    const { data, error } = await supabase
      .from("customer_queries")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ query: data });
  } catch (error) {
    console.error("Error updating query:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update query";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
