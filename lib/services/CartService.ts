import { Cart, CartItem } from "@/lib/models/Cart";

export const CartService = {
  getCart: async (customerId: string): Promise<Cart | null> => {
    const res = await fetch(`/api/carts/${customerId}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch cart");
    return res.json();
  },

  createCart: async (customerId: string): Promise<Cart> => {
    const res = await fetch(`/api/carts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_id: customerId }),
    });
    if (!res.ok) throw new Error("Failed to create cart");
    return res.json();
  },

  addItem: async (cartId: string, item: Partial<CartItem>): Promise<CartItem> => {
    const res = await fetch(`/api/carts/${cartId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("Failed to add item");
    return res.json();
  },

  updateItem: async (cartId: string, itemId: string, qty: number): Promise<void> => {
    const res = await fetch(`/api/carts/${cartId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: qty }),
    });
    if (!res.ok) throw new Error("Failed to update cart item");
  },

  removeItem: async (cartId: string, itemId: string): Promise<void> => {
    const res = await fetch(`/api/carts/${cartId}/items/${itemId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to remove cart item");
  },

  clearCart: async (cartId: string): Promise<void> => {
    const res = await fetch(`/api/carts/${cartId}/items`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to clear cart");
  },
};