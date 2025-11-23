# Stripe Payment Integration - Quick Setup

## ✅ Why Stripe?
- **Zero verification** needed for test mode
- Works instantly - no KYC, PAN, or business verification
- Get test keys in 30 seconds
- Better developer experience than Razorpay for local dev

## 🚀 Setup (2 Minutes)

### 1. Create Stripe Account
Visit: https://dashboard.stripe.com/register

### 2. Get Your Test Keys
1. After signup, you'll land on the dashboard
2. Click **"Get your test API keys"** or go to: https://dashboard.stripe.com/test/apikeys
3. Copy both keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - click "Reveal test key"

### 3. Configure Environment
Create `.env.local` in project root:

```bash
# Copy from .env.local.example
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe keys (paste your test keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

### 4. Run Database Migration
Execute `scripts/07-add-payment-gateway-columns.sql` in Supabase SQL Editor

### 5. Start Development Server
```bash
npm run dev
```

## 🧪 Testing Payments

### Test Cards (No Real Money)
Use these cards in Stripe checkout:

| Card Number          | Scenario              |
|----------------------|----------------------|
| `4242 4242 4242 4242` | Success              |
| `4000 0025 0000 3155` | 3D Secure Required   |
| `4000 0000 0000 9995` | Declined (generic)   |

- Use **any future expiry date** (e.g., 12/34)
- Use **any 3-digit CVC** (e.g., 123)
- Use **any ZIP code**

### Test Flow
1. Login as customer
2. Place an order
3. Go to order details page
4. Click **"Pay Online"**
5. Redirects to Stripe checkout
6. Enter test card: `4242 4242 4242 4242`
7. Complete payment
8. Redirects back - payment verified automatically

### Cash on Delivery
Click **"Cash on Delivery"** button - no payment gateway needed!

## 📁 What Changed

### Backend APIs
- `app/api/payments/razorpay/create/route.ts` → Now creates Stripe PaymentIntent
- `app/api/payments/razorpay/verify/route.ts` → Now verifies Stripe payment
- Uses `stripe` npm package (auto-installed)

### Frontend
- `app/customer/orders/[id]/page.tsx` → Uses Stripe Checkout redirect flow
- Uses `@stripe/stripe-js` for client SDK
- Auto-verifies payment on return from Stripe

### Database
- Added columns: `payment_gateway`, `payment_gateway_order_id`, etc.
- Migration: `scripts/07-add-payment-gateway-columns.sql`

## 🔄 Switching to Production

When ready to go live:
1. Complete Stripe account verification (business details, banking info)
2. Get **live keys** from https://dashboard.stripe.com/apikeys
3. Replace `pk_test_...` and `sk_test_...` with live keys
4. Done! No code changes needed.

## 💡 Advantages Over Razorpay (for Dev)

| Feature | Stripe | Razorpay |
|---------|--------|----------|
| Test keys without verification | ✅ Instant | ❌ Requires KYC |
| PAN verification | ❌ Not needed | ✅ Required |
| Time to start testing | 30 seconds | 2-3 days |
| Test card variety | 50+ scenarios | Limited |
| International support | Excellent | India-focused |

## 📝 Notes

- Old Razorpay endpoints renamed but still work as Stripe endpoints
- COD option unchanged - still available
- Payment gateway field in DB stores "stripe" for tracking
- Webhook support can be added later if needed

## 🐛 Troubleshooting

**"Stripe key not configured"**
- Ensure `.env.local` has both `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY`
- Restart dev server after adding env vars

**Payment not verifying**
- Check browser console for errors
- Verify migration ran successfully
- Ensure order belongs to logged-in customer

**Need help?**
Check Stripe docs: https://stripe.com/docs/payments/accept-a-payment
