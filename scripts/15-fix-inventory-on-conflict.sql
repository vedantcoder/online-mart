-- Fix for 'ON CONFLICT' error during wholesaler order approval
-- This script adds the missing unique constraint to the inventory table,
-- which is required for the inventory transfer logic to work correctly.

BEGIN;

-- Add a unique constraint on (product_id, owner_id, owner_type) to the inventory table.
-- This ensures that each owner (retailer/wholesaler) can have only one inventory record
-- for a specific product, which is the assumption made by the ON CONFLICT statement
-- in the handle_retailer_wholesaler_order_completion() trigger.
ALTER TABLE public.inventory
ADD CONSTRAINT inventory_product_owner_unique
UNIQUE (product_id, owner_id, owner_type);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '=================================================================';
  RAISE NOTICE 'Database fix for wholesaler order approval has been applied.';
  RAISE NOTICE 'The missing unique constraint on the inventory table has been added.';
  RAISE NOTICE '=================================================================';
END $$;

COMMIT;
