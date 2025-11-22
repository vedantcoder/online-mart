-- =============================================================================
-- SEED PRODUCTS SCRIPT FOR ONLINE MART
-- This script adds 100 products across 6 categories with images and inventory
-- =============================================================================

DO $$
DECLARE
    cat_electronics UUID;
    cat_clothing UUID;
    cat_home UUID;
    cat_books UUID;
    cat_sports UUID;
    cat_toys UUID;
    retailer_id UUID;
    product_record RECORD;
    product_count INT := 0;
    product_images_map TEXT[][] := ARRAY[
        -- Electronics
        ARRAY['ELEC-001', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500'],
        ARRAY['ELEC-002', 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500'],
        ARRAY['ELEC-003', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500'],
        ARRAY['ELEC-004', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500'],
        ARRAY['ELEC-005', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
        ARRAY['ELEC-006', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500'],
        ARRAY['ELEC-007', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500'],
        ARRAY['ELEC-008', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500'],
        ARRAY['ELEC-009', 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500'],
        ARRAY['ELEC-010', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500'],
        ARRAY['ELEC-011', 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500'],
        ARRAY['ELEC-012', 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500'],
        ARRAY['ELEC-013', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500'],
        ARRAY['ELEC-014', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500'],
        ARRAY['ELEC-015', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500'],
        ARRAY['ELEC-016', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500'],
        ARRAY['ELEC-017', 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500'],
        ARRAY['ELEC-018', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500'],
        ARRAY['ELEC-019', 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500'],
        ARRAY['ELEC-020', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500'],
        -- Clothing
        ARRAY['CLO-001', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
        ARRAY['CLO-002', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
        ARRAY['CLO-003', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'],
        ARRAY['CLO-004', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500'],
        ARRAY['CLO-005', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500'],
        ARRAY['CLO-006', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'],
        ARRAY['CLO-007', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500'],
        ARRAY['CLO-008', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500'],
        ARRAY['CLO-009', 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500'],
        ARRAY['CLO-010', 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=500'],
        ARRAY['CLO-011', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500'],
        ARRAY['CLO-012', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500'],
        ARRAY['CLO-013', 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500'],
        ARRAY['CLO-014', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500'],
        ARRAY['CLO-015', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500'],
        ARRAY['CLO-016', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500'],
        ARRAY['CLO-017', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
        ARRAY['CLO-018', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500'],
        ARRAY['CLO-019', 'https://images.unsplash.com/photo-1564594985645-4427056e22e2?w=500'],
        ARRAY['CLO-020', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500'],
        -- Home & Kitchen
        ARRAY['HOME-001', 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=500'],
        ARRAY['HOME-002', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500'],
        ARRAY['HOME-003', 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=500'],
        ARRAY['HOME-004', 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500'],
        ARRAY['HOME-005', 'https://images.unsplash.com/photo-1583847661884-372000146a3f?w=500'],
        ARRAY['HOME-006', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500'],
        ARRAY['HOME-007', 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=500'],
        ARRAY['HOME-008', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500'],
        ARRAY['HOME-009', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500'],
        ARRAY['HOME-010', 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500'],
        ARRAY['HOME-011', 'https://images.unsplash.com/photo-1600096194534-95cf5ece04cf?w=500'],
        ARRAY['HOME-012', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500'],
        ARRAY['HOME-013', 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500'],
        ARRAY['HOME-014', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500'],
        ARRAY['HOME-015', 'https://images.unsplash.com/photo-1503602642458-232111445657?w=500'],
        ARRAY['HOME-016', 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500'],
        ARRAY['HOME-017', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'],
        ARRAY['HOME-018', 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500'],
        ARRAY['HOME-019', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500'],
        ARRAY['HOME-020', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'],
        -- Books
        ARRAY['BOOK-001', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
        ARRAY['BOOK-002', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500'],
        ARRAY['BOOK-003', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500'],
        ARRAY['BOOK-004', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=500'],
        ARRAY['BOOK-005', 'https://images.unsplash.com/photo-1495640452828-3df6795cf69b?w=500'],
        ARRAY['BOOK-006', 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=500'],
        ARRAY['BOOK-007', 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500'],
        ARRAY['BOOK-008', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500'],
        ARRAY['BOOK-009', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'],
        ARRAY['BOOK-010', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=500'],
        ARRAY['BOOK-011', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500'],
        ARRAY['BOOK-012', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'],
        ARRAY['BOOK-013', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500'],
        ARRAY['BOOK-014', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500'],
        ARRAY['BOOK-015', 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=500'],
        -- Sports
        ARRAY['SPORT-001', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'],
        ARRAY['SPORT-002', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500'],
        ARRAY['SPORT-003', 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500'],
        ARRAY['SPORT-004', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500'],
        ARRAY['SPORT-005', 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500'],
        ARRAY['SPORT-006', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500'],
        ARRAY['SPORT-007', 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=500'],
        ARRAY['SPORT-008', 'https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=500'],
        ARRAY['SPORT-009', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500'],
        ARRAY['SPORT-010', 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500'],
        ARRAY['SPORT-011', 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=500'],
        ARRAY['SPORT-012', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500'],
        ARRAY['SPORT-013', 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=500'],
        ARRAY['SPORT-014', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500'],
        ARRAY['SPORT-015', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
        -- Toys
        ARRAY['TOY-001', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500'],
        ARRAY['TOY-002', 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=500'],
        ARRAY['TOY-003', 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=500'],
        ARRAY['TOY-004', 'https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=500'],
        ARRAY['TOY-005', 'https://images.unsplash.com/photo-1566694271453-390536dd1f0d?w=500'],
        ARRAY['TOY-006', 'https://images.unsplash.com/photo-1566576912902-4b610d784943?w=500'],
        ARRAY['TOY-007', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'],
        ARRAY['TOY-008', 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500'],
        ARRAY['TOY-009', 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=500'],
        ARRAY['TOY-010', 'https://images.unsplash.com/photo-1528699633788-424224dc89b5?w=500']
    ];
    img_map TEXT[];
BEGIN
    -- =============================================================================
    -- STEP 1: INSERT CATEGORIES
    -- =============================================================================
    INSERT INTO categories (name, slug, description, is_active)
    VALUES 
        ('Electronics', 'electronics', 'Electronic devices and accessories', true),
        ('Clothing', 'clothing', 'Fashion and apparel for all', true),
        ('Home & Kitchen', 'home-kitchen', 'Home essentials and kitchen items', true),
        ('Books', 'books', 'Books across all genres', true),
        ('Sports & Fitness', 'sports-fitness', 'Sports equipment and fitness gear', true),
        ('Toys & Games', 'toys-games', 'Toys and games for kids', true)
    ON CONFLICT (slug) DO NOTHING;

    -- Get category IDs
    SELECT id INTO cat_electronics FROM categories WHERE slug = 'electronics';
    SELECT id INTO cat_clothing FROM categories WHERE slug = 'clothing';
    SELECT id INTO cat_home FROM categories WHERE slug = 'home-kitchen';
    SELECT id INTO cat_books FROM categories WHERE slug = 'books';
    SELECT id INTO cat_sports FROM categories WHERE slug = 'sports-fitness';
    SELECT id INTO cat_toys FROM categories WHERE slug = 'toys-games';

    -- =============================================================================
    -- STEP 2: GET EXISTING RETAILER
    -- =============================================================================
    -- Get the first available retailer from existing retailers
    SELECT r.id INTO retailer_id FROM retailers r LIMIT 1;
    
    IF retailer_id IS NULL THEN
        RAISE EXCEPTION 'No retailer found! Please create a retailer account first by signing up at /signup?role=retailer';
    END IF;

    RAISE NOTICE 'Using retailer ID: %', retailer_id;

    -- =============================================================================
    -- STEP 3: INSERT PRODUCTS
    -- =============================================================================
    
    -- ELECTRONICS (20 products)
    INSERT INTO products (name, description, category_id, sku, base_price, unit, is_active) VALUES
    ('Samsung Galaxy S23', 'Latest Samsung flagship smartphone with 256GB storage', cat_electronics, 'ELEC-001', 74999, 'piece', true),
    ('iPhone 14 Pro', 'Apple iPhone 14 Pro with A16 Bionic chip', cat_electronics, 'ELEC-002', 129900, 'piece', true),
    ('Sony WH-1000XM5', 'Premium noise cancelling wireless headphones', cat_electronics, 'ELEC-003', 29990, 'piece', true),
    ('Dell XPS 13', '13.4" FHD+ Intel i7 16GB RAM 512GB SSD', cat_electronics, 'ELEC-004', 119990, 'piece', true),
    ('MacBook Air M2', '13.6" Retina Display 8GB RAM 256GB SSD', cat_electronics, 'ELEC-005', 114900, 'piece', true),
    ('Samsung 55" 4K TV', '4K UHD Smart LED TV with HDR', cat_electronics, 'ELEC-006', 54990, 'piece', true),
    ('Canon EOS 3000D', '18MP DSLR Camera with 18-55mm lens', cat_electronics, 'ELEC-007', 31999, 'piece', true),
    ('JBL Flip 6', 'Portable waterproof Bluetooth speaker', cat_electronics, 'ELEC-008', 11999, 'piece', true),
    ('Apple Watch Series 8', 'GPS 45mm smartwatch with fitness tracking', cat_electronics, 'ELEC-009', 45900, 'piece', true),
    ('Galaxy Buds Pro', 'True wireless earbuds with ANC', cat_electronics, 'ELEC-010', 15990, 'piece', true),
    ('Logitech MX Master 3S', 'Wireless performance mouse', cat_electronics, 'ELEC-011', 9995, 'piece', true),
    ('Kindle Paperwhite', '6.8" display 16GB waterproof e-reader', cat_electronics, 'ELEC-012', 13999, 'piece', true),
    ('GoPro Hero 11', 'Action camera with 5.3K video', cat_electronics, 'ELEC-013', 44999, 'piece', true),
    ('Bose SoundLink', 'Portable Bluetooth 360° speaker', cat_electronics, 'ELEC-014', 19900, 'piece', true),
    ('Asus ROG Gaming', '15.6" FHD 144Hz RTX 3060 16GB', cat_electronics, 'ELEC-015', 94990, 'piece', true),
    ('PlayStation 5', 'Sony PS5 gaming console', cat_electronics, 'ELEC-016', 54990, 'piece', true),
    ('Xbox Series X', 'Microsoft Xbox 1TB console', cat_electronics, 'ELEC-017', 52990, 'piece', true),
    ('Mi Air Purifier 3', 'Smart air purifier with HEPA', cat_electronics, 'ELEC-018', 9999, 'piece', true),
    ('Dyson V11', 'Cordless stick vacuum cleaner', cat_electronics, 'ELEC-019', 54900, 'piece', true),
    ('Ring Doorbell', 'Smart doorbell with HD video', cat_electronics, 'ELEC-020', 8499, 'piece', true);

    -- CLOTHING (20 products)
    INSERT INTO products (name, description, category_id, sku, base_price, unit, is_active) VALUES
    ('Levi''s 511 Jeans', 'Classic slim fit denim jeans', cat_clothing, 'CLO-001', 2999, 'piece', true),
    ('Nike Dri-FIT Tee', 'Breathable sports t-shirt', cat_clothing, 'CLO-002', 1299, 'piece', true),
    ('Adidas Hoodie', 'Cotton blend pullover hoodie', cat_clothing, 'CLO-003', 2499, 'piece', true),
    ('Puma Shorts', 'Lightweight athletic shorts', cat_clothing, 'CLO-004', 999, 'piece', true),
    ('H&M Cotton Shirt', 'Formal full sleeve shirt', cat_clothing, 'CLO-005', 1499, 'piece', true),
    ('Zara Leather Jacket', 'Premium faux leather jacket', cat_clothing, 'CLO-006', 4999, 'piece', true),
    ('Van Heusen Blazer', 'Formal blazer for men', cat_clothing, 'CLO-007', 3999, 'piece', true),
    ('Wrangler Cargo', 'Multi-pocket cargo pants', cat_clothing, 'CLO-008', 1999, 'piece', true),
    ('Allen Solly Polo', 'Classic fit polo t-shirt', cat_clothing, 'CLO-009', 1799, 'piece', true),
    ('Peter England Trouser', 'Formal office wear trousers', cat_clothing, 'CLO-010', 1699, 'piece', true),
    ('Forever 21 Dress', 'Casual summer dress', cat_clothing, 'CLO-011', 1999, 'piece', true),
    ('Gap Jeans Women', 'Mid-rise skinny fit jeans', cat_clothing, 'CLO-012', 2499, 'piece', true),
    ('Vero Moda Top', 'Casual sleeveless top', cat_clothing, 'CLO-013', 1299, 'piece', true),
    ('Only Palazzo', 'Comfortable wide leg pants', cat_clothing, 'CLO-014', 1499, 'piece', true),
    ('Mango Cardigan', 'Knitted long cardigan', cat_clothing, 'CLO-015', 2299, 'piece', true),
    ('M&S Formal Suit', 'Two piece formal suit', cat_clothing, 'CLO-016', 8999, 'piece', true),
    ('Nike Air Max', 'Comfortable running shoes', cat_clothing, 'CLO-017', 5999, 'piece', true),
    ('Adidas Ultraboost', 'Premium boost running shoes', cat_clothing, 'CLO-018', 8999, 'piece', true),
    ('Crocs Classic', 'Comfortable casual clogs', cat_clothing, 'CLO-019', 2499, 'piece', true),
    ('Woodland Boots', 'Leather casual boots', cat_clothing, 'CLO-020', 3999, 'piece', true);

    -- HOME & KITCHEN (20 products)
    INSERT INTO products (name, description, category_id, sku, base_price, unit, is_active) VALUES
    ('Prestige Cooker 5L', 'Stainless steel pressure cooker', cat_home, 'HOME-001', 1999, 'piece', true),
    ('Pigeon Kettle', '1.5L electric kettle auto shut-off', cat_home, 'HOME-002', 899, 'piece', true),
    ('Philips Air Fryer', '4.1L digital air fryer', cat_home, 'HOME-003', 8999, 'piece', true),
    ('Bajaj Mixer', '750W mixer grinder 3 jars', cat_home, 'HOME-004', 2499, 'piece', true),
    ('Milton Casserole Set', 'Set of 3 insulated casseroles', cat_home, 'HOME-005', 1499, 'piece', true),
    ('Cello Bottle Set', '6 plastic water bottles 1L', cat_home, 'HOME-006', 599, 'set', true),
    ('Borosil Dinner Set', '33 pieces opalware set', cat_home, 'HOME-007', 2999, 'set', true),
    ('Bedsheet Double', 'Cotton sheet with 2 covers', cat_home, 'HOME-008', 999, 'set', true),
    ('Solimo Towels', 'Set of 4 cotton bath towels', cat_home, 'HOME-009', 1299, 'set', true),
    ('Door Curtains', 'Set of 2 door curtains', cat_home, 'HOME-010', 799, 'set', true),
    ('Storage Boxes', 'Set of 3 plastic boxes', cat_home, 'HOME-011', 699, 'set', true),
    ('Study Table', 'Wooden table with drawer', cat_home, 'HOME-012', 5999, 'piece', true),
    ('Office Chair', 'Ergonomic chair with arms', cat_home, 'HOME-013', 4999, 'piece', true),
    ('Steel Almirah', 'Almirah with locker', cat_home, 'HOME-014', 8999, 'piece', true),
    ('Plastic Chair', 'Durable plastic chair', cat_home, 'HOME-015', 699, 'piece', true),
    ('Plastic Table', 'Rectangular plastic table', cat_home, 'HOME-016', 1499, 'piece', true),
    ('Havells Fan 16"', 'High speed table fan', cat_home, 'HOME-017', 1799, 'piece', true),
    ('Bajaj Heater', '2000W room heater', cat_home, 'HOME-018', 2499, 'piece', true),
    ('Kent RO Purifier', 'RO+UV+UF 8L purifier', cat_home, 'HOME-019', 14999, 'piece', true),
    ('Usha Ceiling Fan', '1200mm fan with remote', cat_home, 'HOME-020', 2299, 'piece', true);

    -- BOOKS (15 products)
    INSERT INTO products (name, description, category_id, sku, base_price, unit, is_active) VALUES
    ('The Alchemist', 'Paulo Coelho philosophical novel', cat_books, 'BOOK-001', 299, 'piece', true),
    ('Harry Potter Set', 'Complete 7 books collection', cat_books, 'BOOK-002', 3999, 'set', true),
    ('Atomic Habits', 'James Clear habit formation', cat_books, 'BOOK-003', 499, 'piece', true),
    ('Rich Dad Poor Dad', 'Robert Kiyosaki finance classic', cat_books, 'BOOK-004', 399, 'piece', true),
    ('Psychology of Money', 'Morgan Housel wealth insights', cat_books, 'BOOK-005', 349, 'piece', true),
    ('Sapiens', 'Yuval Harari history of humankind', cat_books, 'BOOK-006', 449, 'piece', true),
    ('Educated', 'Tara Westover memoir', cat_books, 'BOOK-007', 399, 'piece', true),
    ('The Subtle Art', 'Mark Manson self-help', cat_books, 'BOOK-008', 349, 'piece', true),
    ('Think and Grow Rich', 'Napoleon Hill success philosophy', cat_books, 'BOOK-009', 299, 'piece', true),
    ('7 Habits', 'Stephen Covey effectiveness', cat_books, 'BOOK-010', 449, 'piece', true),
    ('1984', 'George Orwell dystopian classic', cat_books, 'BOOK-011', 249, 'piece', true),
    ('To Kill Mockingbird', 'Harper Lee American classic', cat_books, 'BOOK-012', 299, 'piece', true),
    ('Great Gatsby', 'F. Scott Fitzgerald jazz age', cat_books, 'BOOK-013', 199, 'piece', true),
    ('Pride and Prejudice', 'Jane Austen romantic fiction', cat_books, 'BOOK-014', 249, 'piece', true),
    ('The Hobbit', 'J.R.R. Tolkien fantasy adventure', cat_books, 'BOOK-015', 399, 'piece', true);

    -- SPORTS & FITNESS (15 products)
    INSERT INTO products (name, description, category_id, sku, base_price, unit, is_active) VALUES
    ('Yoga Mat 6mm', 'Anti-slip exercise mat', cat_sports, 'SPORT-001', 799, 'piece', true),
    ('Dumbbells 10kg', 'Adjustable dumbbell pair', cat_sports, 'SPORT-002', 1999, 'pair', true),
    ('Resistance Bands', 'Set of 5 with handles', cat_sports, 'SPORT-003', 699, 'set', true),
    ('Jump Rope', 'Speed rope for cardio', cat_sports, 'SPORT-004', 299, 'piece', true),
    ('Ab Roller', 'Core training wheel', cat_sports, 'SPORT-005', 499, 'piece', true),
    ('Push-up Bars', 'Push-up stands pair', cat_sports, 'SPORT-006', 399, 'pair', true),
    ('Gym Ball 65cm', 'Anti-burst ball with pump', cat_sports, 'SPORT-007', 899, 'piece', true),
    ('Foam Roller', 'High density recovery roller', cat_sports, 'SPORT-008', 999, 'piece', true),
    ('Badminton Racket', 'Lightweight beginner racket', cat_sports, 'SPORT-009', 799, 'piece', true),
    ('Cricket Bat', 'English willow full size', cat_sports, 'SPORT-010', 2999, 'piece', true),
    ('Football Size 5', 'Professional football', cat_sports, 'SPORT-011', 699, 'piece', true),
    ('Basketball Size 7', 'Rubber basketball', cat_sports, 'SPORT-012', 899, 'piece', true),
    ('Tennis Racket', 'Aluminum racket with cover', cat_sports, 'SPORT-013', 1499, 'piece', true),
    ('Cycling Gloves', 'Padded comfort gloves', cat_sports, 'SPORT-014', 399, 'pair', true),
    ('Gym Bag Large', 'Sports bag shoe compartment', cat_sports, 'SPORT-015', 1299, 'piece', true);

    -- TOYS & GAMES (10 products)
    INSERT INTO products (name, description, category_id, sku, base_price, unit, is_active) VALUES
    ('LEGO Classic', 'Medium brick box 484 pieces', cat_toys, 'TOY-001', 3499, 'piece', true),
    ('Hot Wheels Track', 'Race track with 2 cars', cat_toys, 'TOY-002', 1999, 'set', true),
    ('Barbie Doll House', 'Dream house with furniture', cat_toys, 'TOY-003', 5999, 'piece', true),
    ('Monopoly Board', 'Classic Monopoly game', cat_toys, 'TOY-004', 1499, 'piece', true),
    ('UNO Card Game', 'Family card game', cat_toys, 'TOY-005', 199, 'piece', true),
    ('Rubik''s Cube', 'Original 3x3 puzzle', cat_toys, 'TOY-006', 399, 'piece', true),
    ('RC Racing Car', 'Remote control car rechargeable', cat_toys, 'TOY-007', 1999, 'piece', true),
    ('Nerf Blaster', 'Foam dart blaster 12 darts', cat_toys, 'TOY-008', 1299, 'piece', true),
    ('Play-Doh Set', 'Colorful modeling clay', cat_toys, 'TOY-009', 799, 'set', true),
    ('Chess Board', 'Wooden chess with pieces', cat_toys, 'TOY-010', 899, 'piece', true);

    -- =============================================================================
    -- STEP 4: ADD PRODUCT IMAGES AND INVENTORY
    -- =============================================================================
    
    FOR product_record IN 
        SELECT id, name, base_price, sku 
        FROM products 
        WHERE sku LIKE 'ELEC-%' OR sku LIKE 'CLO-%' OR sku LIKE 'HOME-%' 
           OR sku LIKE 'BOOK-%' OR sku LIKE 'SPORT-%' OR sku LIKE 'TOY-%'
    LOOP
        product_count := product_count + 1;
        
        -- Find matching image URL
        FOREACH img_map SLICE 1 IN ARRAY product_images_map
        LOOP
            IF img_map[1] = product_record.sku THEN
                -- Add primary image with real URL
                INSERT INTO product_images (product_id, image_url, is_primary, display_order)
                VALUES (product_record.id, img_map[2], true, 0);
                EXIT;
            END IF;
        END LOOP;

        -- Add inventory
        IF retailer_id IS NOT NULL THEN
            INSERT INTO inventory (
                product_id, 
                owner_id, 
                owner_type, 
                quantity, 
                price, 
                mrp,
                is_available,
                low_stock_threshold
            )
            VALUES (
                product_record.id,
                retailer_id,
                'retailer',
                FLOOR(RANDOM() * 80 + 20)::INT,  -- 20-100 units
                product_record.base_price,
                product_record.base_price * 1.2,  -- MRP 20% higher
                true,
                10
            );
        END IF;
    END LOOP;

    RAISE NOTICE '✓ Successfully added % products with images and inventory', product_count;
    RAISE NOTICE '✓ Categories: Electronics, Clothing, Home & Kitchen, Books, Sports, Toys';
    RAISE NOTICE '✓ Retailer: %', retailer_id;
    
END $$;
