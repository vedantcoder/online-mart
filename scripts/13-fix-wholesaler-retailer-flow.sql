-- Fix wholesaler-retailer flow
-- 1. Wholesaler inventory only visible to retailers (not customers)
-- 2. When wholesaler confirms order, decrease wholesaler stock and add to retailer stock
-- 3. Customers only see retailer inventory

-- Update the retailer-wholesaler order completion trigger to properly handle inventory
CREATE OR REPLACE FUNCTION handle_retailer_wholesaler_order_completion()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
BEGIN
  -- When wholesaler confirms order, transfer inventory from wholesaler to retailer
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    -- For each order item
    FOR item IN 
      SELECT product_id, quantity, price_per_unit
      FROM public.retailer_wholesaler_order_items
      WHERE order_id = NEW.id
    LOOP
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
      INSERT INTO public.inventory (product_id, owner_id, owner_type, quantity, price, mrp, is_available, low_stock_threshold)
      VALUES (
        item.product_id,
        NEW.retailer_id,
        'retailer',
        item.quantity,
        item.price_per_unit * 1.15, -- 15% markup by default
        item.price_per_unit * 1.30, -- 30% MRP markup
        true,
        5
      )
      ON CONFLICT (product_id, owner_id, owner_type) 
      DO UPDATE SET
        quantity = public.inventory.quantity + EXCLUDED.quantity,
        updated_at = now(),
        is_available = true;
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

-- Add index for faster customer queries (only retailer inventory)
CREATE INDEX IF NOT EXISTS idx_inventory_retailer_available 
ON public.inventory(owner_type, is_available, product_id) 
WHERE owner_type = 'retailer' AND is_available = true;

-- Add comment for clarity
COMMENT ON INDEX idx_inventory_retailer_available IS 'Optimize customer queries to show only retailer inventory';

-- Update RLS policies to ensure customers only see retailer inventory
DROP POLICY IF EXISTS "Inventory is public" ON public.inventory;

-- Customers can only see retailer inventory that is available
CREATE POLICY "Customers see retailer inventory" ON public.inventory
FOR SELECT USING (
  owner_type = 'retailer' AND is_available = true
);

-- Retailers can see all inventory (their own + wholesalers for purchasing)
CREATE POLICY "Retailers see all inventory" ON public.inventory
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.retailers WHERE id = auth.uid())
);

-- Wholesalers can manage their own inventory
CREATE POLICY "Wholesalers manage own inventory" ON public.inventory
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.wholesalers 
    WHERE id = auth.uid() AND id = owner_id
  )
  AND owner_type = 'wholesaler'
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

COMMENT ON POLICY "Customers see retailer inventory" ON public.inventory IS 'Customers can only see available retailer inventory';
COMMENT ON POLICY "Retailers see all inventory" ON public.inventory IS 'Retailers see their own inventory and all wholesaler inventory for purchasing';
COMMENT ON POLICY "Wholesalers manage own inventory" ON public.inventory IS 'Wholesalers can manage only their own inventory';
COMMENT ON POLICY "Retailers manage own inventory" ON public.inventory IS 'Retailers can manage only their own inventory';
