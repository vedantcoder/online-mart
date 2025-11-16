import { User, Location } from "./User";
import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type CustomerData = Database["public"]["Tables"]["customers"]["Row"];

/**
 * Customer class - represents end users who browse and purchase products
 */
export class Customer extends User {
  private address?: string;
  private city?: string;
  private state?: string;
  private pincode?: string;
  private location?: Location;
  private preferences: Record<string, unknown>;

  constructor(profile: Profile, customerData: CustomerData) {
    super(profile);
    this.address = customerData.street_address || undefined;
    this.city = customerData.city || undefined;
    this.state = customerData.state || undefined;
    this.pincode = customerData.pincode || undefined;

    if (customerData.latitude && customerData.longitude) {
      this.location = {
        latitude: Number(customerData.latitude),
        longitude: Number(customerData.longitude),
      };
    }

    this.preferences =
      (customerData.preferences as Record<string, unknown>) || {};
  }

  // Getters
  getAddress(): string | undefined {
    return this.address;
  }

  getLocation(): Location | undefined {
    return this.location;
  }

  /**
   * Browse products with optional filters
   */
  async browseProducts(filters?: {
    category_id?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    in_stock?: boolean;
  }) {
    let query = supabase
      .from("products")
      .select(
        `
        *,
        category:categories(*),
        images:product_images(*),
        inventory(*)
      `
      )
      .eq("is_active", true);

    if (filters?.category_id) {
      query = query.eq("category_id", filters.category_id);
    }

    if (filters?.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    if (filters?.min_price) {
      query = query.gte("base_price", filters.min_price);
    }

    if (filters?.max_price) {
      query = query.lte("base_price", filters.max_price);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  /**
   * Get or create customer's cart
   */
  async getCart() {
    // Try to get existing cart
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cart: any;
    const { data, error } = await supabase
      .from("carts")
      .select(
        `
        *,
        items:cart_items(
          *,
          product:products(*),
          seller:profiles(*)
        )
      `
      )
      .eq("customer_id", this.id)
      .single();

    // If no cart exists, create one
    if (error && error.code === "PGRST116") {
      const { data: newCart, error: createError } = await supabase
        .from("carts")
        .insert({ customer_id: this.id })
        .select()
        .single();

      if (createError) throw createError;
      cart = { ...newCart, items: [] };
    } else if (error) {
      throw error;
    } else {
      cart = data;
    }

    return cart;
  }

  /**
   * Add item to cart
   */
  async addToCart(
    productId: string,
    sellerId: string,
    quantity: number,
    price: number
  ) {
    const cart = await this.getCart();

    // Check if item already exists in cart
    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id)
      .eq("product_id", productId)
      .eq("seller_id", sellerId)
      .single();

    if (existing) {
      // Update quantity
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      // Insert new item
      const { error } = await supabase.from("cart_items").insert({
        cart_id: cart.id,
        product_id: productId,
        seller_id: sellerId,
        quantity,
        price_at_addition: price,
      });

      if (error) throw error;
    }

    // Update cart timestamp
    await supabase
      .from("carts")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", cart.id);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(cartItemId: string) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (error) throw error;
  }

  /**
   * Update cart item quantity
   */
  async updateCartItemQuantity(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeFromCart(cartItemId);
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId);

    if (error) throw error;
  }

  /**
   * Get customer's orders
   */
  async getOrders(limit: number = 20) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items(*),
        seller:profiles(*),
        delivery_person:profiles(*)
      `
      )
      .eq("customer_id", this.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items(*),
        seller:profiles(*),
        delivery_person:profiles(*),
        tracking:order_tracking(*)
      `
      )
      .eq("id", orderId)
      .eq("customer_id", this.id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Submit feedback for a product
   */
  async submitFeedback(
    productId: string,
    orderId: string,
    rating: number,
    comment?: string,
    title?: string
  ) {
    const { error } = await supabase.from("feedback").insert({
      customer_id: this.id,
      product_id: productId,
      order_id: orderId,
      rating,
      comment,
      title,
      is_verified_purchase: true,
    });

    if (error) throw error;
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(productId: string) {
    const { error } = await supabase.from("wishlists").insert({
      customer_id: this.id,
      product_id: productId,
    });

    if (error && error.code !== "23505") throw error; // Ignore duplicate
  }

  /**
   * Get wishlist
   */
  async getWishlist() {
    const { data, error } = await supabase
      .from("wishlists")
      .select(
        `
        *,
        product:products(
          *,
          images:product_images(*),
          category:categories(*)
        )
      `
      )
      .eq("customer_id", this.id)
      .order("added_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations() {
    // Get user's browsing history (for future collaborative filtering)
    await supabase
      .from("product_views")
      .select("product_id")
      .eq("user_id", this.id)
      .limit(10);

    // For now, return products from similar categories
    // In production, implement collaborative filtering
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories(*),
        images:product_images(*)
      `
      )
      .eq("is_active", true)
      .limit(12);

    if (error) throw error;
    return data;
  }

  /**
   * Get dashboard data
   */
  async getDashboardData() {
    const [orders, cart, wishlist, notifications] = await Promise.all([
      this.getOrders(5),
      this.getCart(),
      this.getWishlist(),
      this.getNotifications(5),
    ]);

    return {
      recentOrders: orders,
      cart,
      wishlistCount: wishlist?.length || 0,
      unreadNotifications: notifications?.filter((n) => !n.is_read).length || 0,
    };
  }
}
