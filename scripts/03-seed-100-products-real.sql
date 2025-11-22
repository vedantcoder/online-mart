-- 03-seed-100-products-real.sql
-- Removes existing products and seeds 100 realistic products with category-appropriate images
-- Each product assigned to either retailer1 or retailer2

DO $$
DECLARE
  retailer1_id uuid := '314e295f-6033-411e-9524-633c0a19c74a';
  retailer2_id uuid := '0190f270-56b9-42e3-94ad-de620ef88497';
  
  cat_electronics uuid;
  cat_grocery uuid;
  cat_personal uuid;
  cat_home uuid;
  cat_fashion uuid;
  
  prod_id uuid;
  owner_id uuid;
  i int := 0;
  base_price numeric;
  qty int;
BEGIN
  ----------------------------------------------------------------------
  -- 1. Clean existing product data
  ----------------------------------------------------------------------
  DELETE FROM public.cart_items;
  DELETE FROM public.wishlists;
  DELETE FROM public.inventory;
  DELETE FROM public.product_images;
  DELETE FROM public.products;

  ----------------------------------------------------------------------
  -- 2. Ensure categories exist
  ----------------------------------------------------------------------
  INSERT INTO public.categories (name, slug, description)
  VALUES
    ('Electronics', 'electronics', 'Phones, laptops, accessories'),
    ('Grocery', 'grocery', 'Daily grocery items'),
    ('Personal Care', 'personal-care', 'Health & beauty products'),
    ('Home & Kitchen', 'home-kitchen', 'Home and kitchen essentials'),
    ('Fashion', 'fashion', 'Clothing and accessories')
  ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO cat_electronics FROM public.categories WHERE slug = 'electronics';
  SELECT id INTO cat_grocery FROM public.categories WHERE slug = 'grocery';
  SELECT id INTO cat_personal FROM public.categories WHERE slug = 'personal-care';
  SELECT id INTO cat_home FROM public.categories WHERE slug = 'home-kitchen';
  SELECT id INTO cat_fashion FROM public.categories WHERE slug = 'fashion';

  ----------------------------------------------------------------------
  -- 3. Insert 100 products
  ----------------------------------------------------------------------
  
  -- ELECTRONICS (25 products)
  INSERT INTO public.products (id, name, description, category_id, sku, base_price, unit, specifications) VALUES
  (gen_random_uuid(), 'Samsung Galaxy S24 Ultra', '200MP camera, Snapdragon 8 Gen 3, 6.8" Dynamic AMOLED', cat_electronics, 'ELEC-001', 129999, 'piece', '{"brand":"Samsung","storage":"256GB","ram":"12GB"}'),
  (gen_random_uuid(), 'Apple iPhone 15 Pro Max', 'A17 Pro chip, Titanium design, 48MP main camera', cat_electronics, 'ELEC-002', 159999, 'piece', '{"brand":"Apple","storage":"256GB","ram":"8GB"}'),
  (gen_random_uuid(), 'OnePlus 12', '4th Gen Hasselblad Camera, 100W SUPERVOOC charging', cat_electronics, 'ELEC-003', 64999, 'piece', '{"brand":"OnePlus","storage":"256GB","ram":"16GB"}'),
  (gen_random_uuid(), 'Google Pixel 8 Pro', 'AI-powered camera, Tensor G3 chip, pure Android', cat_electronics, 'ELEC-004', 106999, 'piece', '{"brand":"Google","storage":"128GB","ram":"12GB"}'),
  (gen_random_uuid(), 'Xiaomi 14 Pro', 'Leica optics, Snapdragon 8 Gen 3, 120W HyperCharge', cat_electronics, 'ELEC-005', 79999, 'piece', '{"brand":"Xiaomi","storage":"512GB","ram":"12GB"}'),
  (gen_random_uuid(), 'MacBook Pro 14" M3', 'M3 Pro chip, 18GB RAM, Liquid Retina XDR display', cat_electronics, 'ELEC-006', 199900, 'piece', '{"brand":"Apple","storage":"512GB","ram":"18GB"}'),
  (gen_random_uuid(), 'Dell XPS 15', '13th Gen Intel i7, NVIDIA RTX 4050, 4K OLED', cat_electronics, 'ELEC-007', 169999, 'piece', '{"brand":"Dell","storage":"1TB","ram":"32GB"}'),
  (gen_random_uuid(), 'ASUS ROG Strix G16', 'Gaming laptop, RTX 4070, 240Hz display', cat_electronics, 'ELEC-008', 149999, 'piece', '{"brand":"ASUS","storage":"1TB","ram":"16GB"}'),
  (gen_random_uuid(), 'HP Pavilion Plus 14', 'Intel Core i5 13th Gen, 2.8K OLED display', cat_electronics, 'ELEC-009', 84999, 'piece', '{"brand":"HP","storage":"512GB","ram":"16GB"}'),
  (gen_random_uuid(), 'Lenovo ThinkPad X1 Carbon', 'Business ultrabook, Intel i7, carbon fiber', cat_electronics, 'ELEC-010', 139999, 'piece', '{"brand":"Lenovo","storage":"1TB","ram":"32GB"}'),
  (gen_random_uuid(), 'iPad Pro 12.9" M2', 'M2 chip, Liquid Retina XDR display, Apple Pencil support', cat_electronics, 'ELEC-011', 112900, 'piece', '{"brand":"Apple","storage":"256GB","ram":"8GB"}'),
  (gen_random_uuid(), 'Samsung Galaxy Tab S9', 'Dynamic AMOLED 2X, S Pen included, IP68', cat_electronics, 'ELEC-012', 76999, 'piece', '{"brand":"Samsung","storage":"256GB","ram":"12GB"}'),
  (gen_random_uuid(), 'Sony WH-1000XM5', 'Industry-leading noise cancelling, 30hr battery', cat_electronics, 'ELEC-013', 29990, 'piece', '{"brand":"Sony","type":"Over-ear","connectivity":"Bluetooth 5.2"}'),
  (gen_random_uuid(), 'AirPods Pro 2nd Gen', 'Active Noise Cancellation, Adaptive Audio, USB-C', cat_electronics, 'ELEC-014', 26900, 'piece', '{"brand":"Apple","type":"In-ear","connectivity":"Bluetooth 5.3"}'),
  (gen_random_uuid(), 'Bose QuietComfort 45', 'Wireless noise cancelling, 24hr battery life', cat_electronics, 'ELEC-015', 32900, 'piece', '{"brand":"Bose","type":"Over-ear","connectivity":"Bluetooth"}'),
  (gen_random_uuid(), 'Apple Watch Series 9', 'Always-On Retina display, S9 chip, Double Tap gesture', cat_electronics, 'ELEC-016', 41900, 'piece', '{"brand":"Apple","size":"45mm","connectivity":"GPS + Cellular"}'),
  (gen_random_uuid(), 'Samsung Galaxy Watch 6', 'Sapphire Crystal, Advanced Sleep Tracking, Wear OS', cat_electronics, 'ELEC-017', 32999, 'piece', '{"brand":"Samsung","size":"44mm","connectivity":"Bluetooth"}'),
  (gen_random_uuid(), 'Canon EOS R6 Mark II', 'Full-frame mirrorless, 24.2MP, 40fps continuous', cat_electronics, 'ELEC-018', 239995, 'piece', '{"brand":"Canon","type":"Mirrorless","sensor":"Full Frame"}'),
  (gen_random_uuid(), 'Sony A7 IV', '33MP full-frame, 10fps, 4K 60p video', cat_electronics, 'ELEC-019', 239990, 'piece', '{"brand":"Sony","type":"Mirrorless","sensor":"Full Frame"}'),
  (gen_random_uuid(), 'GoPro Hero 12 Black', '5.3K60 video, HyperSmooth 6.0, waterproof', cat_electronics, 'ELEC-020', 44990, 'piece', '{"brand":"GoPro","type":"Action Camera","resolution":"5.3K"}'),
  (gen_random_uuid(), 'LG 55" C3 OLED TV', '4K OLED evo, α9 AI Processor, 120Hz', cat_electronics, 'ELEC-021', 139990, 'piece', '{"brand":"LG","size":"55 inch","panel":"OLED"}'),
  (gen_random_uuid(), 'Samsung 65" Neo QLED', 'Quantum Matrix Technology, 144Hz, Dolby Atmos', cat_electronics, 'ELEC-022', 169990, 'piece', '{"brand":"Samsung","size":"65 inch","panel":"Neo QLED"}'),
  (gen_random_uuid(), 'Sony PS5 Slim', 'Ultra-high speed SSD, ray tracing, 4K gaming', cat_electronics, 'ELEC-023', 54990, 'piece', '{"brand":"Sony","storage":"1TB","type":"Console"}'),
  (gen_random_uuid(), 'Xbox Series X', '12 teraflops, 4K gaming, 1TB SSD', cat_electronics, 'ELEC-024', 52990, 'piece', '{"brand":"Microsoft","storage":"1TB","type":"Console"}'),
  (gen_random_uuid(), 'Nintendo Switch OLED', '7" OLED screen, enhanced audio, 64GB storage', cat_electronics, 'ELEC-025', 34990, 'piece', '{"brand":"Nintendo","storage":"64GB","type":"Console"}');

  -- GROCERY (25 products)
  INSERT INTO public.products (id, name, description, category_id, sku, base_price, unit, specifications) VALUES
  (gen_random_uuid(), 'Aashirvaad Atta 10kg', 'Premium whole wheat flour, 100% MP Sharbati wheat', cat_grocery, 'GROC-001', 549, 'bag', '{"brand":"Aashirvaad","weight":"10kg"}'),
  (gen_random_uuid(), 'Fortune Sunlite Oil 5L', 'Refined sunflower oil, heart healthy', cat_grocery, 'GROC-002', 775, 'bottle', '{"brand":"Fortune","volume":"5L","type":"Sunflower"}'),
  (gen_random_uuid(), 'Tata Salt Iodized 1kg', 'Vacuum evaporated iodized salt, free-flowing', cat_grocery, 'GROC-003', 28, 'pack', '{"brand":"Tata","weight":"1kg"}'),
  (gen_random_uuid(), 'India Gate Basmati Rice 5kg', 'Premium aged basmati, long grain', cat_grocery, 'GROC-004', 599, 'bag', '{"brand":"India Gate","weight":"5kg","type":"Basmati"}'),
  (gen_random_uuid(), 'Maggi 2-Minute Noodles 12-Pack', 'Masala flavored instant noodles', cat_grocery, 'GROC-005', 144, 'pack', '{"brand":"Maggi","quantity":"12x70g"}'),
  (gen_random_uuid(), 'Amul Gold Milk 1L', 'Full cream homogenized toned milk', cat_grocery, 'GROC-006', 62, 'pack', '{"brand":"Amul","volume":"1L","fat":"6%"}'),
  (gen_random_uuid(), 'Britannia Good Day Butter 600g', 'Butter cookies family pack', cat_grocery, 'GROC-007', 120, 'pack', '{"brand":"Britannia","weight":"600g"}'),
  (gen_random_uuid(), 'Parle-G Biscuits 1kg', 'Gluco biscuits, energy packed', cat_grocery, 'GROC-008', 95, 'pack', '{"brand":"Parle","weight":"1kg"}'),
  (gen_random_uuid(), 'Cadbury Dairy Milk 120g', 'Milk chocolate bar, creamy and delicious', cat_grocery, 'GROC-009', 120, 'bar', '{"brand":"Cadbury","weight":"120g","type":"Milk Chocolate"}'),
  (gen_random_uuid(), 'Nescafe Classic Coffee 200g', 'Premium instant coffee, rich aroma', cat_grocery, 'GROC-010', 599, 'jar', '{"brand":"Nescafe","weight":"200g"}'),
  (gen_random_uuid(), 'Taj Mahal Tea 1kg', 'Premium black tea, rich flavor', cat_grocery, 'GROC-011', 585, 'pack', '{"brand":"Taj Mahal","weight":"1kg"}'),
  (gen_random_uuid(), 'Red Label Natural Care Tea 1kg', 'Natural care blend with 5 Ayurvedic ingredients', cat_grocery, 'GROC-012', 520, 'pack', '{"brand":"Red Label","weight":"1kg"}'),
  (gen_random_uuid(), 'Kissan Fresh Tomato Ketchup 1kg', 'Made from fresh red tomatoes', cat_grocery, 'GROC-013', 199, 'bottle', '{"brand":"Kissan","weight":"1kg"}'),
  (gen_random_uuid(), 'Everest Garam Masala 100g', 'Blend of aromatic spices', cat_grocery, 'GROC-014', 89, 'pack', '{"brand":"Everest","weight":"100g"}'),
  (gen_random_uuid(), 'MDH Chana Masala 100g', 'Authentic Indian spice mix', cat_grocery, 'GROC-015', 75, 'pack', '{"brand":"MDH","weight":"100g"}'),
  (gen_random_uuid(), 'Catch Sprinklers Chat Masala 100g', 'Tangy spice blend for snacks', cat_grocery, 'GROC-016', 60, 'pack', '{"brand":"Catch","weight":"100g"}'),
  (gen_random_uuid(), 'Haldiram Aloo Bhujia 1kg', 'Crispy potato noodle snack', cat_grocery, 'GROC-017', 285, 'pack', '{"brand":"Haldiram","weight":"1kg"}'),
  (gen_random_uuid(), 'Kurkure Masala Munch 90g', 'Crunchy corn puffs with masala flavor', cat_grocery, 'GROC-018', 40, 'pack', '{"brand":"Kurkure","weight":"90g"}'),
  (gen_random_uuid(), 'Lays Classic Salted 90g', 'Thinly sliced potato chips', cat_grocery, 'GROC-019', 40, 'pack', '{"brand":"Lays","weight":"90g"}'),
  (gen_random_uuid(), 'Bingo Mad Angles 90g', 'Multi-grain snack with tangy spices', cat_grocery, 'GROC-020', 40, 'pack', '{"brand":"Bingo","weight":"90g"}'),
  (gen_random_uuid(), 'Amul Butter 500g', 'Pasteurized butter, utterly butterly delicious', cat_grocery, 'GROC-021', 285, 'pack', '{"brand":"Amul","weight":"500g"}'),
  (gen_random_uuid(), 'Mother Dairy Paneer 200g', 'Fresh cottage cheese', cat_grocery, 'GROC-022', 90, 'pack', '{"brand":"Mother Dairy","weight":"200g"}'),
  (gen_random_uuid(), 'Amul Cheese Slices 400g', 'Processed cheese slices', cat_grocery, 'GROC-023', 199, 'pack', '{"brand":"Amul","weight":"400g"}'),
  (gen_random_uuid(), 'Surf Excel Matic Liquid 2L', 'Front load washing machine liquid detergent', cat_grocery, 'GROC-024', 549, 'bottle', '{"brand":"Surf Excel","volume":"2L"}'),
  (gen_random_uuid(), 'Vim Dishwash Liquid 2L', 'Lemon fragrance, tough on grease', cat_grocery, 'GROC-025', 329, 'bottle', '{"brand":"Vim","volume":"2L"}');

  -- PERSONAL CARE (20 products)
  INSERT INTO public.products (id, name, description, category_id, sku, base_price, unit, specifications) VALUES
  (gen_random_uuid(), 'Dove Intense Repair Shampoo 650ml', 'Nourishing shampoo for damaged hair', cat_personal, 'PERS-001', 449, 'bottle', '{"brand":"Dove","volume":"650ml"}'),
  (gen_random_uuid(), 'Pantene Pro-V Silky Smooth 650ml', 'Shampoo for silky smooth hair', cat_personal, 'PERS-002', 399, 'bottle', '{"brand":"Pantene","volume":"650ml"}'),
  (gen_random_uuid(), 'Head & Shoulders Anti-Dandruff 650ml', 'Clinically proven dandruff protection', cat_personal, 'PERS-003', 499, 'bottle', '{"brand":"Head & Shoulders","volume":"650ml"}'),
  (gen_random_uuid(), 'Lakme Absolute Matte Lipstick', 'Long-lasting matte finish lipstick', cat_personal, 'PERS-004', 650, 'piece', '{"brand":"Lakme","type":"Lipstick","finish":"Matte"}'),
  (gen_random_uuid(), 'Maybelline Fit Me Foundation', 'Natural coverage liquid foundation', cat_personal, 'PERS-005', 575, 'bottle', '{"brand":"Maybelline","volume":"30ml","type":"Foundation"}'),
  (gen_random_uuid(), 'Nivea Soft Light Moisturizer 300ml', 'Non-greasy moisturizing cream', cat_personal, 'PERS-006', 299, 'jar', '{"brand":"Nivea","volume":"300ml"}'),
  (gen_random_uuid(), 'Vaseline Intensive Care Lotion 400ml', 'Deep moisture body lotion', cat_personal, 'PERS-007', 349, 'bottle', '{"brand":"Vaseline","volume":"400ml"}'),
  (gen_random_uuid(), 'Ponds Age Miracle Cream 50g', 'Anti-aging day cream with Retinol-C', cat_personal, 'PERS-008', 599, 'jar', '{"brand":"Ponds","weight":"50g"}'),
  (gen_random_uuid(), 'Himalaya Neem Face Wash 150ml', 'Purifying face wash with neem', cat_personal, 'PERS-009', 175, 'tube', '{"brand":"Himalaya","volume":"150ml"}'),
  (gen_random_uuid(), 'Garnier Skin Naturals Serum 30ml', 'Vitamin C brightening serum', cat_personal, 'PERS-010', 899, 'bottle', '{"brand":"Garnier","volume":"30ml"}'),
  (gen_random_uuid(), 'Colgate Total Advanced Health 200g', 'Whole mouth health toothpaste', cat_personal, 'PERS-011', 179, 'tube', '{"brand":"Colgate","weight":"200g"}'),
  (gen_random_uuid(), 'Sensodyne Sensitivity Care 100g', 'Toothpaste for sensitive teeth', cat_personal, 'PERS-012', 220, 'tube', '{"brand":"Sensodyne","weight":"100g"}'),
  (gen_random_uuid(), 'Oral-B Pro-Health Toothbrush', 'Criss-cross bristles, medium', cat_personal, 'PERS-013', 99, 'piece', '{"brand":"Oral-B","type":"Manual"}'),
  (gen_random_uuid(), 'Gillette Mach3 Razor + 2 Cartridges', 'Triple blade razor system', cat_personal, 'PERS-014', 349, 'pack', '{"brand":"Gillette","blades":"3"}'),
  (gen_random_uuid(), 'Gillette Venus Razor for Women', 'Smooth glide with moisture strips', cat_personal, 'PERS-015', 299, 'piece', '{"brand":"Gillette","type":"Womens"}'),
  (gen_random_uuid(), 'Dettol Antiseptic Liquid 550ml', 'Multi-use disinfectant liquid', cat_personal, 'PERS-016', 189, 'bottle', '{"brand":"Dettol","volume":"550ml"}'),
  (gen_random_uuid(), 'Savlon Antiseptic Cream 100g', 'Antiseptic wound healing cream', cat_personal, 'PERS-017', 99, 'tube', '{"brand":"Savlon","weight":"100g"}'),
  (gen_random_uuid(), 'Johnson Baby Oil 500ml', 'Hypoallergenic baby oil', cat_personal, 'PERS-018', 399, 'bottle', '{"brand":"Johnsons","volume":"500ml"}'),
  (gen_random_uuid(), 'Himalaya Baby Powder 400g', 'Natural baby powder', cat_personal, 'PERS-019', 175, 'bottle', '{"brand":"Himalaya","weight":"400g"}'),
  (gen_random_uuid(), 'Pampers Baby Diapers M 74pcs', 'Soft and comfortable diapers', cat_personal, 'PERS-020', 1299, 'pack', '{"brand":"Pampers","size":"M","quantity":"74"}');

  -- HOME & KITCHEN (20 products)
  INSERT INTO public.products (id, name, description, category_id, sku, base_price, unit, specifications) VALUES
  (gen_random_uuid(), 'Prestige Deluxe Alpha Cooker 5L', 'Stainless steel pressure cooker with alpha base', cat_home, 'HOME-001', 2699, 'piece', '{"brand":"Prestige","capacity":"5L"}'),
  (gen_random_uuid(), 'Hawkins Contura Hard Anodised 5L', 'Hard anodised pressure cooker with lid lock', cat_home, 'HOME-002', 2899, 'piece', '{"brand":"Hawkins","capacity":"5L"}'),
  (gen_random_uuid(), 'Pigeon Favourite Non-Stick Cookware 3pc', 'Induction base non-stick cookware set', cat_home, 'HOME-003', 1599, 'set', '{"brand":"Pigeon","pieces":"3"}'),
  (gen_random_uuid(), 'Prestige Omega Deluxe Granite Kadai', 'Non-stick granite finish kadai 240mm', cat_home, 'HOME-004', 1199, 'piece', '{"brand":"Prestige","size":"240mm"}'),
  (gen_random_uuid(), 'Milton Thermosteel Flask 1L', 'Vacuum insulated hot & cold flask', cat_home, 'HOME-005', 999, 'piece', '{"brand":"Milton","capacity":"1L"}'),
  (gen_random_uuid(), 'Cello Opalware Dinner Set 27pcs', 'Microwave safe dinner set', cat_home, 'HOME-006', 2799, 'set', '{"brand":"Cello","pieces":"27"}'),
  (gen_random_uuid(), 'Borosil Mixing Bowl Set 5pcs', 'Borosilicate glass mixing bowls', cat_home, 'HOME-007', 799, 'set', '{"brand":"Borosil","pieces":"5"}'),
  (gen_random_uuid(), 'Tupperware Storage Container 4pcs', 'Airtight food storage containers', cat_home, 'HOME-008', 899, 'set', '{"brand":"Tupperware","pieces":"4"}'),
  (gen_random_uuid(), 'Philips Daily Collection Kettle 1.5L', 'Stainless steel electric kettle', cat_home, 'HOME-009', 1399, 'piece', '{"brand":"Philips","capacity":"1.5L","power":"1800W"}'),
  (gen_random_uuid(), 'Bajaj Majesty RX11 Toaster', '4-slice pop-up toaster with crumb tray', cat_home, 'HOME-010', 2199, 'piece', '{"brand":"Bajaj","slots":"4"}'),
  (gen_random_uuid(), 'Philips Air Fryer HD9252', '4.1L digital air fryer with rapid air technology', cat_home, 'HOME-011', 9995, 'piece', '{"brand":"Philips","capacity":"4.1L","power":"1400W"}'),
  (gen_random_uuid(), 'Prestige IRIS 750W Mixer Grinder', '3 jars mixer grinder with powerful motor', cat_home, 'HOME-012', 3599, 'piece', '{"brand":"Prestige","power":"750W","jars":"3"}'),
  (gen_random_uuid(), 'Bajaj Rex 500W Mixer Grinder', 'Compact mixer grinder with 3 jars', cat_home, 'HOME-013', 2299, 'piece', '{"brand":"Bajaj","power":"500W","jars":"3"}'),
  (gen_random_uuid(), 'Philips Viva Collection Blender', '600W blender with ProBlend technology', cat_home, 'HOME-014', 3999, 'piece', '{"brand":"Philips","power":"600W"}'),
  (gen_random_uuid(), 'Usha EI 3302 1000W Dry Iron', 'Non-stick coated soleplate iron', cat_home, 'HOME-015', 799, 'piece', '{"brand":"Usha","power":"1000W"}'),
  (gen_random_uuid(), 'Philips GC1905 Steam Iron', '1440W steam iron with spray function', cat_home, 'HOME-016', 1699, 'piece', '{"brand":"Philips","power":"1440W"}'),
  (gen_random_uuid(), 'Eureka Forbes Vacuum Cleaner', 'Multi-cyclonic technology, bagless', cat_home, 'HOME-017', 8990, 'piece', '{"brand":"Eureka Forbes","power":"1400W"}'),
  (gen_random_uuid(), 'Philips LED Bulb 9W Pack of 4', 'Cool daylight LED bulbs, energy efficient', cat_home, 'HOME-018', 399, 'pack', '{"brand":"Philips","power":"9W","quantity":"4"}'),
  (gen_random_uuid(), 'Wipro LED Batten 20W', 'Slim LED tube light, 2000 lumens', cat_home, 'HOME-019', 499, 'piece', '{"brand":"Wipro","power":"20W"}'),
  (gen_random_uuid(), 'Solimo Bedsheet Queen Size', 'Microfiber bedsheet with 2 pillow covers', cat_home, 'HOME-020', 699, 'set', '{"brand":"Amazon Solimo","size":"Queen"}');

  -- FASHION (10 products)
  INSERT INTO public.products (id, name, description, category_id, sku, base_price, unit, specifications) VALUES
  (gen_random_uuid(), 'Levi''s Men''s Slim Fit Jeans', 'Classic 511 slim fit denim jeans', cat_fashion, 'FASH-001', 2799, 'piece', '{"brand":"Levis","fit":"Slim","material":"Denim"}'),
  (gen_random_uuid(), 'Allen Solly Men''s Formal Shirt', 'Regular fit cotton formal shirt', cat_fashion, 'FASH-002', 1499, 'piece', '{"brand":"Allen Solly","fit":"Regular","material":"Cotton"}'),
  (gen_random_uuid(), 'Peter England Blazer', 'Single-breasted formal blazer', cat_fashion, 'FASH-003', 3999, 'piece', '{"brand":"Peter England","type":"Blazer"}'),
  (gen_random_uuid(), 'Nike Air Max Running Shoes', 'Cushioned running shoes with Air Max unit', cat_fashion, 'FASH-004', 8995, 'pair', '{"brand":"Nike","type":"Running","material":"Mesh"}'),
  (gen_random_uuid(), 'Adidas Originals Superstar', 'Classic shell-toe sneakers', cat_fashion, 'FASH-005', 7999, 'pair', '{"brand":"Adidas","type":"Sneakers"}'),
  (gen_random_uuid(), 'Puma Unisex Backpack', 'Casual backpack with laptop compartment', cat_fashion, 'FASH-006', 1299, 'piece', '{"brand":"Puma","capacity":"25L"}'),
  (gen_random_uuid(), 'Fastrack Analog Watch', 'Stainless steel analog watch for men', cat_fashion, 'FASH-007', 1795, 'piece', '{"brand":"Fastrack","type":"Analog"}'),
  (gen_random_uuid(), 'Titan Raga Watch', 'Elegant watch for women with leather strap', cat_fashion, 'FASH-008', 5495, 'piece', '{"brand":"Titan","collection":"Raga"}'),
  (gen_random_uuid(), 'Ray-Ban Aviator Sunglasses', 'Classic metal frame aviator sunglasses', cat_fashion, 'FASH-009', 7990, 'piece', '{"brand":"Ray-Ban","style":"Aviator","lens":"Polarized"}'),
  (gen_random_uuid(), 'Wildcraft Travel Duffle 60L', 'Water-resistant travel duffle bag', cat_fashion, 'FASH-010', 2999, 'piece', '{"brand":"Wildcraft","capacity":"60L"}');

  ----------------------------------------------------------------------
  -- 4. Add product images using Unsplash Source (category-relevant images)
  ----------------------------------------------------------------------
  
  -- Electronics products (1-25): technology, gadget, phone, laptop, camera, etc.
  i := 1;
  FOR prod_id IN (
    SELECT id FROM public.products 
    WHERE category_id = cat_electronics 
    ORDER BY created_at
  ) LOOP
    INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
    VALUES (
      prod_id,
      CASE 
        WHEN i <= 5 THEN 'https://source.unsplash.com/600x600/?smartphone,mobile-phone&sig=' || i::text
        WHEN i <= 10 THEN 'https://source.unsplash.com/600x600/?laptop,computer&sig=' || i::text
        WHEN i <= 12 THEN 'https://source.unsplash.com/600x600/?tablet,ipad&sig=' || i::text
        WHEN i <= 15 THEN 'https://source.unsplash.com/600x600/?headphones,audio&sig=' || i::text
        WHEN i <= 17 THEN 'https://source.unsplash.com/600x600/?smartwatch,wearable&sig=' || i::text
        WHEN i <= 20 THEN 'https://source.unsplash.com/600x600/?camera,photography&sig=' || i::text
        WHEN i <= 22 THEN 'https://source.unsplash.com/600x600/?television,tv&sig=' || i::text
        ELSE 'https://source.unsplash.com/600x600/?gaming,console&sig=' || i::text
      END,
      true,
      0
    );
    i := i + 1;
  END LOOP;

  -- Grocery products (26-50): food, ingredients, snacks
  i := 1;
  FOR prod_id IN (
    SELECT id FROM public.products 
    WHERE category_id = cat_grocery 
    ORDER BY created_at
  ) LOOP
    INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
    VALUES (
      prod_id,
      CASE 
        WHEN i <= 4 THEN 'https://source.unsplash.com/600x600/?wheat,flour,rice&sig=' || i::text
        WHEN i <= 6 THEN 'https://source.unsplash.com/600x600/?milk,dairy&sig=' || i::text
        WHEN i <= 9 THEN 'https://source.unsplash.com/600x600/?cookies,biscuits&sig=' || i::text
        WHEN i <= 12 THEN 'https://source.unsplash.com/600x600/?coffee,tea&sig=' || i::text
        WHEN i <= 16 THEN 'https://source.unsplash.com/600x600/?spices,masala&sig=' || i::text
        WHEN i <= 20 THEN 'https://source.unsplash.com/600x600/?snacks,chips&sig=' || i::text
        ELSE 'https://source.unsplash.com/600x600/?food,grocery&sig=' || i::text
      END,
      true,
      0
    );
    i := i + 1;
  END LOOP;

  -- Personal Care products (51-70): cosmetics, skincare, health
  i := 1;
  FOR prod_id IN (
    SELECT id FROM public.products 
    WHERE category_id = cat_personal 
    ORDER BY created_at
  ) LOOP
    INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
    VALUES (
      prod_id,
      CASE 
        WHEN i <= 3 THEN 'https://source.unsplash.com/600x600/?shampoo,haircare&sig=' || i::text
        WHEN i <= 5 THEN 'https://source.unsplash.com/600x600/?makeup,cosmetics&sig=' || i::text
        WHEN i <= 10 THEN 'https://source.unsplash.com/600x600/?skincare,lotion,cream&sig=' || i::text
        WHEN i <= 13 THEN 'https://source.unsplash.com/600x600/?toothbrush,dental&sig=' || i::text
        WHEN i <= 15 THEN 'https://source.unsplash.com/600x600/?razor,shaving&sig=' || i::text
        ELSE 'https://source.unsplash.com/600x600/?baby-products,care&sig=' || i::text
      END,
      true,
      0
    );
    i := i + 1;
  END LOOP;

  -- Home & Kitchen products (71-90): appliances, cookware, utensils
  i := 1;
  FOR prod_id IN (
    SELECT id FROM public.products 
    WHERE category_id = cat_home 
    ORDER BY created_at
  ) LOOP
    INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
    VALUES (
      prod_id,
      CASE 
        WHEN i <= 4 THEN 'https://source.unsplash.com/600x600/?cookware,utensils&sig=' || i::text
        WHEN i <= 8 THEN 'https://source.unsplash.com/600x600/?kitchen,dinnerware&sig=' || i::text
        WHEN i <= 14 THEN 'https://source.unsplash.com/600x600/?appliances,kitchen-appliance&sig=' || i::text
        WHEN i <= 17 THEN 'https://source.unsplash.com/600x600/?vacuum,cleaning&sig=' || i::text
        ELSE 'https://source.unsplash.com/600x600/?home,decor&sig=' || i::text
      END,
      true,
      0
    );
    i := i + 1;
  END LOOP;

  -- Fashion products (91-100): clothing, shoes, accessories
  i := 1;
  FOR prod_id IN (
    SELECT id FROM public.products 
    WHERE category_id = cat_fashion 
    ORDER BY created_at
  ) LOOP
    INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
    VALUES (
      prod_id,
      CASE 
        WHEN i <= 3 THEN 'https://source.unsplash.com/600x600/?clothing,fashion&sig=' || i::text
        WHEN i <= 5 THEN 'https://source.unsplash.com/600x600/?shoes,sneakers&sig=' || i::text
        WHEN i <= 6 THEN 'https://source.unsplash.com/600x600/?backpack,bag&sig=' || i::text
        WHEN i <= 8 THEN 'https://source.unsplash.com/600x600/?watch,wristwatch&sig=' || i::text
        ELSE 'https://source.unsplash.com/600x600/?sunglasses,accessories&sig=' || i::text
      END,
      true,
      0
    );
    i := i + 1;
  END LOOP;

  ----------------------------------------------------------------------
  -- 5. Create inventory: assign each product to one retailer (alternating)
  ----------------------------------------------------------------------
  
  i := 0;
  FOR prod_id IN (SELECT id FROM public.products ORDER BY created_at) LOOP
    i := i + 1;
    
    -- Alternate between retailer1 and retailer2
    IF (i % 2) = 1 THEN
      owner_id := retailer1_id;
    ELSE
      owner_id := retailer2_id;
    END IF;
    
    -- Get base price
    SELECT COALESCE(p.base_price, 100) INTO base_price 
    FROM public.products p WHERE p.id = prod_id;
    
    -- Random quantity 10-99
    qty := 10 + FLOOR(RANDOM() * 90)::int;
    
    INSERT INTO public.inventory (
      product_id,
      owner_id,
      owner_type,
      quantity,
      price,
      mrp,
      is_available,
      low_stock_threshold
    ) VALUES (
      prod_id,
      owner_id,
      'retailer',
      qty,
      base_price * (1 + (RANDOM() * 0.10 - 0.05)), -- Price varies +/- 5%
      base_price * 1.20,  -- MRP is 20% above base price
      true,
      5 + FLOOR(RANDOM() * 10)::int  -- Low stock threshold 5-14
    );
  END LOOP;

  RAISE NOTICE 'Successfully seeded 100 products with product name images!';
  RAISE NOTICE 'Products assigned alternately to retailer1 (%) and retailer2 (%)', retailer1_id, retailer2_id;
  
END $$;
