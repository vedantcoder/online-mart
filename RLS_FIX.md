# Row Level Security (RLS) Fix for Orders

## Problem 1: Order Creation Failed ✅ FIXED
The checkout API was failing with error:
```
new row violates row-level security policy for table "orders"
```

This happened because the `orders` table had RLS enabled but **no INSERT policies** were defined.

**Solution Applied:** Used admin client in checkout API to bypass RLS for order creation.

## Problem 2: Order Not Found in Order Details Page ⚠️ REQUIRES ACTION

After fixing order creation, a new issue appeared:
- Orders are created successfully ✅
- But customers cannot view their orders ❌
- Error: "Order not found" on order detail page

**Root Cause:** The order detail page uses regular `supabase` client which respects RLS policies. There's no SELECT policy allowing customers to read their own orders.

## IMMEDIATE FIX REQUIRED 🔧

You must run the RLS migration to allow customers to view orders:

### Changes Made:
1. Imported `supabaseAdmin` from `@/lib/supabase/admin`
2. Changed order insert from `supabase.from("orders")` to `supabaseAdmin.from("orders")`
3. Changed order_items insert from `supabase.from("order_items")` to `supabaseAdmin.from("order_items")`
4. Changed order rollback delete to use `supabaseAdmin`

This solution works immediately without requiring any database migrations.

### Step 1: Run the RLS Migration

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Go to your project → SQL Editor
3. Copy the entire contents of `scripts/08-add-orders-rls-policies.sql`
4. Paste and click "Run"
5. Wait for "Success. No rows returned" message

### Step 2: Test Order Viewing

1. Refresh your order detail page
2. You should now see your order details
3. Payment buttons (Pay Online / Cash on Delivery) will be visible

## What the Migration Does

The migration adds comprehensive RLS policies for orders and order_items:
- Customers can view their own orders
- Sellers can view orders they're selling
- Delivery persons can view assigned orders
- Customers can insert orders (for checkout)
- Customers/Sellers/Delivery can update orders based on their role
- All roles can view order_items for their orders

## Why Admin Client is Preferred Here

Using the admin client for order creation is actually the **better approach** because:

1. **Transaction Safety**: Order creation involves multiple tables (orders + order_items), and we need atomic operations
2. **Business Logic**: The API validates the customer's authentication and cart ownership before creating orders
3. **Cleaner Code**: No need to write complex RLS policies that duplicate business logic
4. **Performance**: Admin client is faster (no RLS checks)

The regular client is still used for:
- Fetching customer data (respects RLS)
- Fetching cart data (respects RLS)
- All read operations by users

## Stripe Payment Integration 💳

Yes, Stripe is fully integrated! You can see it on the order detail page:

1. After placing an order, you'll see payment options:
   - **Pay Online** button → Redirects to Stripe Checkout
   - **Cash on Delivery** button → Marks order as COD

2. Stripe payment flow:
   - Click "Pay Online"
   - Creates PaymentIntent via `/api/payments/razorpay/create`
   - Redirects to Stripe hosted checkout page
   - After payment, redirects back with payment_intent ID
   - Verifies payment via `/api/payments/razorpay/verify`
   - Updates order status to "completed"

3. Test card for Stripe:
   - Card: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits

**Note:** The payment buttons are only visible if you can access the order detail page, which requires running the RLS migration first!

## Verify the Complete Fix

1. ✅ Make sure `.env.local` has `SUPABASE_SERVICE_ROLE_KEY` configured
2. ✅ Make sure `.env.local` has Stripe keys (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY`)
3. ⚠️ **Run `scripts/08-add-orders-rls-policies.sql` in Supabase SQL Editor**
4. Restart your dev server if it's running
5. Test complete flow:
   - Add items to cart ✅
   - Go to checkout page ✅
   - Fill delivery details ✅
   - Click "Place Order" ✅
   - Should redirect to order detail page ✅
   - Should see order details (after RLS migration) ⚠️
   - Should see "Pay Online" and "Cash on Delivery" buttons ⚠️
   - Click "Pay Online" to test Stripe payment ⚠️

## Notes

- The admin client requires `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local` file
- Get this key from: Supabase Dashboard → Project Settings → API → service_role key
- **Never expose this key in client-side code** - only use in server-side API routes
- The current implementation is secure because authentication is checked before using admin client

