-- Wishlist schema adjustments to match existing single-table design
-- Adds uniqueness constraint, RLS and policies

-- Add unique constraint to prevent duplicate product entries per customer
ALTER TABLE wishlists
  ADD CONSTRAINT IF NOT EXISTS wishlists_customer_product_unique
  UNIQUE (customer_id, product_id);

-- Enable RLS (if not already enabled)
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Allow customers to view only their own wishlist rows
CREATE POLICY IF NOT EXISTS "Wishlist Select Own" ON wishlists
  FOR SELECT USING (customer_id = auth.uid());

-- Allow customers to insert wishlist entries for themselves
CREATE POLICY IF NOT EXISTS "Wishlist Insert Own" ON wishlists
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Allow customers to delete their own wishlist entries
CREATE POLICY IF NOT EXISTS "Wishlist Delete Own" ON wishlists
  FOR DELETE USING (customer_id = auth.uid());
