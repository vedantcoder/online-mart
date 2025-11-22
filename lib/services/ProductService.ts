import { supabase } from "@/lib/supabase/client";
import {
  Product,
  ProductModel,
  Category,
  Inventory,
  ProductImage,
} from "@/lib/models/Product";

export class ProductService {
  // ==================== CATEGORY OPERATIONS ====================

  // Get all categories
  static async getCategories(includeInactive = false): Promise<Category[]> {
    let query = supabase.from("categories").select("*").order("name");

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
    return data || [];
  }

  // Get category by ID
  static async getCategoryById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(`Failed to fetch category: ${error.message}`);
    return data;
  }

  // Get category by slug
  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw new Error(`Failed to fetch category: ${error.message}`);
    return data;
  }

  // Create category
  static async createCategory(category: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .insert([category])
      .select()
      .single();

    if (error) throw new Error(`Failed to create category: ${error.message}`);
    return data;
  }

  // Update category
  static async updateCategory(
    id: string,
    updates: Partial<Category>
  ): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update category: ${error.message}`);
    return data;
  }

  // ==================== PRODUCT OPERATIONS ====================

  // Get all products (with filters)
  static async getProducts(filters?: {
    category_id?: string;
    search?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ products: ProductModel[]; count: number }> {
    let query = supabase.from("products").select(
      `
        *,
        category:categories(*),
        images:product_images(*),
        inventory(*)
      `,
      { count: "exact" }
    );

    if (filters?.category_id) {
      query = query.eq("category_id", filters.category_id);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      );
    }

    query = query.order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to fetch products: ${error.message}`);

    const products = (data || []).map(
      (p: Product) => new ProductModel(p as Product)
    );
    return { products, count: count || 0 };
  }

  // Get product by ID
  static async getProductById(id: string): Promise<ProductModel | null> {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories(*),
        images:product_images(*),
        inventory(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return new ProductModel(data as Product);
  }

  // Create product
  static async createProduct(product: Partial<Product>): Promise<ProductModel> {
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          ...product,
          specifications: product.specifications || {},
          unit: product.unit || "piece",
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Failed to create product: ${error.message}`);
    return new ProductModel(data as Product);
  }

  // Update product
  static async updateProduct(
    id: string,
    updates: Partial<Product>
  ): Promise<ProductModel> {
    const { data, error } = await supabase
      .from("products")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update product: ${error.message}`);
    return new ProductModel(data as Product);
  }

  // Delete product (soft delete by setting is_active to false)
  static async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw new Error(`Failed to delete product: ${error.message}`);
  }

  // ==================== PRODUCT IMAGE OPERATIONS ====================

  // Add product image
  static async addProductImage(
    productId: string,
    imageUrl: string,
    isPrimary = false,
    displayOrder = 0
  ): Promise<ProductImage> {
    // If this is primary, unset all other primary images for this product
    if (isPrimary) {
      await supabase
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", productId);
    }

    const { data, error } = await supabase
      .from("product_images")
      .insert([
        {
          product_id: productId,
          image_url: imageUrl,
          is_primary: isPrimary,
          display_order: displayOrder,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Failed to add product image: ${error.message}`);
    return data;
  }

  // Delete product image
  static async deleteProductImage(imageId: string): Promise<void> {
    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId);

    if (error)
      throw new Error(`Failed to delete product image: ${error.message}`);
  }

  // Set primary image
  static async setPrimaryImage(
    productId: string,
    imageId: string
  ): Promise<void> {
    // Unset all primary images for this product
    await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);

    // Set the specified image as primary
    const { error } = await supabase
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", imageId);

    if (error) throw new Error(`Failed to set primary image: ${error.message}`);
  }

  // ==================== INVENTORY OPERATIONS ====================

  // Get inventory for seller
  static async getInventoryForSeller(sellerId: string): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from("inventory")
      .select(
        `
        *,
        product:products(
          *,
          category:categories(*),
          images:product_images(*)
        )
      `
      )
      .eq("owner_id", sellerId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch inventory: ${error.message}`);
    return data || [];
  }

  // Get inventory by product and seller
  static async getInventoryByProductAndSeller(
    productId: string,
    sellerId: string
  ): Promise<Inventory | null> {
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .eq("product_id", productId)
      .eq("owner_id", sellerId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw new Error(`Failed to fetch inventory: ${error.message}`);
    }

    return data;
  }

  // Create or update inventory
  static async upsertInventory(
    inventory: Partial<Inventory>
  ): Promise<Inventory> {
    const { data, error } = await supabase
      .from("inventory")
      .upsert([
        {
          ...inventory,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Failed to upsert inventory: ${error.message}`);
    return data;
  }

  // Update stock quantity
  static async updateStockQuantity(
    inventoryId: string,
    newQuantity: number
  ): Promise<Inventory> {
    const { data, error } = await supabase
      .from("inventory")
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inventoryId)
      .select()
      .single();

    if (error)
      throw new Error(`Failed to update stock quantity: ${error.message}`);
    return data;
  }

  // Update inventory price
  static async updateInventoryPrice(
    inventoryId: string,
    newPrice: number,
    newMrp?: number
  ): Promise<Inventory> {
    const { data, error } = await supabase
      .from("inventory")
      .update({
        price: newPrice,
        ...(newMrp !== undefined && { mrp: newMrp }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", inventoryId)
      .select()
      .single();

    if (error)
      throw new Error(`Failed to update inventory price: ${error.message}`);
    return data;
  }

  // Toggle inventory availability
  static async toggleInventoryAvailability(
    inventoryId: string,
    isAvailable: boolean
  ): Promise<Inventory> {
    const { data, error } = await supabase
      .from("inventory")
      .update({
        is_available: isAvailable,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inventoryId)
      .select()
      .single();

    if (error)
      throw new Error(
        `Failed to toggle inventory availability: ${error.message}`
      );
    return data;
  }

  // Get low stock products for seller
  static async getLowStockProducts(sellerId: string): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from("inventory")
      .select(
        `
        *,
        product:products(
          *,
          category:categories(*),
          images:product_images(*)
        )
      `
      )
      .eq("owner_id", sellerId)
      .filter("quantity", "lte", "low_stock_threshold")
      .order("quantity", { ascending: true });

    if (error)
      throw new Error(`Failed to fetch low stock products: ${error.message}`);
    return data || [];
  }

  // ==================== SEARCH AND FILTER ====================

  // Search products with advanced filters
  static async searchProducts(params: {
    query?: string;
    category_id?: string;
    min_price?: number;
    max_price?: number;
    seller_id?: string;
    in_stock_only?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ products: ProductModel[]; count: number }> {
    let query = supabase.from("products").select(
      `
        *,
        category:categories(*),
        images:product_images(*),
        inventory(*)
      `,
      { count: "exact" }
    );

    // Text search
    if (params.query) {
      query = query.or(
        `name.ilike.%${params.query}%,description.ilike.%${params.query}%`
      );
    }

    // Category filter
    if (params.category_id) {
      query = query.eq("category_id", params.category_id);
    }

    // Only active products
    query = query.eq("is_active", true);

    if (params.limit) {
      query = query.limit(params.limit);
    }

    if (params.offset) {
      query = query.range(
        params.offset,
        params.offset + (params.limit || 10) - 1
      );
    }

    query = query.order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to search products: ${error.message}`);

    // Fetch ratings
    const productIds = data?.map((p) => p.id) || [];
    const ratingsMap: Record<string, { avg: number; count: number }> = {};

    if (productIds.length > 0) {
      const { data: feedbackData } = await supabase
        .from("feedback")
        .select("product_id, rating")
        .in("product_id", productIds);

      if (feedbackData) {
        const ratings: Record<string, number[]> = {};
        feedbackData.forEach((fb: any) => {
          if (!ratings[fb.product_id]) ratings[fb.product_id] = [];
          ratings[fb.product_id].push(fb.rating);
        });

        Object.keys(ratings).forEach((pid) => {
          const scores = ratings[pid];
          const sum = scores.reduce((a, b) => a + b, 0);
          ratingsMap[pid] = {
            avg: Number((sum / scores.length).toFixed(1)),
            count: scores.length,
          };
        });
      }
    }

    let products = (data || []).map((p) => {
      const ratingInfo = ratingsMap[p.id] || { avg: 0, count: 0 };
      return new ProductModel({
        ...(p as Product),
        average_rating: ratingInfo.avg,
        review_count: ratingInfo.count,
      });
    });

    // Post-processing filters (for inventory-related filters)
    if (params.seller_id) {
      products = products.filter((p) =>
        p.inventory?.some((inv) => inv.owner_id === params.seller_id)
      );
    }

    if (params.in_stock_only) {
      products = products.filter((p) =>
        p.inventory?.some((inv) => inv.is_available && inv.quantity > 0)
      );
    }

    if (params.min_price !== undefined || params.max_price !== undefined) {
      products = products.filter((p) => {
        const price = p.getLowestPrice();
        if (price === null) return false;
        if (params.min_price !== undefined && price < params.min_price)
          return false;
        if (params.max_price !== undefined && price > params.max_price)
          return false;
        return true;
      });
    }

    return { products, count: count || 0 };
  }
}

export const ProductServiceClient = {
  list: async (params?: Record<string, any>): Promise<Product[]> => {
    const q = params ? "?" + new URLSearchParams(params).toString() : "";
    const res = await fetch(`/api/products${q}`);
    if (!res.ok) throw new Error("Failed to load products");
    return res.json();
  },

  get: async (id: string): Promise<Product> => {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error("Failed to load product");
    return res.json();
  },
};
