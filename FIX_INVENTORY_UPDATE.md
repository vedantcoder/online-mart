# Fix for Inventory Update Issue

## Problem
The retailer inventory edit page was not saving updates to the database because of missing Row Level Security (RLS) policies. Three tables were affected:
1. **inventory** table - only had SELECT policy, no INSERT/UPDATE/DELETE
2. **products** table - only had SELECT policy, no INSERT/UPDATE
3. **product_images** table - only had SELECT policy, no INSERT/UPDATE/DELETE

When a retailer tried to update inventory, the changes affected both the `inventory` table (quantity, price, mrp) and the `products` table (name, description, category), but neither table had UPDATE policies enabled.

## Solution
Added comprehensive RLS policies to allow proper management of inventory, products, and product images by authenticated users.

## How to Apply the Fix

### Step 1: Apply the SQL Migration
1. Open your Supabase Dashboard
2. Go to the SQL Editor
3. Open the file `scripts/11-fix-inventory-rls-policies.sql`
4. Copy all the SQL content
5. Paste it into the Supabase SQL Editor
6. Click "Run" to execute the migration

### Step 2: Verify the Fix
After running the migration:

1. Log in as a retailer
2. Go to Retailer Dashboard → Inventory
3. Click "Edit" on any product
4. Make changes to any field (name, stock, price, description, category, etc.)
5. Click "Save changes"
6. You should see the "Saved" message
7. Go back to the inventory list
8. Verify your changes are reflected in the list

## What Was Added

The migration adds RLS policies for three tables:

### Products Table:
- **SELECT**: Public read access (everyone can view)
- **INSERT**: Authenticated users can create products
- **UPDATE**: Authenticated users can update products

### Product Images Table:
- **SELECT**: Public read access (everyone can view)
- **INSERT**: Authenticated users can add images
- **UPDATE**: Authenticated users can update images
- **DELETE**: Authenticated users can remove images

### Inventory Table:

#### For Retailers:
- **INSERT**: Retailers can add new inventory items (owner_type='retailer' and owner_id matches)
- **UPDATE**: Retailers can update their own inventory items
- **DELETE**: Retailers can delete their own inventory items

#### For Wholesalers:
- **INSERT**: Wholesalers can add new inventory items (owner_type='wholesaler' and owner_id matches)
- **UPDATE**: Wholesalers can update their own inventory items
- **DELETE**: Wholesalers can delete their own inventory items

#### Public Access:
- **SELECT**: Everyone can view inventory (read-only)

## Technical Details

**Root Cause**: The original schema had these policies:
```sql
create policy "Products are public" on public.products
  for select using (true);

create policy "Product images are public" on public.product_images
  for select using (true);

create policy "Inventory is public" on public.inventory
  for select using (true);
```

These only allowed reading data, not modifying it.

**Fix**: Added separate policies for INSERT, UPDATE, and DELETE operations on all three tables with proper authentication and ownership checks.

## Field Mapping

The API correctly separates fields between tables:

**Inventory Table** (per-owner pricing and stock):
- quantity
- price  
- mrp
- is_available
- low_stock_threshold

**Products Table** (shared product information):
- name
- description
- category_id
- unit
- base_price

**Product Images Table** (product photos):
- image_url
- is_primary
- display_order
