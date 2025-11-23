# Registration Error Fixes Applied

## Summary
Fixed the "Registration failed. Please try again." error by addressing multiple issues in the authentication flow.

## Root Cause
The main issue was a **missing `SUPABASE_SERVICE_ROLE_KEY`** environment variable, which caused the server-side registration API to fail silently.

## Files Modified

### 1. `.env.local`
**Added:**
- `SUPABASE_SERVICE_ROLE_KEY` placeholder with instructions

**Why:** The service role key is required for the admin client to create users with auto-confirmed emails.

**Action Required:** You need to add your actual Service Role Key from Supabase Dashboard.

---

### 2. `app/api/auth/register/route.ts`
**Changes:**
- ✅ Removed incorrect import of client-side Supabase instance (`supabase` from `client.ts`)
- ✅ Removed server-side sign-in attempt (moved to client)
- ✅ Fixed conflict with database trigger that auto-creates profile and role entries
- ✅ Changed to UPDATE instead of INSERT for role-specific details
- ✅ Added proper error handling with detailed messages
- ✅ Added logging for debugging
- ✅ Returns success response for client-side sign-in

**Before:**
```typescript
// Tried to sign in using client-side supabase on the server (WRONG)
const { data: signInData, error: signInError } =
  await supabase.auth.signInWithPassword({ email, password });
```

**After:**
```typescript
// Returns success for client to sign in
return NextResponse.json({ 
  success: true,
  message: "User created successfully",
  email,
}, { status: 201 });
```

---

### 3. `lib/services/AuthService.ts`
**Changes:**
- ✅ Fixed to properly handle server registration response
- ✅ Client now signs in after server creates user
- ✅ Removed unnecessary fallback to client-side registration
- ✅ Better error messages

**Flow:**
1. Server API creates user with auto-confirmed email
2. Client receives success response
3. Client signs in with email/password
4. Client fetches full user data

---

### 4. `lib/supabase/admin.ts`
**Changes:**
- ✅ Added validation for required environment variables
- ✅ Throws clear error messages if variables are missing
- ✅ Removed silent console.warn (now throws errors)

**Before:**
```typescript
if (!supabaseUrl || !serviceRoleKey) {
  console.warn("Supabase admin client missing env vars...");
}
```

**After:**
```typescript
if (!serviceRoleKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Please get your Service Role Key from Supabase Dashboard > Project Settings > API and add it to your .env.local file."
  );
}
```

---

## How the Registration Flow Works Now

### 1. User fills registration form
- Enters email, password, name, phone, role
- Enters role-specific details (shop name, address, etc.)

### 2. Frontend calls `register()` from authStore
```typescript
await register(data);
```

### 3. AuthService calls server API
```typescript
POST /api/auth/register
```

### 4. Server creates user (with auto-confirmed email)
- Uses `supabaseAdmin.auth.admin.createUser()`
- Database trigger automatically creates:
  - Profile entry
  - Role-specific entry (customer/retailer/wholesaler/delivery)
  - Cart (if customer)

### 5. Server updates role-specific details
- Updates additional fields like address, GST, vehicle info

### 6. Server returns success
```json
{ "success": true, "email": "user@example.com" }
```

### 7. Client signs in
```typescript
await supabase.auth.signInWithPassword({ email, password });
```

### 8. Client fetches full user data
```typescript
await AuthService.getCurrentUser();
```

### 9. Redirect to dashboard
```typescript
router.push(`/${role}/dashboard`);
```

---

## Database Triggers

The database has these triggers that run automatically:

### `on_auth_user_created`
- Fires when new user is created in `auth.users`
- Creates profile in `public.profiles`
- Creates role-specific entry (customers/retailers/wholesalers/delivery_persons)

### `on_customer_created`
- Fires when new customer is created
- Automatically creates empty cart for the customer

---

## Next Steps

### 1. Add Service Role Key (REQUIRED)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings > API
4. Copy the **service_role** key
5. Add to `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (your actual key)
```

### 2. Restart Dev Server
```bash
npm run dev
```

### 3. Test Registration
- Try creating a new user account
- Should work without errors now

### 4. Check Logs
If issues persist, check:
- Browser Console (F12)
- Terminal where Next.js is running
- Supabase Dashboard > Logs

