# 🚀 Quick Start Guide - Online-MART

## 📊 Database Setup

### Step 1: Run the SQL Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open and execute `scripts/06-add-feedback-and-notifications.sql`

This will create all necessary tables:
- ✅ `feedback` - Product reviews
- ✅ `orders` & `order_items` - Order management
- ✅ `notifications` - User notifications
- ✅ `customer_queries` - Support system
- ✅ `offline_orders` - Scheduled orders
- ✅ `retailer_wholesaler_orders` - B2B orders

### Step 2: Verify Tables

Check that all tables are created successfully in the Table Editor.

## 🎯 Key Features to Test

### 1. Customer Features

**Registration & Login**
- Email/Password: `/register` and `/login?role=customer`
- Phone OTP: `/login/phone`
- Social Login: Google/Facebook buttons

**Product Browsing**
- Dashboard: `/customer/dashboard`
- Products: `/customer/products`
- Product Detail: `/customer/products/[id]`
- Filters: Price range, categories, search

**Shopping**
- Add to Cart: Product pages
- Cart: `/customer/cart`
- Wishlist: `/customer/wishlist`
- Checkout: Complete purchase flow

**Order Management**
- Orders List: `/customer/orders`
- Order Details: `/customer/orders/[id]`
- Track delivery status
- View order timeline

**Reviews & Feedback**
- Write reviews: `/customer/products/[id]` (scroll to reviews)
- Review delivered orders: `/customer/reviews`
- View product ratings and reviews

**Support**
- Create queries: `/customer/support`
- Track query status
- View resolutions

### 2. Retailer Features

**Dashboard**
- Overview: `/retailer/dashboard/retailer`
- Inventory stats
- Low stock alerts
- Quick actions

**Inventory Management**
- Products: `/retailer/dashboard/retailer/products`
- Add Product: `/retailer/dashboard/retailer/products/add`
- Update stock levels

**Proxy Products**
- API: `/api/retailer/proxy-products?retailer_id=<id>`
- Shows wholesaler products in same city

### 3. Wholesaler Features

**Dashboard**
- Overview: `/wholesaler/dashboard/wholesaler`
- Bulk inventory
- Retailer orders

### 4. Delivery Person Features

**Dashboard**
- Active deliveries: `/delivery/dashboard`
- Toggle availability
- Update order status
- Navigation to addresses
- Track earnings

## 🔧 Testing Workflow

### Complete Customer Journey

1. **Sign Up**
   - Go to `/register`
   - Select "Customer" role
   - Complete registration
   - Or use Phone OTP at `/login/phone`

2. **Browse Products**
   - Navigate to Dashboard
   - Click "Shop Now" or view categories
   - Use filters to find products

3. **Add to Cart**
   - Click on a product
   - View details and reviews
   - Click "Add to Cart"
   - Adjust quantity using +/- buttons

4. **Checkout**
   - Go to Cart
   - Review items
   - Proceed to checkout
   - Complete order

5. **Track Order**
   - Go to "My Orders"
   - Click on an order
   - View delivery status
   - See estimated delivery

6. **Write Review** (after delivery)
   - Go to `/customer/reviews`
   - OR click "Write a Review" on product page
   - Rate product (1-5 stars)
   - Add review text
   - Submit

7. **Get Support**
   - Go to `/customer/support`
   - Click "New Query"
   - Fill in subject and description
   - Select priority
   - Submit query

### Testing Retailer Features

1. **Login as Retailer**
   - `/login?role=retailer`

2. **View Dashboard**
   - See inventory stats
   - Check low stock alerts
   - View total value

3. **Manage Products**
   - Add new products
   - Update quantities
   - Set pricing

4. **Check Proxy Products**
   - API endpoint shows wholesaler products

### Testing Delivery Features

1. **Login as Delivery Person**
   - `/login?role=delivery`

2. **Toggle Availability**
   - Turn on/off availability status

3. **View Assignments**
   - See pending deliveries
   - View customer details

4. **Update Status**
   - Mark "Out for Delivery"
   - Mark "Delivered"

5. **Navigate**
   - Click "Navigate" button
   - Opens Google Maps

## 🎨 UI Features to Verify

### Text Visibility
✅ All text uses high contrast colors
✅ Primary text: `text-gray-900`
✅ Secondary text: `text-gray-700`
✅ Disabled text: `text-gray-500`

