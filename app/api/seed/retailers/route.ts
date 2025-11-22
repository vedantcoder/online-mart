export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Simple protected seeding route.
// Requires header `x-seed-secret` matching process.env.SEED_SECRET.
// Creates two retailer users if they don't exist and assigns inventory for every product.

const RETAILERS = [
  {
    email: "retailer.alpha@example.com",
    password: "Password123!",
    full_name: "Alpha Retail",
    phone: "+911111111111",
    retailer: {
      shop_name: "Alpha Retail",
      shop_city: "Mumbai",
      shop_state: "MH",
      shop_pincode: "400001",
    },
  },
  {
    email: "retailer.beta@example.com",
    password: "Password123!",
    full_name: "Beta Retail",
    phone: "+912222222222",
    retailer: {
      shop_name: "Beta Retail",
      shop_city: "Delhi",
      shop_state: "DL",
      shop_pincode: "110001",
    },
  },
];

export async function GET(req: Request) {
  try {
    const secretHeader = req.headers.get("x-seed-secret");
    const expected = process.env.SEED_SECRET;
    if (!expected || secretHeader !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use server client for regular table operations (RLS respected) and admin for user creation.
    const serverClient = await createClient();

    // Fetch all products.
    const { data: products, error: prodErr } = await serverClient
      .from("products")
      .select("id, base_price");
    if (prodErr) throw prodErr;

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: "No products found to assign" },
        { status: 400 }
      );
    }

    const results: any[] = [];

    for (const r of RETAILERS) {
      // Check existing profile
      const { data: existingProfile } = await serverClient
        .from("profiles")
        .select("id")
        .eq("email", r.email)
        .single();

      let retailerProfileId = existingProfile?.id;

      if (!retailerProfileId) {
        // Create auth user (auto-confirm via admin) & profile/retailer rows.
        const { data: userCreate, error: userErr } =
          await supabaseAdmin.auth.admin.createUser({
            email: r.email,
            password: r.password,
            email_confirm: true,
            user_metadata: {
              full_name: r.full_name,
              phone: r.phone,
              role: "retailer",
            },
          });
        if (userErr) throw userErr;
        retailerProfileId = userCreate.user.id;

        // Insert profile
        const { error: profileErr } = await serverClient
          .from("profiles")
          .insert({
            id: retailerProfileId,
            email: r.email,
            phone: r.phone,
            full_name: r.full_name,
            role: "retailer",
          });
        if (profileErr) throw profileErr;

        // Insert retailer row
        const { error: retailerErr } = await serverClient
          .from("retailers")
          .insert({
            id: retailerProfileId,
            ...r.retailer,
          });
        if (retailerErr) throw retailerErr;
      }

      // Assign inventory for each product (skip if inventory row already exists for this product & retailer)
      let createdCount = 0;
      for (const p of products) {
        const { data: existingInv } = await serverClient
          .from("inventory")
          .select("id")
          .eq("product_id", p.id)
          .eq("owner_id", retailerProfileId!)
          .eq("owner_type", "retailer")
          .single();

        if (existingInv) continue;

        // Derive quantity & price
        const quantity = Math.floor(Math.random() * 41) + 10; // 10-50
        const basePrice = Number(p.base_price ?? 100);
        const priceVariation = (Math.random() * 0.15 - 0.05) * basePrice; // -5% to +10%
        const price = Math.max(
          1,
          Math.round((basePrice + priceVariation) * 100) / 100
        );
        const mrp = Math.round(basePrice * 1.05 * 100) / 100; // 5% higher reference

        const { error: invErr } = await serverClient.from("inventory").insert({
          product_id: p.id,
          owner_id: retailerProfileId,
          owner_type: "retailer",
          quantity,
          price,
          mrp,
          is_available: quantity > 0,
        });
        if (invErr) throw invErr;
        createdCount++;
      }

      results.push({
        email: r.email,
        profile_id: retailerProfileId,
        new_inventory_rows: createdCount,
      });
    }

    return NextResponse.json({ seeded: true, retailers: results });
  } catch (err: any) {
    console.error("SEED RETAILERS ERROR", err);
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}
