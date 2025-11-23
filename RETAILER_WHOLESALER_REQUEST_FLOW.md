# Retailer-Wholesaler Request Flow Update

## Overview
Updated the retailer wholesaler browsing and ordering system to use a **request-based flow** instead of direct "Buy & Add" actions. Retailers now browse products from the `wholesaler_products` table and send purchase requests that require wholesaler approval.

## Key Changes

### 1. New API: Browse Wholesaler Products
**File**: `app/api/retailer/wholesaler-products/route.ts`

- **Purpose**: Fetch all available products from the `wholesaler_products` table
- **Access**: Only retailers can access this endpoint
- **Response**: Products grouped by wholesaler with full details
- **Filters**: Only shows available products with stock > 0

### 2. Updated Retailer Wholesalers Page
**File**: `app/retailer/wholesalers/page.tsx`

#### Removed Features:
- ❌ "Buy & Add" button (direct purchase)
- ❌ "Add Proxy" button (proxy listing)
- ❌ Legacy inventory-based browsing

#### New Features:
- ✅ **Add to Cart**: Retailers can add multiple products to cart
- ✅ **Cart Summary**: Shows selected products count and total
- ✅ **Quantity Management**: Increase/decrease quantities in cart
- ✅ **Review Modal**: Review all products before sending request
- ✅ **Delivery Address**: Mandatory field for order delivery
- ✅ **Order Notes**: Optional field for special instructions

#### UI Flow:
1. Browse wholesaler products by wholesaler
2. Click "Add to Cart" on desired products
3. View cart summary banner at top
4. Click "Review & Send Request"
5. Review products, adjust quantities
6. Enter delivery address and notes
7. Click "Send Purchase Request"
8. Separate orders created for each wholesaler

### 3. Updated Order Creation API
**File**: `app/api/retailer/wholesaler-orders/route.ts`

#### POST Changes:
- Now accepts `wholesaler_product_id` instead of `product_id`
- Order items reference the `wholesaler_products` table
- Creates orders with status `pending` (awaiting wholesaler approval)

#### GET Changes:
- Includes both `product` and `wholesaler_product` in order items
- Supports both legacy (product_id) and new (wholesaler_product_id) flows

### 4. Database Schema Support
Already implemented in `scripts/14-restructure-wholesaler-products.sql`:

```sql
-- Order items reference wholesaler products
ALTER TABLE public.retailer_wholesaler_order_items 
ADD COLUMN wholesaler_product_id uuid REFERENCES public.wholesaler_products(id);

-- Trigger handles order approval
CREATE OR REPLACE FUNCTION handle_retailer_wholesaler_order_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- 1. Decrease wholesaler product stock
    -- 2. Create product in main products table (if needed)
    -- 3. Add to retailer inventory
  END IF;
END;
$$;
```

## Complete Flow

### Retailer Side:
1. Navigate to `/retailer/wholesalers`
2. Browse products from multiple wholesalers
3. Add desired products to cart
4. Review cart and adjust quantities
5. Provide delivery address
6. Send purchase request(s)
7. Wait for wholesaler approval
8. View orders in `/retailer/orders`

### Wholesaler Side (Existing):
1. Receive notification of new order
2. View order details in `/wholesaler/orders`
3. Review retailer request
4. **Approve** or **Reject** order
5. On approval → Trigger automatically:
   - Decreases wholesaler stock
   - Creates product in main catalog (if new)
   - Adds inventory to retailer
   - Retailer can now sell to customers

### Customer Side:
- Customers NEVER see wholesaler products directly
- Only see products in retailer inventory
- Products appear after wholesaler approves retailer order

## Key Benefits

### 1. Clear Approval Workflow
- Wholesalers have full control over order fulfillment
- No automatic inventory transfers without approval
- Better inventory management for wholesalers

### 2. Multi-Product Orders
- Retailers can order multiple products at once
- Automatic grouping by wholesaler
- Single delivery address for bulk orders

### 3. Better UX for Retailers
- Shopping cart experience
- Review before submitting
- Clear order tracking

### 4. Data Integrity
- Products remain in wholesaler_products until approved
- Main products table only contains approved, customer-facing products
- Clean separation of B2B and B2C inventory

## API Endpoints

### Browse Wholesaler Products
```typescript
GET /api/retailer/wholesaler-products
Headers: Authorization (Supabase JWT)
Response: {
  wholesalers: [
    {
      id: string,
      business_name: string,
      business_address: string,
      business_city: string,
      business_state: string,
      profile: { full_name, email, phone },
      products: [
        {
          id: string,
          name: string,
          description: string,
          wholesale_price: number,
          quantity_in_stock: number,
          images: [...],
          category: {...}
        }
      ]
    }
  ]
}
```

### Create Purchase Request
```typescript
POST /api/retailer/wholesaler-orders
Headers: Authorization (Supabase JWT)
Body: {
  wholesaler_id: string,
  items: [
    {
      wholesaler_product_id: string,
      product_name: string,
      quantity: number,
      price_per_unit: number
    }
  ],
  delivery_address: string,
  notes?: string
}
Response: { order: {...} }
```

## Testing Checklist

- [ ] Run migration script 14 to create wholesaler_products table
- [ ] Create test wholesaler products via `/wholesaler/inventory/add`
- [ ] Login as retailer and browse `/retailer/wholesalers`
- [ ] Verify wholesaler products are visible
- [ ] Add multiple products to cart
- [ ] Verify cart counter updates
- [ ] Review cart modal
- [ ] Adjust quantities in cart
- [ ] Remove products from cart
- [ ] Submit order with delivery address
- [ ] Verify orders created with status "pending"
- [ ] Login as wholesaler and view orders
- [ ] Approve order
- [ ] Verify trigger creates product in main table
- [ ] Verify retailer inventory updated
- [ ] Verify wholesaler stock decreased
- [ ] Login as customer and verify product visible from retailer

## Files Modified

1. `app/api/retailer/wholesaler-products/route.ts` - NEW
2. `app/retailer/wholesalers/page.tsx` - COMPLETELY RESTRUCTURED
3. `app/api/retailer/wholesaler-orders/route.ts` - UPDATED

## Next Steps

1. Run the database migration script 14
2. Test the complete flow end-to-end
3. Consider adding order status notifications
4. Add wholesaler order management UI improvements
5. Consider adding bulk approval for multiple orders
