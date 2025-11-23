-- 2a. Make product_id nullable for new flow
ALTER TABLE public.retailer_wholesaler_order_items
  ALTER COLUMN product_id DROP NOT NULL;
-- Complete restructure: Separate wholesaler products from regular products
-- Wholesaler products are in a different table and NEVER shown to customers directly

-- 1. Create wholesaler_products table (separate from main products)
CREATE TABLE IF NOT EXISTS public.wholesaler_products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  wholesaler_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category_id uuid,
  sku text,
  unit text DEFAULT 'piece',
  wholesale_price numeric NOT NULL,
  mrp numeric,
  quantity_in_stock integer NOT NULL DEFAULT 0,
  low_stock_threshold integer DEFAULT 10,
  is_available boolean DEFAULT true,
  images jsonb DEFAULT '[]'::jsonb,
  specifications jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT wholesaler_products_pkey PRIMARY KEY (id),
  CONSTRAINT wholesaler_products_wholesaler_id_fkey FOREIGN KEY (wholesaler_id) REFERENCES public.wholesalers(id) ON DELETE CASCADE,
  CONSTRAINT wholesaler_products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL,
  CONSTRAINT wholesaler_products_quantity_check CHECK (quantity_in_stock >= 0)
);

CREATE INDEX IF NOT EXISTS idx_wholesaler_products_wholesaler_id ON public.wholesaler_products(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_wholesaler_products_category_id ON public.wholesaler_products(category_id);
CREATE INDEX IF NOT EXISTS idx_wholesaler_products_is_available ON public.wholesaler_products(is_available);

-- 2. Update retailer_wholesaler_order_items to reference wholesaler_products
ALTER TABLE public.retailer_wholesaler_order_items 
ADD COLUMN IF NOT EXISTS wholesaler_product_id uuid REFERENCES public.wholesaler_products(id) ON DELETE CASCADE;

-- 3. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rwo_items_wholesaler_product_id ON public.retailer_wholesaler_order_items(wholesaler_product_id);

-- 4. Enable RLS on wholesaler_products
ALTER TABLE public.wholesaler_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wholesaler_products
-- Wholesalers can manage their own products
CREATE POLICY "Wholesalers manage own products" ON public.wholesaler_products
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.wholesalers WHERE id = auth.uid() AND id = wholesaler_id)
);

-- Retailers can view all wholesaler products (for ordering)
CREATE POLICY "Retailers view wholesaler products" ON public.wholesaler_products
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.retailers WHERE id = auth.uid())
);

-- Customers CANNOT see wholesaler_products at all (not in this table)
-- No policy needed - default deny

-- 5. Update the order completion trigger
CREATE OR REPLACE FUNCTION handle_retailer_wholesaler_order_completion()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
  new_product_id uuid;
BEGIN
  -- When wholesaler confirms order, transfer inventory from wholesaler to retailer
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- For each order item
    FOR item IN 
      SELECT 
        rwoi.id,
        rwoi.wholesaler_product_id,
        rwoi.product_id,
        rwoi.quantity,
        rwoi.price_per_unit,
        wp.name,
        wp.description,
        wp.category_id,
        wp.sku,
        wp.unit,
        wp.wholesale_price,
        wp.mrp,
        wp.images,
        wp.specifications
      FROM public.retailer_wholesaler_order_items rwoi
      LEFT JOIN public.wholesaler_products wp ON wp.id = rwoi.wholesaler_product_id
      WHERE rwoi.order_id = NEW.id
    LOOP
      -- Check if this is a wholesaler product (new flow)
      IF item.wholesaler_product_id IS NOT NULL THEN
        -- 1. Decrease wholesaler product stock
        UPDATE public.wholesaler_products
        SET 
          quantity_in_stock = quantity_in_stock - item.quantity,
          updated_at = now(),
          is_available = CASE WHEN (quantity_in_stock - item.quantity) > 0 THEN true ELSE false END
        WHERE id = item.wholesaler_product_id
          AND wholesaler_id = NEW.wholesaler_id;
        
        -- 2. Check if product already exists in main products table
        IF item.product_id IS NULL THEN
          -- Create new product in main products table
          INSERT INTO public.products (
            name,
            description,
            category_id,
            sku,
            unit,
            base_price,
            specifications,
            is_active
          )
          VALUES (
            item.name,
            item.description,
            item.category_id,
            item.sku,
            item.unit,
            item.price_per_unit,
            item.specifications,
            true
          )
          RETURNING id INTO new_product_id;
          
          -- Insert images if available
          IF item.images IS NOT NULL AND jsonb_array_length(item.images) > 0 THEN
            INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
            SELECT 
              new_product_id,
              (value->>'url')::text,
              (value->>'is_primary')::boolean,
              (value->>'display_order')::integer
            FROM jsonb_array_elements(item.images);
          END IF;
        ELSE
          new_product_id := item.product_id;
        END IF;
        
        -- 3. Add to retailer inventory
        INSERT INTO public.inventory (
          product_id,
          owner_id,
          owner_type,
          quantity,
          price,
          mrp,
          is_available,
          low_stock_threshold
        )
        VALUES (
          new_product_id,
          NEW.retailer_id,
          'retailer',
          item.quantity,
          item.price_per_unit * 1.15, -- 15% markup by default
          COALESCE(item.mrp, item.price_per_unit * 1.30), -- 30% MRP markup
          true,
          5
        )
        ON CONFLICT (product_id, owner_id, owner_type) 
        DO UPDATE SET
          quantity = public.inventory.quantity + EXCLUDED.quantity,
          updated_at = now(),
          is_available = true;
          
      ELSE
        -- Old flow: product_id exists (legacy support)
        -- 1. Decrease wholesaler inventory
        UPDATE public.inventory
        SET 
          quantity = quantity - item.quantity,
          updated_at = now(),
          is_available = CASE WHEN (quantity - item.quantity) > 0 THEN true ELSE false END
        WHERE product_id = item.product_id
          AND owner_id = NEW.wholesaler_id
          AND owner_type = 'wholesaler';
        
        -- 2. Add or update retailer inventory
        INSERT INTO public.inventory (
          product_id,
          owner_id,
          owner_type,
          quantity,
          price,
          mrp,
          is_available,
          low_stock_threshold
        )
        VALUES (
          item.product_id,
          NEW.retailer_id,
          'retailer',
          item.quantity,
          item.price_per_unit * 1.15,
          item.price_per_unit * 1.30,
          true,
          5
        )
        ON CONFLICT (product_id, owner_id, owner_type) 
        DO UPDATE SET
          quantity = public.inventory.quantity + EXCLUDED.quantity,
          updated_at = now(),
          is_available = true;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate trigger
