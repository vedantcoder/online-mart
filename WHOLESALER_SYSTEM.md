# Wholesaler Dashboard & Proxy System Implementation

## Overview
This document describes the complete wholesaler dashboard implementation and the proxy listing system that allows retailers to list wholesaler products without holding physical inventory.

## Database Schema

### New Tables Created

#### 1. `proxy_listings` Table
Allows retailers to list wholesaler products as "proxy items" visible to customers.

```sql
CREATE TABLE proxy_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid NOT NULL REFERENCES retailers(id),
  wholesaler_id uuid NOT NULL REFERENCES wholesalers(id),
  wholesaler_inventory_id uuid NOT NULL REFERENCES inventory(id),
  quantity_to_list integer NOT NULL CHECK (quantity_to_list > 0),
  markup_percentage numeric DEFAULT 0,
  custom_price numeric,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(retailer_id, wholesaler_inventory_id)
);
```

**Purpose**: When a retailer creates a proxy listing:
- They select a product from a wholesaler's inventory
- Set the quantity they want to display to customers
- Define their selling price (with markup)
- This product becomes visible to customers under the retailer's name
- Orders are fulfilled directly from wholesaler inventory

#### 2. `order_tracking` Table
Detailed tracking history for all orders.

```sql
CREATE TABLE order_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id),
  status text NOT NULL,
  notes text,
  location jsonb,
  created_by uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT now()
);
```

### Schema Updates

#### `order_items` Table Updates
Added columns to track proxy fulfillment:
```sql
ALTER TABLE order_items 
ADD COLUMN is_proxy boolean DEFAULT false,
ADD COLUMN wholesaler_id uuid REFERENCES wholesalers(id),
ADD COLUMN proxy_listing_id uuid REFERENCES proxy_listings(id);
```

#### `retailer_wholesaler_orders` Table Updates
```sql
ALTER TABLE retailer_wholesaler_orders 
ADD COLUMN fulfilled_at timestamp with time zone,
ADD COLUMN fulfillment_notes text;
```

### Automated Inventory Management

#### Trigger: Order Completion
When an order status changes to "delivered":
- Reduces retailer inventory for normal items
- Reduces wholesaler inventory for proxy items
- Updates stock levels automatically

#### Trigger: Retailer-Wholesaler Order Confirmation
When a wholesaler confirms a retailer's order:
- Adds purchased products to retailer's inventory
- Applies default markup (15% on price, 30% on MRP)
- Reduces wholesaler's inventory
- Prevents duplicate inventory entries

## System Flow

### 1. Wholesaler Proxy System Flow

```
1. Wholesaler adds products to their inventory
   ↓
2. Retailer browses wholesaler inventory
   ↓
3. Retailer creates proxy listing (2 options):
   
   Option A: Direct Proxy Listing
   - Retailer lists item without buying
   - Product visible to customers as "via [Wholesaler]"
   - Order goes to retailer
   - Fulfilled from wholesaler inventory
   - Inventory updated automatically on delivery
   
   Option B: Buy & Add to Inventory
   - Retailer places order with wholesaler
   - Wholesaler confirms order
   - Products added to retailer inventory
   - Retailer owns the inventory
   - Normal fulfillment process
```

### 2. Customer Order Flow (Proxy Items)

```
1. Customer sees product on retailer's store
   - Marked as "via [Wholesaler Name]"
   ↓
2. Customer places order
   - Order created with retailer as seller
   - order_items.is_proxy = true
   - order_items.wholesaler_id = wholesaler's ID
   ↓
3. Retailer processes order
   - Can assign delivery person
   - Updates order status
   ↓
4. On delivery completion
   - Wholesaler inventory reduced automatically
   - Retailer gets commission/markup
   - Customer receives product
```

### 3. Retailer-Wholesaler Direct Orders

```
1. Retailer browses wholesaler inventory
   ↓
2. Retailer places bulk order
   - Creates retailer_wholesaler_order
   - Status: pending
   ↓
3. Wholesaler receives order notification
   - Views order details
   - Can accept or reject
   ↓
4. Wholesaler accepts order
   - Status: confirmed
   - Trigger fires automatically:
     * Adds items to retailer inventory
     * Reduces wholesaler inventory
     * Applies default markup
   ↓
5. Retailer receives inventory
   - Products now in retailer's own inventory
   - Can set custom prices
   - Visible to customers under retailer
```

## API Endpoints

### Wholesaler APIs

#### Inventory Management
- `GET /api/wholesaler/inventory` - List wholesaler's inventory
- `POST /api/wholesaler/inventory` - Add product to inventory
- `GET /api/wholesaler/inventory/[id]` - Get inventory item details
- `PATCH /api/wholesaler/inventory/[id]` - Update inventory item
- `DELETE /api/wholesaler/inventory/[id]` - Remove inventory item

#### Order Management
- `GET /api/wholesaler/orders` - List orders from retailers
- `GET /api/wholesaler/orders/[id]` - Get order details
- `PATCH /api/wholesaler/orders/[id]` - Update order status
  - Accepts: pending → confirmed → processing → ready → delivered
  - Can cancel at any stage

#### Retailer Management
- `GET /api/wholesaler/retailers` - List connected retailers

### Retailer APIs

#### Wholesaler Interaction
- `GET /api/retailer/wholesalers` - List available wholesalers
- `GET /api/retailer/wholesaler-inventory` - Browse wholesaler products
- `POST /api/retailer/wholesaler-orders` - Place order with wholesaler
- `GET /api/retailer/wholesaler-orders` - View retailer's orders to wholesalers

