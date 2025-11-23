import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Get all available delivery persons
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user profile to verify they are retailer/wholesaler
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["retailer", "wholesaler"].includes(profile.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data: deliveryPersons, error: dpErr } = await supabase
      .from("delivery_persons")
      .select(
        `
        *,
        profiles!id(full_name, email, phone)
      `
      )
      .eq("is_available", true);

    if (dpErr) throw dpErr;

    return NextResponse.json({ deliveryPersons: deliveryPersons || [] });
  } catch (err: unknown) {
    console.error("DELIVERY PERSONS GET ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