---

## Security Notes

⚠️ **IMPORTANT:**
- Service Role Key has admin privileges
- Can bypass Row Level Security (RLS)
- Should NEVER be exposed to client-side code
- Should NEVER be committed to git (`.env.local` is gitignored)
- Only use in server-side API routes

---

## Common Errors & Solutions

### "Registration failed. Please try again."
- **Cause:** Missing or invalid Service Role Key
- **Solution:** Add correct key to `.env.local` and restart server

### "Failed to create user"
- **Cause:** Email already exists or Supabase auth disabled
- **Solution:** Check Supabase Dashboard > Authentication > Providers

### "Failed to create customer/retailer/... record"
- **Cause:** Database trigger failed or table doesn't exist
- **Solution:** Run SQL scripts in `/scripts/` folder

### "Registration succeeded but sign-in failed"
- **Cause:** Email not confirmed or user disabled
- **Solution:** Check user status in Supabase Dashboard > Authentication > Users

---

## Testing Checklist

- [ ] Added Service Role Key to `.env.local`
- [ ] Restarted dev server
- [ ] Can register as Customer
- [ ] Can register as Retailer (with shop name)
- [ ] Can register as Wholesaler (with business name)
- [ ] Can register as Delivery Person
- [ ] After registration, redirected to correct dashboard
- [ ] User session is maintained (doesn't log out on refresh)
- [ ] Cart is created for customers
- [ ] Profile data is saved correctly

---

## Additional Documentation

See `SETUP_INSTRUCTIONS.md` for detailed setup guide.

# Checkout & Cart Fixes Applied

## Problem: "Cart is empty" Error During Checkout
Users were encountering a "Cart is empty" error when attempting to place an order, even though items were visible in the cart page.

**Root Cause:**
The `app/api/checkout/route.ts` endpoint uses a deep join query to fetch the cart, its items, and the related product/inventory details.
```typescript
items:cart_items(..., product:products(..., inventory(owner_id)))
```
Row Level Security (RLS) policies on the `inventory` table (or potentially `products`) were preventing the server-side client (which runs as the authenticated user) from fetching the nested data. This caused the `cart.items` array to appear empty or incomplete to the checkout logic.

**Solution:**
Updated `app/api/checkout/route.ts` to use `supabaseAdmin` for fetching the cart. This bypasses RLS checks for this specific server-side operation, ensuring that the cart items and necessary seller information are retrieved correctly to create the order.

## Problem: Cart Not Clearing After Order
There was a risk that carts wouldn't be cleared after a successful order if the user lacked permission to delete rows from `cart_items`.

**Solution:**
1. Updated `app/api/checkout/route.ts` to use `supabaseAdmin` when clearing the cart for Cash on Delivery (COD) orders.
2. Updated `app/api/payments/stripe/verify/route.ts` to use `supabaseAdmin` when clearing the cart for Online orders (after successful payment verification).
3. Also updated `app/api/payments/stripe/verify/route.ts` to use `supabaseAdmin` for updating the order status to "completed", ensuring the payment flow isn't blocked by RLS.

## Problem: "Processing Error" During Payment
Users encountered a "processing error" (or generic failure) when clicking "Pay Online" or "Place Order" with online payment selected.

**Root Cause:**
The frontend was using `stripe.confirmPayment()` which requires Stripe Elements (like `<PaymentElement />`) to be mounted on the page to collect card details. However, the checkout page did not render any Stripe Elements, causing the confirmation to fail immediately.

**Solution:**
Switched the payment flow to use **Stripe Checkout Sessions** (Hosted Payment Page).
1.  **Backend:** Updated `api/checkout` and `api/payments/stripe/create` to create a `Stripe Checkout Session` instead of a `PaymentIntent`.
2.  **Frontend:** Updated `customer/checkout` and `customer/orders/[id]` to receive the `sessionId` and redirect the user to the Stripe hosted page using `stripe.redirectToCheckout()`.
3.  **Verification:** Updated `api/payments/stripe/verify` to validate the payment using the `session_id` returned in the URL after redirection.

This ensures a secure and complete payment UI provided by Stripe without requiring complex client-side Elements integration.

## Files Modified
- `app/api/checkout/route.ts`
- `app/api/payments/stripe/verify/route.ts`
