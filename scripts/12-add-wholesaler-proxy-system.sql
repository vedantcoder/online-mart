-- Add wholesaler proxy system for retailers
-- This allows retailers to list wholesaler products with proxy indicators

-- Add proxy listing table for retailers to list wholesaler products
CREATE TABLE IF NOT EXISTS public.proxy_listings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  retailer_id uuid NOT NULL,
  wholesaler_id uuid NOT NULL,
  wholesaler_inventory_id uuid NOT NULL,
  quantity_to_list integer NOT NULL CHECK (quantity_to_list > 0),
  markup_percentage numeric DEFAULT 0,
  custom_price numeric,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT proxy_listings_pkey PRIMARY KEY (id),
  CONSTRAINT proxy_listings_retailer_id_fkey FOREIGN KEY (retailer_id) REFERENCES public.retailers(id) ON DELETE CASCADE,
  CONSTRAINT proxy_listings_wholesaler_id_fkey FOREIGN KEY (wholesaler_id) REFERENCES public.wholesalers(id) ON DELETE CASCADE,
  CONSTRAINT proxy_listings_wholesaler_inventory_id_fkey FOREIGN KEY (wholesaler_inventory_id) REFERENCES public.inventory(id) ON DELETE CASCADE,
  CONSTRAINT proxy_listings_unique_retailer_inventory UNIQUE (retailer_id, wholesaler_inventory_id)
);

CREATE INDEX IF NOT EXISTS idx_proxy_listings_retailer_id ON public.proxy_listings(retailer_id);
CREATE INDEX IF NOT EXISTS idx_proxy_listings_wholesaler_id ON public.proxy_listings(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_proxy_listings_is_active ON public.proxy_listings(is_active);

-- Add order tracking table for detailed tracking
CREATE TABLE IF NOT EXISTS public.order_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  status text NOT NULL,
  notes text,
  location jsonb,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_tracking_pkey PRIMARY KEY (id),
  CONSTRAINT order_tracking_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  CONSTRAINT order_tracking_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_order_tracking_order_id ON public.order_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_created_at ON public.order_tracking(created_at DESC);

-- Add wholesaler_order_id to retailer_wholesaler_orders to track proxy fulfillment
ALTER TABLE public.retailer_wholesaler_orders 
ADD COLUMN IF NOT EXISTS fulfilled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS fulfillment_notes text;

-- Add proxy_source tracking to order_items
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS is_proxy boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS wholesaler_id uuid REFERENCES public.wholesalers(id),
ADD COLUMN IF NOT EXISTS proxy_listing_id uuid REFERENCES public.proxy_listings(id);

CREATE INDEX IF NOT EXISTS idx_order_items_is_proxy ON public.order_items(is_proxy);
CREATE INDEX IF NOT EXISTS idx_order_items_wholesaler_id ON public.order_items(wholesaler_id);

-- Enable RLS
ALTER TABLE IF EXISTS public.proxy_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for proxy_listings
CREATE POLICY "Retailers can manage their own proxy listings" ON public.proxy_listings 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.retailers WHERE id = auth.uid() AND id = retailer_id)
);

CREATE POLICY "Wholesalers can view their proxy listings" ON public.proxy_listings 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.wholesalers WHERE id = auth.uid() AND id = wholesaler_id)
);

CREATE POLICY "Customers can view active proxy listings" ON public.proxy_listings 
FOR SELECT USING (is_active = true);

-- RLS Policies for order_tracking
CREATE POLICY "Order participants can view tracking" ON public.order_tracking 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_id 
    AND (o.customer_id = auth.uid() OR o.seller_id = auth.uid() OR o.delivery_person_id = auth.uid())
  )
);

CREATE POLICY "Sellers and delivery persons can insert tracking" ON public.order_tracking 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_id 
    AND (o.seller_id = auth.uid() OR o.delivery_person_id = auth.uid())
  )
);

-- RLS Policies for retailer_wholesaler_orders
CREATE POLICY "Retailers can manage their wholesaler orders" ON public.retailer_wholesaler_orders 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.retailers WHERE id = auth.uid() AND id = retailer_id)
);

CREATE POLICY "Wholesalers can manage orders to them" ON public.retailer_wholesaler_orders 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.wholesalers WHERE id = auth.uid() AND id = wholesaler_id)
);

