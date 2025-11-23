-- Fix for RLS error on inventory table during wholesaler order approval.
-- This script modifies the trigger function to run with elevated privileges,
-- allowing it to insert inventory for the retailer.

BEGIN;

-- Drop the existing trigger to redefine the function and then recreate the trigger.
DROP TRIGGER IF EXISTS on_retailer_wholesaler_order_confirmed ON public.retailer_wholesaler_orders;

-- Redefine the function with SECURITY DEFINER.
-- This allows the function to bypass RLS policies when creating inventory for the retailer.
CREATE OR REPLACE FUNCTION handle_retailer_wholesaler_order_completion()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
  new_product_id uuid;
BEGIN
  -- When wholesaler confirms order, transfer inventory from wholesaler to retailer
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    RAISE NOTICE 'Processing order confirmation for order %', NEW.id;
    
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
      RAISE NOTICE 'Processing item: wholesaler_product_id=%, product_id=%, quantity=%', 
        item.wholesaler_product_id, item.product_id, item.quantity;
      
      -- Check if this is a wholesaler product (new flow)
      IF item.wholesaler_product_id IS NOT NULL THEN
        RAISE NOTICE 'Using new wholesaler product flow';
        
        -- 1. Decrease wholesaler product stock
        UPDATE public.wholesaler_products
        SET 
          quantity_in_stock = quantity_in_stock - item.quantity,
          updated_at = now(),
          is_available = CASE WHEN (quantity_in_stock - item.quantity) > 0 THEN true ELSE false END
        WHERE id = item.wholesaler_product_id
          AND wholesaler_id = NEW.wholesaler_id;
        
        RAISE NOTICE 'Decreased wholesaler stock for product %', item.wholesaler_product_id;
        
        -- 2. Check if product already exists in main products table
        IF item.product_id IS NULL THEN
          RAISE NOTICE 'Creating new product in main products table';
          
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
          
          RAISE NOTICE 'Created product with id %', new_product_id;
          
          -- Insert images if available
          IF item.images IS NOT NULL AND jsonb_array_length(item.images) > 0 THEN
            INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
            SELECT 
              new_product_id,
              (value->>'url')::text,
              COALESCE((value->>'is_primary')::boolean, false),
              COALESCE((value->>'display_order')::integer, 0)
            FROM jsonb_array_elements(item.images);
            
            RAISE NOTICE 'Added product images';
          END IF;
          
          -- Update order item with new product_id
          UPDATE public.retailer_wholesaler_order_items
          SET product_id = new_product_id
          WHERE id = item.id;
        ELSE
          new_product_id := item.product_id;
          RAISE NOTICE 'Using existing product %', new_product_id;
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
        
        RAISE NOTICE 'Added to retailer inventory: product_id=%, quantity=%', new_product_id, item.quantity;
          
      ELSE
        -- Old flow: product_id exists (legacy support)
        RAISE NOTICE 'Using legacy inventory flow';
        
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
    
    RAISE NOTICE 'Completed order confirmation processing for order %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to use the updated function.
CREATE TRIGGER on_retailer_wholesaler_order_confirmed
AFTER UPDATE ON public.retailer_wholesaler_orders
FOR EACH ROW
WHEN (NEW.status = 'confirmed' AND OLD.status != 'confirmed')
EXECUTE FUNCTION handle_retailer_wholesaler_order_completion();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '=================================================================';
  RAISE NOTICE 'Database fix for RLS on inventory table has been applied.';
  RAISE NOTICE 'The trigger function now runs with SECURITY DEFINER.';
  RAISE NOTICE '=================================================================';
END $$;

COMMIT;
