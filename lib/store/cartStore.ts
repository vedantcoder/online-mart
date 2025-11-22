import { create } from "zustand";
import { Cart } from "@/lib/models/Cart";
import { CartService } from "@/lib/services/CartService";
import { ProductService } from "@/lib/services/ProductService";

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error?: string;
  fetchCart: (customerId: string) => Promise<void>;
  addItem: (cartId: string, item: any) => Promise<void>;
  updateItem: (cartId: string, itemId: string, qty: number) => Promise<void>;
  removeItem: (cartId: string, itemId: string) => Promise<void>;
  clearCart: (cartId: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  error: undefined,

  fetchCart: async (customerId) => {
    set({ isLoading: true, error: undefined });
    try {
      let cart = await CartService.getCart(customerId);
      if (!cart) cart = await CartService.createCart(customerId);
      // Enrich cart items with product details (images, inventory) for UI rendering
      const enrichedItems = await Promise.all(
        cart.items.map(async (it) => {
          try {
            const product = await ProductService.getProductById(it.product_id);
            return { ...it, product };
          } catch {
            return { ...it };
          }
        })
      );
      set({ cart: { ...cart, items: enrichedItems }, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load cart", isLoading: false });
      throw err;
    }
  },

  addItem: async (cartId, item) => {
    set({ isLoading: true });
    try {
      await CartService.addItem(cartId, item);
      const raw = await CartService.getCart(get().cart!.customer_id);
      const enrichedItems = await Promise.all(
        raw!.items.map(async (it) => {
          try {
            const product = await ProductService.getProductById(it.product_id);
            return { ...it, product };
          } catch {
            return { ...it };
          }
        })
      );
      set({ cart: { ...raw!, items: enrichedItems }, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  updateItem: async (cartId, itemId, qty) => {
    set({ isLoading: true });
    try {
      await CartService.updateItem(cartId, itemId, qty);
      const raw = await CartService.getCart(get().cart!.customer_id);
      const enrichedItems = await Promise.all(
        raw!.items.map(async (it) => {
          try {
            const product = await ProductService.getProductById(it.product_id);
            return { ...it, product };
          } catch {
            return { ...it };
          }
        })
      );
      set({ cart: { ...raw!, items: enrichedItems }, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  removeItem: async (cartId, itemId) => {
    set({ isLoading: true });
    try {
      await CartService.removeItem(cartId, itemId);
      const raw = await CartService.getCart(get().cart!.customer_id);
      const enrichedItems = await Promise.all(
        raw!.items.map(async (it) => {
          try {
            const product = await ProductService.getProductById(it.product_id);
            return { ...it, product };
          } catch {
            return { ...it };
          }
        })
      );
      set({ cart: { ...raw!, items: enrichedItems }, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  clearCart: async (cartId) => {
    set({ isLoading: true });
    try {
      await CartService.clearCart(cartId);
      const raw = await CartService.getCart(get().cart!.customer_id);
      const enrichedItems = await Promise.all(
        raw!.items.map(async (it) => {
          try {
            const product = await ProductService.getProductById(it.product_id);
            return { ...it, product };
          } catch {
            return { ...it };
          }
        })
      );
      set({ cart: { ...raw!, items: enrichedItems }, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },
}));