#### Proxy Listing Management
- `GET /api/retailer/proxy-listings` - List retailer's proxy listings
- `POST /api/retailer/proxy-listings` - Create new proxy listing
- `PATCH /api/retailer/proxy-listings/[id]` - Update proxy listing
- `DELETE /api/retailer/proxy-listings/[id]` - Remove proxy listing

## Wholesaler Dashboard Pages

### 1. Dashboard (`/wholesaler/dashboard`)
**Features:**
- Real-time statistics (total orders, pending orders, inventory count, connected retailers)
- Pending orders section with accept/reject actions
- Quick action cards for navigation
- Order notifications

**Key Actions:**
- Accept pending orders → triggers inventory update
- Reject orders → marks as cancelled
- View order details

### 2. Inventory Page (`/wholesaler/inventory`)
**Features:**
- Grid view of all inventory items
- Search functionality
- Low stock warnings
- Add/Edit/Delete products

**Actions:**
- Add new products to inventory
- Update quantities and prices
- Mark products as available/unavailable
- Set low stock thresholds
- Delete inventory items

### 3. Orders Page (`/wholesaler/orders`)
**Features:**
- List all orders from retailers
- Filter by status (all, pending, confirmed, processing, ready, delivered, cancelled)
- Status management workflow
- Order details with items

**Status Workflow:**
```
pending → confirmed → processing → ready → delivered
         ↓
      cancelled
```

### 4. Retailers Page (`/wholesaler/retailers`)
**Features:**
- List of retailers who have ordered
- Contact information
- Location details
- Quick link to view orders from specific retailer

### 5. Analytics Page (`/wholesaler/analytics`)
**Status:** Placeholder for future implementation
**Planned Features:**
- Sales analytics
- Revenue tracking
- Popular products
- Retailer performance metrics

## Retailer Dashboard Updates

### Wholesalers Page (`/retailer/wholesalers`)
**Existing Features:**
- Browse available wholesalers
- View wholesaler inventory
- Two modes of operation:
  1. **Add Proxy**: List item without buying (proxy listing)
  2. **Buy & Add**: Purchase and add to own inventory

**Proxy Listing:**
- Set display quantity for customers
- Set custom selling price
- Item shows as "via [Wholesaler]"
- Order fulfilled from wholesaler inventory

**Buy & Add:**
- Purchase quantity from wholesaler
- Set retailer's selling price and MRP
- Becomes part of retailer's inventory
- Normal order fulfillment

## Stock Management Rules

### 1. Proxy Listings
- **No stock deduction on proxy listing creation**
- Stock deducted only when customer order is delivered
- Wholesaler inventory updated automatically
- Retailer never holds physical inventory for proxy items

### 2. Direct Purchase (Buy & Add)
- Retailer places order with wholesaler
- Wholesaler accepts → stock moved to retailer
- Wholesaler inventory reduced immediately
- Retailer inventory increased immediately
- Retailer owns the inventory

### 3. Customer Orders
- **Normal items**: Deducted from retailer inventory on delivery
- **Proxy items**: Deducted from wholesaler inventory on delivery
- Automatic inventory updates via database triggers
- Prevents manual stock management errors

## Security & Access Control

### Row Level Security (RLS) Policies

#### Proxy Listings
- Retailers: Full CRUD on their own listings
- Wholesalers: Read-only access to listings of their products
- Customers: View only active listings

#### Orders
- Wholesalers: Manage orders where they are the seller
- Retailers: Manage orders where they are the retailer
- Full isolation between different users

#### Inventory
- Wholesalers: Full control over their inventory
- Retailers: Can view wholesaler inventory (for proxy/purchase)
- Public: Can view available inventory for shopping

## Benefits of This System

### For Wholesalers
✅ Reach more customers through retailers
✅ No need to manage customer orders directly
✅ Bulk sales to retailers
✅ Automated inventory management
✅ Track which retailers are performing well

### For Retailers
✅ Expand product catalog without holding inventory
✅ Offer more variety to customers
✅ Flexible: proxy or own inventory
✅ Automated stock management
✅ Multiple wholesaler options

### For Customers
✅ More product variety
✅ Clear labeling of proxy items
✅ Consistent ordering experience
✅ Transparent pricing

## Next Steps / TODO

1. **Run Database Migration**
   ```bash
   # Execute in Supabase SQL Editor
   scripts/12-add-wholesaler-proxy-system.sql
   ```

2. **Test Wholesaler Flow**
   - Register as wholesaler
   - Add products to inventory
   - Accept/reject orders

3. **Test Retailer Flow**
   - Browse wholesaler inventory
   - Create proxy listings
   - Place orders with wholesalers

4. **Test Customer Flow**
   - View proxy items on retailer store
   - Place orders for proxy items
   - Verify inventory updates on delivery

5. **Future Enhancements**
   - Analytics dashboard for wholesalers
   - Retailer-wholesaler relationship management
   - Bulk import for wholesaler inventory
   - Price negotiation system
   - Commission tracking
   - Automated reorder points

## Troubleshooting

### Common Issues

**Issue**: Proxy listing creation fails
- **Check**: Wholesaler inventory has sufficient quantity
- **Check**: Product is marked as available
- **Check**: No duplicate listing exists

**Issue**: Inventory not updating after order delivery
- **Check**: Database triggers are enabled
- **Check**: Order status is set to "delivered"
- **Check**: order_items table has correct is_proxy flag

**Issue**: Wholesaler orders not visible
- **Check**: Order status is not "pending"
- **Check**: RLS policies allow access
- **Check**: Correct user role (wholesaler/retailer)

## Support

For questions or issues with the wholesaler system:
1. Check database logs in Supabase
2. Review RLS policies
3. Verify API responses in browser console
4. Check order_tracking table for status history
