-- Add RLS policies for orders and order_items tables
-- Run this migration in your Supabase SQL editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Delivery persons can view assigned orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can update their orders" ON public.orders;
DROP POLICY IF EXISTS "Delivery persons can update assigned orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view order items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Customers can insert order items for their orders" ON public.order_items;

-- RLS Policies for orders table
-- Customers can view their own orders
CREATE POLICY "Customers can view their own orders" ON public.orders 
  FOR SELECT 
  USING (
    customer_id = auth.uid()
  );

-- Sellers (retailers/wholesalers) can view orders where they are the seller
CREATE POLICY "Sellers can view their orders" ON public.orders 
  FOR SELECT 
  USING (
    seller_id = auth.uid()
  );

-- Delivery persons can view orders assigned to them
CREATE POLICY "Delivery persons can view assigned orders" ON public.orders 
  FOR SELECT 
  USING (
    delivery_person_id = auth.uid()
  );

-- Customers can insert orders (for checkout)
CREATE POLICY "Customers can insert their own orders" ON public.orders 
  FOR INSERT 
  WITH CHECK (
    customer_id = auth.uid()
  );

-- Customers can update their own orders (for cancellation)
CREATE POLICY "Customers can update their own orders" ON public.orders 
  FOR UPDATE 
  USING (
    customer_id = auth.uid()
  )
  WITH CHECK (
    customer_id = auth.uid()
  );

-- Sellers can update orders where they are the seller (for status updates)
CREATE POLICY "Sellers can update their orders" ON public.orders 
  FOR UPDATE 
  USING (
    seller_id = auth.uid()
  )
  WITH CHECK (
    seller_id = auth.uid()
  );

-- Delivery persons can update orders assigned to them (for delivery status)
CREATE POLICY "Delivery persons can update assigned orders" ON public.orders 
  FOR UPDATE 
  USING (
    delivery_person_id = auth.uid()
  )
  WITH CHECK (
    delivery_person_id = auth.uid()
  );

-- RLS Policies for order_items table
-- Users can view order items for orders they have access to
CREATE POLICY "Users can view order items for their orders" ON public.order_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (
        orders.customer_id = auth.uid() 
        OR orders.seller_id = auth.uid() 
        OR orders.delivery_person_id = auth.uid()
      )
    )
  );

-- Customers can insert order items when creating their orders
CREATE POLICY "Customers can insert order items for their orders" ON public.order_items 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_person_id ON public.orders(delivery_person_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