DROP TRIGGER IF EXISTS on_retailer_wholesaler_order_confirmed ON public.retailer_wholesaler_orders;
CREATE TRIGGER on_retailer_wholesaler_order_confirmed
AFTER UPDATE ON public.retailer_wholesaler_orders
FOR EACH ROW
WHEN (NEW.status = 'confirmed' AND OLD.status != 'confirmed')
EXECUTE FUNCTION handle_retailer_wholesaler_order_completion();

-- 6. Update inventory RLS policies (keep existing but clarify)
-- Drop old policies first
DROP POLICY IF EXISTS "Inventory is public" ON public.inventory;
DROP POLICY IF EXISTS "Customers see retailer inventory" ON public.inventory;
DROP POLICY IF EXISTS "Retailers see all inventory" ON public.inventory;
DROP POLICY IF EXISTS "Wholesalers manage own inventory" ON public.inventory;
DROP POLICY IF EXISTS "Retailers manage own inventory" ON public.inventory;

-- Customers can only see retailer inventory that is available
CREATE POLICY "Customers see retailer inventory" ON public.inventory
FOR SELECT USING (
  owner_type = 'retailer' AND is_available = true
);

-- Retailers can see all inventory (their own + legacy wholesaler inventory for old flow)
CREATE POLICY "Retailers see all inventory" ON public.inventory
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.retailers WHERE id = auth.uid())
);

-- Retailers can manage their own inventory
CREATE POLICY "Retailers manage own inventory" ON public.inventory
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.retailers 
    WHERE id = auth.uid() AND id = owner_id
  )
  AND owner_type = 'retailer'
);

-- Legacy: Wholesalers can manage their inventory (old flow support)
CREATE POLICY "Wholesalers manage own inventory" ON public.inventory
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.wholesalers 
    WHERE id = auth.uid() AND id = owner_id
  )
  AND owner_type = 'wholesaler'
);

-- 7. Add function to update wholesaler_products updated_at
CREATE OR REPLACE FUNCTION update_wholesaler_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_wholesaler_products_updated_at ON public.wholesaler_products;
CREATE TRIGGER update_wholesaler_products_updated_at 
BEFORE UPDATE ON public.wholesaler_products 
FOR EACH ROW EXECUTE FUNCTION update_wholesaler_products_updated_at();

-- 8. Comments for clarity
COMMENT ON TABLE public.wholesaler_products IS 'Wholesaler-exclusive products. NOT visible to customers. Only retailers can browse and order.';
COMMENT ON POLICY "Wholesalers manage own products" ON public.wholesaler_products IS 'Wholesalers can create, update, delete their own products';
COMMENT ON POLICY "Retailers view wholesaler products" ON public.wholesaler_products IS 'Retailers can browse all wholesaler products to place orders';
COMMENT ON POLICY "Customers see retailer inventory" ON public.inventory IS 'Customers only see products that retailers have in inventory';
