export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  image_url?: string | null;
  description?: string | null;
  is_regional: boolean;
  region?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  sku?: string | null;
  base_price?: number | null;
  unit: string;
  specifications: Record<string, string | number | boolean>;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  category?: Category;
  images?: ProductImage[];
  inventory?: Inventory[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  owner_id: string;
  owner_type: "retailer" | "wholesaler";
  quantity: number;
  price: number;
  mrp?: number | null;
  available_from?: string | null;
  is_available: boolean;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;

  // Relations
  product?: Product;
}

export class ProductModel implements Product {
  id: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  sku?: string | null;
  base_price?: number | null;
  unit: string;
  specifications: Record<string, string | number | boolean>;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  category?: Category;
  images?: ProductImage[];
  inventory?: Inventory[];

  constructor(data: Product) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.category_id = data.category_id;
    this.sku = data.sku;
    this.base_price = data.base_price;
    this.unit = data.unit || "piece";
    this.specifications = data.specifications || {};
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;

    this.category = data.category;
    this.images = data.images;
    this.inventory = data.inventory;
  }

  // Get primary image
  getPrimaryImage(): string | null {
    if (!this.images || this.images.length === 0) return null;
    const primary = this.images.find((img) => img.is_primary);
    return primary?.image_url || this.images[0]?.image_url || null;
  }

  // Get all images sorted by display order
  getImages(): string[] {
    if (!this.images || this.images.length === 0) return [];
    return this.images
      .sort((a, b) => a.display_order - b.display_order)
      .map((img) => img.image_url);
  }

  // Get price for specific seller
  getPriceForSeller(sellerId: string): number | null {
    const sellerInventory = this.inventory?.find(
      (inv) => inv.owner_id === sellerId
    );
    return sellerInventory?.price || this.base_price || null;
  }

  // Get available stock for specific seller
  getStockForSeller(sellerId: string): number {
    const sellerInventory = this.inventory?.find(
      (inv) => inv.owner_id === sellerId
    );
    return sellerInventory?.quantity || 0;
  }

  // Check if product is available for specific seller
  isAvailableForSeller(sellerId: string): boolean {
    const sellerInventory = this.inventory?.find(
      (inv) => inv.owner_id === sellerId
    );
    return (
      (sellerInventory?.is_available && sellerInventory.quantity > 0) || false
    );
  }

  // Get lowest price from all sellers
  getLowestPrice(): number | null {
    if (!this.inventory || this.inventory.length === 0)
      return this.base_price ?? null;

    const availableInventory = this.inventory.filter(
      (inv) => inv.is_available && inv.quantity > 0
    );
    if (availableInventory.length === 0) return this.base_price ?? null;
    const lowestPrice = Math.min(...availableInventory.map((inv) => inv.price));
    return lowestPrice;
  }

  // Check if product is low on stock
  isLowStock(sellerId: string): boolean {
    const sellerInventory = this.inventory?.find(
      (inv) => inv.owner_id === sellerId
    );
    if (!sellerInventory) return false;
    return sellerInventory.quantity <= sellerInventory.low_stock_threshold;
  }

  // Format price
  formatPrice(price: number | null): string {
    if (price === null) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  }

  // Get specifications as array
  getSpecificationsList(): Array<{ key: string; value: unknown }> {
    return Object.entries(this.specifications).map(([key, value]) => ({
      key: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value,
    }));
  }
}

export class CategoryModel implements Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  image_url?: string | null;
  description?: string | null;
  is_regional: boolean;
  region?: string | null;
  is_active: boolean;
  created_at: string;

  constructor(data: Category) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.parent_id = data.parent_id;
    this.image_url = data.image_url;
    this.description = data.description;
    this.is_regional = data.is_regional;
    this.region = data.region;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
  }

  // Generate breadcrumb path
  static async getBreadcrumb(
    categoryId: string,
    categories: Category[]
  ): Promise<string[]> {
    const breadcrumb: string[] = [];
    let currentCategory = categories.find((c) => c.id === categoryId);

    while (currentCategory) {
      breadcrumb.unshift(currentCategory.name);
      if (currentCategory.parent_id) {
        currentCategory = categories.find(
          (c) => c.id === currentCategory!.parent_id
        );
      } else {
        break;
      }
    }

    return breadcrumb;
  }
}
