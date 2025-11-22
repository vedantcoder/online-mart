import { create } from "zustand";
import { WishlistService } from "@/lib/services/WishlistService";

interface ProductSummary {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  average_rating?: number;
  review_count?: number;
  images?: { image_url: string; is_primary?: boolean }[];
  inventory?: {
    id: string;
    price: number;
    mrp?: number;
    quantity: number;
    is_available: boolean;
    owner_id: string;
  }[];
}

interface WishlistItem {
  id: string;
  product_id: string;
  added_at: string;
  product?: ProductSummary;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: (customerId: string) => Promise<void>;
  addToWishlist: (customerId: string, productId: string) => Promise<void>;
  removeFromWishlist: (customerId: string, productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async (customerId) => {
    set({ isLoading: true });
    try {
      const wishlist = await WishlistService.getWishlist(customerId);
      // Normalize items coming from service join
      const rawItems = (wishlist.items ?? []) as unknown[];
      const normalized: WishlistItem[] = rawItems.map((unknownIt) => {
        const it = unknownIt as Record<string, unknown>; // Supabase client returns loosely typed rows
        const product = Array.isArray(it.product) ? it.product[0] : it.product; // handle possible nested array
        return {
          id: String(it.id),
          product_id: String(it.product_id),
          added_at: String(it.added_at),
          product: product
            ? {
                id: String(product.id),
                name: String(product.name),
                price: Number(product.price),
                image_url: product.image_url
                  ? String(product.image_url)
                  : undefined,
                average_rating: product.average_rating
                  ? Number(product.average_rating)
                  : undefined,
                review_count: product.review_count
                  ? Number(product.review_count)
                  : undefined,
                images: Array.isArray(product.images)
                  ? product.images.map(
                      (img: { image_url: string; is_primary?: boolean }) => ({
                        image_url: String(img.image_url),
                        is_primary: !!img.is_primary,
                      })
                    )
                  : undefined,
                inventory: Array.isArray(product.inventory)
                  ? product.inventory.map(
                      (inv: {
                        id: string;
                        price: number;
                        mrp?: number;
                        quantity: number;
                        is_available: boolean;
                        owner_id: string;
                      }) => ({
                        id: String(inv.id),
                        price: Number(inv.price),
                        mrp:
                          inv.mrp !== null && inv.mrp !== undefined
                            ? Number(inv.mrp)
                            : undefined,
                        quantity: Number(inv.quantity),
                        is_available: !!inv.is_available,
                        owner_id: String(inv.owner_id),
                      })
                    )
                  : undefined,
              }
            : undefined,
        };
      });
      set({ items: normalized, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
      set({ isLoading: false });
    }
  },

  addToWishlist: async (customerId, productId) => {
    try {
      await WishlistService.addItem(customerId, productId);
      // Optimistic update
      set((state) => ({
        items: state.items.some((i) => i.product_id === productId)
          ? state.items
          : [
              {
                id: crypto.randomUUID(),
                product_id: productId,
                added_at: new Date().toISOString(),
              },
              ...state.items,
            ],
      }));
      // Refresh to get product details
      await get().fetchWishlist(customerId);
    } catch (error) {
      console.error("Failed to add to wishlist", error);
      throw error;
    }
  },

  removeFromWishlist: async (customerId, productId) => {
    try {
      await WishlistService.removeItem(customerId, productId);
      set((state) => ({
        items: state.items.filter((item) => item.product_id !== productId),
      }));
    } catch (error) {
      console.error("Failed to remove from wishlist", error);
      throw error;
    }
  },

  isInWishlist: (productId) => {
    return get().items.some((item) => item.product_id === productId);
  },
}));
