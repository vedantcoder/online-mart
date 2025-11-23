-- Add feedback/review system and notification tables
-- Run this migration in your Supabase SQL editor

-- Create orders table FIRST (before order_items and feedback which reference it)
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  delivery_person_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'failed')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method text CHECK (payment_method IN ('online', 'cod', 'offline')),
  subtotal numeric NOT NULL,
  tax_amount numeric DEFAULT 0,
  delivery_charges numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  delivery_address jsonb NOT NULL,
  delivery_notes text,
  estimated_delivery timestamp with time zone,
  actual_delivery timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT orders_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.profiles(id),
  CONSTRAINT orders_delivery_person_id_fkey FOREIGN KEY (delivery_person_id) REFERENCES public.delivery_persons(id)
);

-- Create order_items table (after orders table exists)
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  product_name text NOT NULL,
  product_image text,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_per_unit numeric NOT NULL,
  subtotal numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- Create feedback/reviews table (after orders table exists)
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  order_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  images jsonb DEFAULT '[]'::jsonb,
  helpful_count integer DEFAULT 0,
  verified_purchase boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT feedback_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  CONSTRAINT feedback_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE,
  CONSTRAINT feedback_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_product_id ON public.feedback(product_id);
CREATE INDEX IF NOT EXISTS idx_feedback_customer_id ON public.feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_order_id ON public.feedback(order_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('order', 'delivery', 'feedback', 'stock', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Create customer_queries table for support system
CREATE TABLE IF NOT EXISTS public.customer_queries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  order_id uuid,
  subject text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid,
  resolution_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  CONSTRAINT customer_queries_pkey PRIMARY KEY (id),
  CONSTRAINT customer_queries_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE,
  CONSTRAINT customer_queries_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL,
  CONSTRAINT customer_queries_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_customer_queries_customer_id ON public.customer_queries(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_queries_status ON public.customer_queries(status);
CREATE INDEX IF NOT EXISTS idx_customer_queries_created_at ON public.customer_queries(created_at DESC);

-- Create offline_orders table for calendar-based orders
CREATE TABLE IF NOT EXISTS public.offline_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  retailer_id uuid NOT NULL,
  scheduled_date timestamp with time zone NOT NULL,
  items jsonb NOT NULL,
  notes text,
  reminder_sent boolean DEFAULT false,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT offline_orders_pkey PRIMARY KEY (id),
  CONSTRAINT offline_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT offline_orders_retailer_id_fkey FOREIGN KEY (retailer_id) REFERENCES public.retailers(id)
);

CREATE INDEX IF NOT EXISTS idx_offline_orders_customer_id ON public.offline_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_offline_orders_retailer_id ON public.offline_orders(retailer_id);
CREATE INDEX IF NOT EXISTS idx_offline_orders_scheduled_date ON public.offline_orders(scheduled_date);

-- Create retailer_wholesaler_orders table
CREATE TABLE IF NOT EXISTS public.retailer_wholesaler_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  retailer_id uuid NOT NULL,
  wholesaler_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  subtotal numeric NOT NULL,
  tax_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  delivery_address jsonb,
  notes text,
  estimated_delivery timestamp with time zone,
  actual_delivery timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT retailer_wholesaler_orders_pkey PRIMARY KEY (id),
  CONSTRAINT retailer_wholesaler_orders_retailer_id_fkey FOREIGN KEY (retailer_id) REFERENCES public.retailers(id),
  CONSTRAINT retailer_wholesaler_orders_wholesaler_id_fkey FOREIGN KEY (wholesaler_id) REFERENCES public.wholesalers(id)
);

-- Create retailer_wholesaler_order_items table
CREATE TABLE IF NOT EXISTS public.retailer_wholesaler_order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_per_unit numeric NOT NULL,
  subtotal numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT retailer_wholesaler_order_items_pkey PRIMARY KEY (id),
  CONSTRAINT retailer_wholesaler_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.retailer_wholesaler_orders(id) ON DELETE CASCADE,
  CONSTRAINT retailer_wholesaler_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- Enable Row Level Security
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customer_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.offline_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.retailer_wholesaler_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.retailer_wholesaler_order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Customers can insert their own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Customers can update their own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Customers can view their own queries" ON public.customer_queries;
DROP POLICY IF EXISTS "Customers can insert their own queries" ON public.customer_queries;
DROP POLICY IF EXISTS "Customers can view their own offline orders" ON public.offline_orders;
DROP POLICY IF EXISTS "Retailers can view their offline orders" ON public.offline_orders;

-- RLS Policies for feedback
CREATE POLICY "Users can view all feedback" ON public.feedback FOR SELECT USING (true);
CREATE POLICY "Customers can insert their own feedback" ON public.feedback FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.customers WHERE id = auth.uid() AND id = customer_id)
);
CREATE POLICY "Customers can update their own feedback" ON public.feedback FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.customers WHERE id = auth.uid() AND id = customer_id)
);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for customer_queries
CREATE POLICY "Customers can view their own queries" ON public.customer_queries FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.customers WHERE id = auth.uid() AND id = customer_id)
);
CREATE POLICY "Customers can insert their own queries" ON public.customer_queries FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.customers WHERE id = auth.uid() AND id = customer_id)
);

-- RLS Policies for offline_orders
CREATE POLICY "Customers can view their own offline orders" ON public.offline_orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.customers WHERE id = auth.uid() AND id = customer_id)
);
CREATE POLICY "Retailers can view their offline orders" ON public.offline_orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.retailers WHERE id = auth.uid() AND id = retailer_id)
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_feedback_updated_at ON public.feedback;
DROP TRIGGER IF EXISTS update_customer_queries_updated_at ON public.customer_queries;
DROP TRIGGER IF EXISTS update_offline_orders_updated_at ON public.offline_orders;
DROP TRIGGER IF EXISTS update_retailer_wholesaler_orders_updated_at ON public.retailer_wholesaler_orders;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;

-- Triggers for updated_at
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON public.feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_queries_updated_at BEFORE UPDATE ON public.customer_queries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offline_orders_updated_at BEFORE UPDATE ON public.offline_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_retailer_wholesaler_orders_updated_at BEFORE UPDATE ON public.retailer_wholesaler_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
