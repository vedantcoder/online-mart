export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  seller_id?: string;
  quantity: number;
  price_at_addition: number;
  added_at?: string;
}

export interface Cart {
  id: string;
  customer_id: string;
  items: CartItem[];
  created_at?: string;
  updated_at?: string;
}