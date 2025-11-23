# Wholesaler Products Restructure - Complete Implementation

## Overview
Complete restructure of wholesaler system:
- **Wholesaler products** → Separate `wholesaler_products` table
- **NOT shown to customers** directly
- **Retailers browse** → Request to buy → Wholesaler approves
- **Upon approval** → Product created in main `products` table + added to retailer inventory
- **Only then** → Customers see it in main product listings

## Key Changes

### 1. New Database Table: `wholesaler_products`

```sql
CREATE TABLE wholesaler_products (
  id uuid PRIMARY KEY,
  wholesaler_id uuid REFERENCES wholesalers(id),
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id),
  sku text,
  unit text DEFAULT 'piece',
  wholesale_price numeric NOT NULL,
  mrp numeric,
  quantity_in_stock integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 10,
  is_available boolean DEFAULT true,
  images jsonb DEFAULT '[]'::jsonb,  -- Stored as JSON array
  specifications jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Key Differences from `products` table:**
- Wholesaler-specific (has `wholesaler_id`)
- Images stored as JSONB (not separate table)
- Uses `quantity_in_stock` instead of separate `inventory` table
- `wholesale_price` instead of `base_price`

### 2. Updated Trigger Logic

When wholesaler **confirms** order (`status='confirmed'`):

```sql
1. Check if wholesaler_product_id exists
2. Decrease wholesaler_products.quantity_in_stock
3. Create new product in main products table (if doesn't exist)
4. Insert product_images from wholesaler_products.images JSONB
5. Add to retailer inventory with markup
6. Product NOW appears to customers
```

**Flow Diagram:**
```
Wholesaler Product (wholesaler_products table)
    ↓
Retailer browses & orders
    ↓
Wholesaler approves order
    ↓
TRIGGER FIRES:
├─ Decrease wholesaler_products.quantity_in_stock
├─ Create entry in main products table
├─ Create product_images entries
└─ Create retailer inventory entry
    ↓
Customer can now see & buy product
```

### 3. API Updates

#### `/api/wholesaler/inventory` (GET)
- Now queries `wholesaler_products` table
- Returns products with embedded category
- Images are in JSONB format

#### `/api/wholesaler/inventory` (POST)
- Creates entry in `wholesaler_products`
- Stores images as JSONB array
- No longer creates in main `products` table

#### `/api/wholesaler/inventory/[id]` (GET/PATCH/DELETE)
- All operations on `wholesaler_products` table
- PATCH accepts `quantity_in_stock` and `wholesale_price`

### 4. UI Updates

#### `app/wholesaler/inventory/page.tsx`
**Interface Changed:**
```typescript
interface InventoryItem {
  id: string;
  name: string;  // Direct property (not item.product.name)
  quantity_in_stock: number;  // Not item.quantity
  wholesale_price: number;  // Not item.price
  images: Array<{url, is_primary, display_order}>;  // JSONB array
  category: {name: string} | null;
  // ...
}
```

**Key Changes:**
- `item.product.name` → `item.name`
- `item.quantity` → `item.quantity_in_stock`
- `item.price` → `item.wholesale_price`
- `item.product.images[].image_url` → `item.images[].url`
- `item.product.unit` → `item.unit`

#### `app/wholesaler/inventory/add/page.tsx`
- Still creates new products
- Now saves to `wholesaler_products` table
- Images sent as array to be stored in JSONB

### 5. RLS Policies

```sql
-- Wholesalers manage their own products
CREATE POLICY "Wholesalers manage own products" 
ON wholesaler_products FOR ALL
USING (wholesaler_id = auth.uid());

-- Retailers can VIEW all wholesaler products (for ordering)
CREATE POLICY "Retailers view wholesaler products"
ON wholesaler_products FOR SELECT
USING (EXISTS (SELECT 1 FROM retailers WHERE id = auth.uid()));

-- Customers CANNOT see wholesaler_products (NO POLICY = DENY)
```

### 6. Order Flow

#### `retailer_wholesaler_order_items` Table
Added column:
```sql
ALTER TABLE retailer_wholesaler_order_items
ADD COLUMN wholesaler_product_id uuid REFERENCES wholesaler_products(id);
```

#### When Retailer Orders:
```typescript
// POST /api/retailer/wholesaler-orders
{
  wholesaler_id: "...",
  items: [{
    wholesaler_product_id: "...",  // Reference to wholesaler_products
    quantity: 10,
    price_per_unit: 45.50
  }]
}
```

#### When Wholesaler Approves:
```sql
-- Trigger automatically:
1. Reads wholesaler_product_id from order items
2. Decreases wholesaler_products.quantity_in_stock
3. Creates product in main products table
4. Extracts images from JSONB → inserts into product_images
5. Adds to retailer inventory
```

## Migration Steps

1. **Run database migration:**
```bash
# In Supabase SQL Editor
psql -f scripts/14-restructure-wholesaler-products.sql
```

2. **Existing wholesaler inventory:**
   - Old inventory entries in `inventory` table remain (legacy support)
   - New products go to `wholesaler_products` table
   - Trigger handles both old and new flow

3. **Test flow:**
   - Wholesaler adds product → saved to `wholesaler_products`
   - Retailer browses → sees wholesaler products
   - Retailer orders → creates order with `wholesaler_product_id`
   - Wholesaler approves → product appears in main listings
   - Customer can now see & buy

## Customer View

**Before approval:**
- Customer searches products → wholesaler products NOT shown
- Only retailer inventory visible

**After wholesaler approves retailer order:**
- Product created in main `products` table
- Added to retailer's `inventory`
- NOW appears in customer search results
- Customer sees retailer as seller

## Benefits

1. **Clean separation:** Wholesaler catalog separate from customer-facing products
2. **No premature visibility:** Customers never see wholesaler-only products
3. **Approval workflow:** Wholesaler controls when products enter retail market
4. **Inventory tracking:** Proper stock management at both levels
5. **Performance:** Customer queries don't scan wholesaler inventory

## Files Changed

1. `scripts/14-restructure-wholesaler-products.sql` - **NEW** (migration)
2. `app/api/wholesaler/inventory/route.ts` - **MODIFIED** (use wholesaler_products)
3. `app/api/wholesaler/inventory/[id]/route.ts` - **MODIFIED** (use wholesaler_products)
4. `app/wholesaler/inventory/page.tsx` - **MODIFIED** (UI for new structure)
5. `app/wholesaler/inventory/add/page.tsx` - Already compatible (needs testing)

## Next Steps

- [ ] Run migration script 14
- [ ] Test wholesaler product creation
- [ ] Test retailer order placement (update to use wholesaler_product_id)
- [ ] Test wholesaler order approval
- [ ] Verify product appears in customer view after approval
- [ ] Update retailer browsing UI to show wholesaler products
