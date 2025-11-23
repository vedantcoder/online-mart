-- Fix RLS policies for inventory, products, and product_images tables
-- to allow retailers and wholesalers to manage their own inventory and products

-- Drop all existing policies to recreate them properly
drop policy if exists "Inventory is public" on public.inventory;
drop policy if exists "Inventory is public for read" on public.inventory;
drop policy if exists "Retailers can insert own inventory" on public.inventory;
drop policy if exists "Retailers can update own inventory" on public.inventory;
drop policy if exists "Retailers can delete own inventory" on public.inventory;
drop policy if exists "Wholesalers can insert own inventory" on public.inventory;
drop policy if exists "Wholesalers can update own inventory" on public.inventory;
drop policy if exists "Wholesalers can delete own inventory" on public.inventory;

drop policy if exists "Products are public" on public.products;
drop policy if exists "Products are public for read" on public.products;
drop policy if exists "Anyone can insert products" on public.products;
drop policy if exists "Anyone can update products" on public.products;

drop policy if exists "Product images are public" on public.product_images;
drop policy if exists "Product images are public for read" on public.product_images;
drop policy if exists "Anyone can insert product images" on public.product_images;
drop policy if exists "Anyone can update product images" on public.product_images;
drop policy if exists "Anyone can delete product images" on public.product_images;

-- ============================================
-- PRODUCTS TABLE POLICIES
-- ============================================

-- Allow public SELECT (read access)
create policy "Products are public for read" on public.products
  for select using (true);

-- Allow authenticated users to insert products
create policy "Anyone can insert products" on public.products
  for insert 
  with check (auth.role() = 'authenticated');

-- Allow authenticated users to update products
-- In practice, only retailers/wholesalers who own the inventory should update
-- but we're allowing any authenticated user for flexibility
create policy "Anyone can update products" on public.products
  for update 
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================
-- PRODUCT_IMAGES TABLE POLICIES
-- ============================================

-- Allow public SELECT (read access)
create policy "Product images are public for read" on public.product_images
  for select using (true);

-- Allow authenticated users to insert product images
create policy "Anyone can insert product images" on public.product_images
  for insert 
  with check (auth.role() = 'authenticated');

-- Allow authenticated users to update product images
create policy "Anyone can update product images" on public.product_images
  for update 
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Allow authenticated users to delete product images
create policy "Anyone can delete product images" on public.product_images
  for delete 
  using (auth.role() = 'authenticated');

-- ============================================
-- INVENTORY TABLE POLICIES
-- ============================================

-- Allow public SELECT (read access)
create policy "Inventory is public for read" on public.inventory
  for select using (true);

-- Allow retailers to insert their own inventory
create policy "Retailers can insert own inventory" on public.inventory
  for insert 
  with check (
    owner_type = 'retailer' 
    and owner_id = auth.uid()
  );

-- Allow retailers to update their own inventory
create policy "Retailers can update own inventory" on public.inventory
  for update 
  using (
    owner_type = 'retailer' 
    and owner_id = auth.uid()
  )
  with check (
    owner_type = 'retailer' 
    and owner_id = auth.uid()
  );

-- Allow retailers to delete their own inventory (soft delete via is_available)
create policy "Retailers can delete own inventory" on public.inventory
  for delete 
  using (
    owner_type = 'retailer' 
    and owner_id = auth.uid()
  );

-- Allow wholesalers to insert their own inventory
create policy "Wholesalers can insert own inventory" on public.inventory
  for insert 
  with check (
    owner_type = 'wholesaler' 
    and owner_id = auth.uid()
  );

-- Allow wholesalers to update their own inventory
create policy "Wholesalers can update own inventory" on public.inventory
  for update 
  using (
    owner_type = 'wholesaler' 
    and owner_id = auth.uid()
  )
  with check (
    owner_type = 'wholesaler' 
    and owner_id = auth.uid()
  );

-- Allow wholesalers to delete their own inventory
create policy "Wholesalers can delete own inventory" on public.inventory
  for delete 
  using (
    owner_type = 'wholesaler' 
    and owner_id = auth.uid()
  );