### Interactive Elements
✅ Buttons have hover states
✅ Links change color on hover
✅ Cards have shadow effects
✅ Loading spinners appear during operations

### Responsive Design
✅ Mobile menu works
✅ Grids stack on small screens
✅ Text remains readable
✅ Images scale properly

## 📱 Navigation Paths

### Customer Routes
```
/customer/dashboard          - Main dashboard
/customer/products           - Product listing
/customer/products/[id]      - Product details
/customer/cart               - Shopping cart
/customer/wishlist           - Saved items
/customer/orders             - Order history
/customer/orders/[id]        - Order details
/customer/reviews            - Write reviews
/customer/support            - Customer support
/customer/profile            - Profile settings
```

### Retailer Routes
```
/retailer/dashboard/retailer              - Main dashboard
/retailer/dashboard/retailer/products     - Product list
/retailer/dashboard/retailer/products/add - Add product
/retailer/inventory                       - Inventory view
```

### Delivery Routes
```
/delivery/dashboard          - Delivery dashboard
```

### Wholesaler Routes
```
/wholesaler/dashboard/wholesaler - Main dashboard
/wholesaler/orders               - Order management
```

## 🔑 Test Accounts

Create test accounts for each role:

1. **Customer**: customer@test.com
2. **Retailer**: retailer@test.com  
3. **Wholesaler**: wholesaler@test.com
4. **Delivery**: delivery@test.com

Password: Use any secure password (e.g., `Test123!`)

## ✅ Feature Checklist

### Authentication
- [x] Email/Password login
- [x] Phone OTP login
- [x] Google OAuth
- [x] Facebook OAuth
- [x] Role-based registration

### Product Features
- [x] Product listing
- [x] Product details
- [x] Image display
- [x] Price and stock info
- [x] Category filtering
- [x] Price range filtering
- [x] Search functionality

### Shopping Features
- [x] Add to cart
- [x] Update quantities
- [x] Remove from cart
- [x] Wishlist management
- [x] Cart persistence

### Order Features
- [x] Place orders
- [x] Order tracking
- [x] Status updates
- [x] Delivery timeline
- [x] Seller information
- [x] Delivery person info

### Review Features
- [x] Star ratings
- [x] Write reviews
- [x] View reviews
- [x] Rating statistics
- [x] Verified purchase badges
- [x] Post-delivery reviews

### Support Features
- [x] Create queries
- [x] View query status
- [x] Priority levels
- [x] Resolution tracking

### Retailer Features
- [x] Inventory dashboard
- [x] Stock alerts
- [x] Product management
- [x] Proxy availability

### Delivery Features
- [x] Availability toggle
- [x] View assignments
- [x] Update status
- [x] Navigation
- [x] Earnings tracking

## 🐛 Common Issues & Solutions

### Issue: Reviews not loading
**Solution**: Ensure feedback table exists and has proper RLS policies

### Issue: Cart not persisting
**Solution**: Check if user is authenticated and cart is created

### Issue: Images not loading
**Solution**: Verify Supabase Storage is configured and images are uploaded

### Issue: OTP not received
**Solution**: Check Supabase Auth settings and phone provider configuration

### Issue: Orders not showing
**Solution**: Ensure orders table exists and customer has placed orders

## 📞 Support

For issues or questions:
1. Check `IMPLEMENTATION_SUMMARY.md` for feature details
2. Review database schema in `supabase.txt`
3. Check API routes in `app/api/` folder
4. Verify Supabase configuration

## 🎉 Success Indicators

You've successfully set up the system when:
- ✅ All 4 user roles can register and login
- ✅ Customers can browse, search, and filter products
- ✅ Cart and wishlist functionality works
- ✅ Orders can be placed and tracked
- ✅ Reviews can be written and displayed
- ✅ Support queries can be created
- ✅ Delivery persons can update order status
- ✅ All text is clearly visible
- ✅ Mobile layout works properly

## 🚀 Next Steps

1. Run the SQL migration
2. Create test accounts for each role
3. Test the customer journey end-to-end
4. Verify all dashboards load correctly
5. Test order placement and tracking
6. Test review submission
7. Verify support system works
8. Check mobile responsiveness

Happy testing! 🎊