-- RLS Policies for retailer_wholesaler_order_items
CREATE POLICY "Retailers can view their order items" ON public.retailer_wholesaler_order_items 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.retailer_wholesaler_orders rwo
    JOIN public.retailers r ON r.id = rwo.retailer_id
    WHERE rwo.id = order_id AND r.id = auth.uid()
  )
);

CREATE POLICY "Wholesalers can view order items" ON public.retailer_wholesaler_order_items 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.retailer_wholesaler_orders rwo
    JOIN public.wholesalers w ON w.id = rwo.wholesaler_id
    WHERE rwo.id = order_id AND w.id = auth.uid()
  )
);

-- Function to update updated_at for proxy_listings
CREATE OR REPLACE FUNCTION update_proxy_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_proxy_listings_updated_at ON public.proxy_listings;
CREATE TRIGGER update_proxy_listings_updated_at 
BEFORE UPDATE ON public.proxy_listings 
FOR EACH ROW EXECUTE FUNCTION update_proxy_listings_updated_at();

-- Function to handle order completion and inventory updates
CREATE OR REPLACE FUNCTION handle_order_inventory_update()
RETURNS TRIGGER AS $$
BEGIN
  -- When order is delivered, update inventory
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    -- Update inventory for each order item
    UPDATE public.inventory i
    SET 
      quantity = i.quantity - oi.quantity,
      updated_at = now()
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id
      AND i.product_id = oi.product_id
      AND i.owner_id = NEW.seller_id
      AND i.owner_type = 'retailer';
      
    -- If proxy order, also update wholesaler inventory
    UPDATE public.inventory i
    SET 
      quantity = i.quantity - oi.quantity,
      updated_at = now()
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.is_proxy = true
      AND i.product_id = oi.product_id
      AND i.owner_id = oi.wholesaler_id
      AND i.owner_type = 'wholesaler';
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS on_order_delivered ON public.orders;
CREATE TRIGGER on_order_delivered
AFTER UPDATE ON public.orders
FOR EACH ROW
WHEN (NEW.status = 'delivered')
EXECUTE FUNCTION handle_order_inventory_update();

-- Function to handle retailer-wholesaler order completion
CREATE OR REPLACE FUNCTION handle_retailer_wholesaler_order_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- When wholesaler confirms order, add items to retailer inventory
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    -- Insert or update retailer inventory
    INSERT INTO public.inventory (product_id, owner_id, owner_type, quantity, price, mrp, is_available)
    SELECT 
      rwoi.product_id,
      NEW.retailer_id,
      'retailer',
      rwoi.quantity,
      rwoi.price_per_unit * 1.15, -- 15% markup by default
      rwoi.price_per_unit * 1.30, -- 30% MRP markup
      true
    FROM public.retailer_wholesaler_order_items rwoi
    WHERE rwoi.order_id = NEW.id
    ON CONFLICT (product_id, owner_id, owner_type) 
    DO UPDATE SET
      quantity = public.inventory.quantity + EXCLUDED.quantity,
      updated_at = now();
      
    -- Update wholesaler inventory
    UPDATE public.inventory i
    SET 
      quantity = i.quantity - rwoi.quantity,
      updated_at = now()
    FROM public.retailer_wholesaler_order_items rwoi
    WHERE rwoi.order_id = NEW.id
      AND i.product_id = rwoi.product_id
      AND i.owner_id = NEW.wholesaler_id
      AND i.owner_type = 'wholesaler';
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS on_retailer_wholesaler_order_confirmed ON public.retailer_wholesaler_orders;
CREATE TRIGGER on_retailer_wholesaler_order_confirmed
AFTER UPDATE ON public.retailer_wholesaler_orders
FOR EACH ROW
WHEN (NEW.status = 'confirmed')
EXECUTE FUNCTION handle_retailer_wholesaler_order_completion();

-- Add unique constraint to inventory to avoid duplicates
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'inventory_unique_product_owner'
  ) THEN
    ALTER TABLE public.inventory 
    ADD CONSTRAINT inventory_unique_product_owner 
    UNIQUE (product_id, owner_id, owner_type);
  END IF;
END $$;

COMMENT ON TABLE public.proxy_listings IS 'Retailers can list wholesaler products as proxy items visible to customers';
COMMENT ON TABLE public.order_tracking IS 'Detailed tracking history for all orders';
COMMENT ON COLUMN public.order_items.is_proxy IS 'Indicates if this order item is fulfilled via wholesaler proxy';
COMMENT ON COLUMN public.order_items.wholesaler_id IS 'The wholesaler who will fulfill this proxy order';

