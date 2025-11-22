import { supabase } from "@/lib/supabase/client";

// Adapted to single-table wishlist design: each row is one product wishlisted by a customer.
// Schema (from supabase.txt): wishlists(id, customer_id, product_id, added_at)
export class WishlistService {
  static async getWishlist(customerId: string) {
    const { data, error } = await supabase
      .from("wishlists")
      .select(
        `
        id,
        product_id,
        added_at,
        product:products(
          *,
          images:product_images(*),
          inventory(*)
        )
      `
      )
      .eq("customer_id", customerId)
      .order("added_at", { ascending: false });

    if (error) throw error;
    return { items: data || [] };
  }

  static async addItem(customerId: string, productId: string) {
    // Insert ignoring duplicates (unique constraint should exist on (customer_id, product_id))
    const { error } = await supabase.from("wishlists").insert({
      customer_id: customerId,
      product_id: productId,
    });
    if (error && error.code !== "23505") throw error; // ignore duplicate
  }

  static async removeItem(customerId: string, productId: string) {
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("customer_id", customerId)
      .eq("product_id", productId);
    if (error) throw error;
  }
}
