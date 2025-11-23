import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a retailer
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "retailer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all verified wholesalers
    const { data: wholesalers, error } = await supabase
      .from("wholesalers")
      .select(
        `
        id,
        business_name,
        business_city,
        business_state,
        is_verified,
        profile:profiles (
          id,
          full_name,
          email,
          phone
        )
      `
      )
      .eq("is_verified", true)
      .order("business_name");

    if (error) {
      console.error("Error fetching wholesalers:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ wholesalers });
  } catch (error) {
    console.error("Error in GET /api/retailer/wholesalers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
