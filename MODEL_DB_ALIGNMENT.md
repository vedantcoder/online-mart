# Model & Database Alignment Summary

## ✅ Changes Made

### 1. Product Model Updated (`lib/models/Product.ts`)

**Fixed Issues:**
- Removed duplicate `images` field (was both `string[]` and `ProductImage[]`)
- Changed nullable fields from optional (`?`) to explicit `| null` to match database
- Fixed `specifications` type from `Record<string, string | number | boolean>` to `Record<string, unknown>`
- Ensured `unit`, `is_active`, `created_at`, `updated_at` are required (not optional)

**Final Model Structure:**
```typescript
export interface Product {
  id: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  sku?: string | null;
  base_price?: number | null;
  unit: string;                           // Required, default "piece"
  specifications?: Record<string, unknown>;
  is_active: boolean;                     // Required, default true
  created_at: string;                     // Required
  updated_at: string;                     // Required

  // Relations (loaded via joins)
  category?: Category;
  images?: ProductImage[];
  inventory?: Inventory[];
}
```

**Database Schema Match:**
```sql
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category_id uuid,
  sku text UNIQUE,
  base_price numeric,
  unit text DEFAULT 'piece',
  specifications jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 2. Other Models Verified ✅

- **User.ts** - Matches `profiles` table perfectly
- **Customer.ts** - Matches `customers` table perfectly
- **Cart.ts** - Matches `carts` and `cart_items` tables perfectly
- **Category** - Matches `categories` table perfectly
- **Inventory** - Matches `inventory` table perfectly
- **ProductImage** - Matches `product_images` table perfectly

## 📦 Product Seeding Script

### File: `scripts/seed-products.sql`

**What it does:**
1. Creates 6 categories (Electronics, Clothing, Home & Kitchen, Books, Sports, Toys)
2. Creates a demo retailer if none exists
3. Inserts 100 products:
   - 20 Electronics (₹8,499 - ₹129,900)
   - 20 Clothing (₹999 - ₹8,999)
   - 20 Home & Kitchen (₹599 - ₹14,999)
   - 15 Books (₹199 - ₹3,999)
   - 15 Sports & Fitness (₹299 - ₹2,999)
   - 10 Toys & Games (₹199 - ₹5,999)
4. Adds 3 images per product (1 primary + 2 additional)
5. Creates inventory for each product (20-100 units in stock)

### How to Run

**Prerequisites:**
⚠️ **You must have at least one retailer account registered** before running this script. 
- If you don't have a retailer account, sign up at: `http://localhost:3000/signup?role=retailer`

**Option 1: Supabase SQL Editor (Recommended)**
1. Go to your Supabase project
2. Click on "SQL Editor" in the sidebar
3. Click "New Query"
4. Copy the entire contents of `scripts/seed-products.sql`
5. Paste and click "Run"

**Option 2: Via psql Command Line**
```bash
psql -h your-project.supabase.co -p 5432 -U postgres -d postgres -f scripts/seed-products.sql
```

**Option 3: Via Supabase CLI**
```bash
supabase db execute -f scripts/seed-products.sql
```

## 🎯 Key Fields for Customer Products Page

The products page requires these essential fields (all now available):

```typescript
{
  id: string;              // Product UUID
  name: string;            // Display name
  description: string;     // Product details
  base_price: number;      // Price to display
  category_id: string;     // For filtering
  category: {              // For category display
    name: string;
    slug: string;
  };
  images: [{               // Product images
    image_url: string;
    is_primary: boolean;
    display_order: number;
  }];
  inventory: [{            // Stock and pricing
    quantity: number;      // Available stock
    price: number;         // Actual price
    is_available: boolean;
    owner_id: string;      // Retailer/wholesaler
  }];
}
```

## 🔄 Next Steps

1. **Run the seed script** to populate your database
2. **Verify data** by visiting `/customer/products` page
3. **Optional**: Replace placeholder images with real product images
4. **Optional**: Add more products using the same pattern in the script

## 📝 Notes

- All models now perfectly match database schema
- The seed script creates a demo retailer if none exists
- Product images use placeholder URLs (via.placeholder.com)
- Inventory has random quantities (20-100 units)
- MRP is set to 20% higher than base_price
- All products are active and available by default
