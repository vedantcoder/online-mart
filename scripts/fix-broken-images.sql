-- Fix broken images
UPDATE product_images
SET image_url = 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500'
FROM products
WHERE product_images.product_id = products.id AND products.sku = 'ELEC-019';

UPDATE product_images
SET image_url = 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500'
FROM products
WHERE product_images.product_id = products.id AND products.sku = 'ELEC-020';

UPDATE product_images
SET image_url = 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500'
FROM products
WHERE product_images.product_id = products.id AND products.sku = 'CLO-016';

UPDATE product_images
SET image_url = 'https://images.unsplash.com/photo-1583847661884-372000146a3f?w=500'
FROM products
WHERE product_images.product_id = products.id AND products.sku = 'HOME-005';

UPDATE product_images
SET image_url = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500'
FROM products
WHERE product_images.product_id = products.id AND products.sku = 'HOME-009';

UPDATE product_images
SET image_url = 'https://images.unsplash.com/photo-1566576912902-4b610d784943?w=500'
FROM products
WHERE product_images.product_id = products.id AND products.sku = 'TOY-006';

UPDATE product_images
SET image_url = 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=500'
FROM products
WHERE product_images.product_id = products.id AND products.sku = 'TOY-003';

UPDATE product_images
SET image_url = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500'
FROM products
WHERE product_images.product_id = products.id AND products.sku = 'TOY-008';

UPDATE product_images
SET image_url = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500'
FROM products
WHERE product_images.product_id = products.id AND products.sku = 'ELEC-010';

UPDATE product_images
SET image_url = 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500'
FROM products
WHERE product_images.product_id = products.id AND products.sku = 'ELEC-012';
