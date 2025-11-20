import { create } from "zustand";
import { Cart } from "@/lib/models/Cart";
import { CartService } from "@/lib/services/CartService";

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
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load cart", isLoading: false });
      throw err;
    }
  },

  addItem: async (cartId, item) => {
    set({ isLoading: true });
    try {
      await CartService.addItem(cartId, item);
      // refresh cart
      const cart = await CartService.getCart(get().cart!.customer_id);
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  updateItem: async (cartId, itemId, qty) => {
    set({ isLoading: true });
    try {
      await CartService.updateItem(cartId, itemId, qty);
      const cart = await CartService.getCart(get().cart!.customer_id);
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  removeItem: async (cartId, itemId) => {
    set({ isLoading: true });
    try {
      await CartService.removeItem(cartId, itemId);
      const cart = await CartService.getCart(get().cart!.customer_id);
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  clearCart: async (cartId) => {
    set({ isLoading: true });
    try {
      await CartService.clearCart(cartId);
      const cart = await CartService.getCart(get().cart!.customer_id);
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },
}));