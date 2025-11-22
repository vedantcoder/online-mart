-- Update product_images with Unsplash URLs (Products 51-100)
-- Generated on: 2025-11-22T20:06:54.975Z
-- Total products: 50

DO $$
DECLARE
  prod_id uuid;
  img_count int;
BEGIN

  -- 51. Dove Intense Repair Shampoo 650ml
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-001' OR sku = 'HOME--19' OR sku = 'FASH--39' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1672330427923-c45e47b1e93b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxkb3ZlJTIwc2hhbXBvbyUyMGhhaXJjYXJlfGVufDB8Mnx8fDE3NjM4NDE5ODh8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1672330427923-c45e47b1e93b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxkb3ZlJTIwc2hhbXBvbyUyMGhhaXJjYXJlfGVufDB8Mnx8fDE3NjM4NDE5ODh8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 52. Pantene Pro-V Silky Smooth 650ml
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-002' OR sku = 'HOME--18' OR sku = 'FASH--38' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1587482402273-c987ab6f5dc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxwYW50ZW5lJTIwc2hhbXBvb3xlbnwwfDJ8fHwxNzYzODQxOTg5fDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1587482402273-c987ab6f5dc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxwYW50ZW5lJTIwc2hhbXBvb3xlbnwwfDJ8fHwxNzYzODQxOTg5fDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 53. Head & Shoulders Anti-Dandruff 650ml
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-003' OR sku = 'HOME--17' OR sku = 'FASH--37' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1692605894363-592d3167f2e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxoZWFkJTIwc2hvdWxkZXJzJTIwc2hhbXBvb3xlbnwwfDJ8fHwxNzYzODQxOTg5fDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1692605894363-592d3167f2e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxoZWFkJTIwc2hvdWxkZXJzJTIwc2hhbXBvb3xlbnwwfDJ8fHwxNzYzODQxOTg5fDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 54. Lakme Absolute Matte Lipstick
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-004' OR sku = 'HOME--16' OR sku = 'FASH--36' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1646341743728-091844fe665c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxsYWttZSUyMGxpcHN0aWNrJTIwY29zbWV0aWNzfGVufDB8Mnx8fDE3NjM4NDE5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1646341743728-091844fe665c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxsYWttZSUyMGxpcHN0aWNrJTIwY29zbWV0aWNzfGVufDB8Mnx8fDE3NjM4NDE5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 56. Nivea Soft Light Moisturizer 300ml
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-006' OR sku = 'HOME--14' OR sku = 'FASH--34' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1760860992841-fb5b7b2ec05d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxuaXZlYSUyMG1vaXN0dXJpemVyJTIwY3JlYW18ZW58MHwyfHx8MTc2Mzg0MTk5MXww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1760860992841-fb5b7b2ec05d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxuaXZlYSUyMG1vaXN0dXJpemVyJTIwY3JlYW18ZW58MHwyfHx8MTc2Mzg0MTk5MXww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 57. Vaseline Intensive Care Lotion 400ml
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-007' OR sku = 'HOME--13' OR sku = 'FASH--33' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1759728886965-da7fd4626b48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHx2YXNlbGluZSUyMGxvdGlvbiUyMGJvZHl8ZW58MHwyfHx8MTc2Mzg0MTk5MXww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1759728886965-da7fd4626b48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHx2YXNlbGluZSUyMGxvdGlvbiUyMGJvZHl8ZW58MHwyfHx8MTc2Mzg0MTk5MXww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 58. Ponds Age Miracle Cream 50g
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-008' OR sku = 'HOME--12' OR sku = 'FASH--32' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1582452721681-c56a89a8280a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxwb25kcyUyMGNyZWFtJTIwc2tpbmNhcmV8ZW58MHwyfHx8MTc2Mzg0MTk5Mnww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1582452721681-c56a89a8280a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxwb25kcyUyMGNyZWFtJTIwc2tpbmNhcmV8ZW58MHwyfHx8MTc2Mzg0MTk5Mnww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 59. Himalaya Neem Face Wash 150ml
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-009' OR sku = 'HOME--11' OR sku = 'FASH--31' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1745302874687-8c75c345d5db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxoaW1hbGF5YSUyMGZhY2V3YXNoJTIwbmVlbXxlbnwwfDJ8fHwxNzYzODQxOTkyfDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1745302874687-8c75c345d5db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxoaW1hbGF5YSUyMGZhY2V3YXNoJTIwbmVlbXxlbnwwfDJ8fHwxNzYzODQxOTkyfDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 61. Colgate Total Advanced Health 200g
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-011' OR sku = 'HOME-0-9' OR sku = 'FASH--29' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1763048819607-ea55217cff34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxjb2xnYXRlJTIwdG9vdGhwYXN0ZSUyMGRlbnRhbHxlbnwwfDJ8fHwxNzYzODQxOTk0fDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1763048819607-ea55217cff34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxjb2xnYXRlJTIwdG9vdGhwYXN0ZSUyMGRlbnRhbHxlbnwwfDJ8fHwxNzYzODQxOTk0fDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 63. Oral-B Pro-Health Toothbrush
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-013' OR sku = 'HOME-0-7' OR sku = 'FASH--27' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1602640571916-e72436b8e738?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxvcmFsJTIwYiUyMHRvb3RoYnJ1c2h8ZW58MHwyfHx8MTc2Mzg0MTk5NXww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1602640571916-e72436b8e738?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxvcmFsJTIwYiUyMHRvb3RoYnJ1c2h8ZW58MHwyfHx8MTc2Mzg0MTk5NXww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 66. Dettol Antiseptic Liquid 550ml
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-016' OR sku = 'HOME-0-4' OR sku = 'FASH--24' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1608326389514-d9d2514e1933?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxkZXR0b2wlMjBhbnRpc2VwdGljJTIwZGlzaW5mZWN0YW50fGVufDB8Mnx8fDE3NjM4NDE5OTd8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1608326389514-d9d2514e1933?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxkZXR0b2wlMjBhbnRpc2VwdGljJTIwZGlzaW5mZWN0YW50fGVufDB8Mnx8fDE3NjM4NDE5OTd8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 69. Himalaya Baby Powder 400g
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-019' OR sku = 'HOME-0-1' OR sku = 'FASH--21' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1693378782221-5806262d3ad2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwcG93ZGVyJTIwaGltYWxheWF8ZW58MHwyfHx8MTc2Mzg0MTk5OHww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1693378782221-5806262d3ad2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwcG93ZGVyJTIwaGltYWxheWF8ZW58MHwyfHx8MTc2Mzg0MTk5OHww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 73. Pigeon Favourite Non-Stick Cookware 3pc
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-023' OR sku = 'HOME-003' OR sku = 'FASH--17' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1733980315518-38c2ccfdfa34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxwaWdlb24lMjBjb29rd2FyZSUyMG5vbnN0aWNrfGVufDB8Mnx8fDE3NjM4NDIwMDF8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1733980315518-38c2ccfdfa34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxwaWdlb24lMjBjb29rd2FyZSUyMG5vbnN0aWNrfGVufDB8Mnx8fDE3NjM4NDIwMDF8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 74. Prestige Omega Deluxe Granite Kadai
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-024' OR sku = 'HOME-004' OR sku = 'FASH--16' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1633241394397-927cc4ec0845?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxrYWRhaSUyMGNvb2t3YXJlJTIwcGFufGVufDB8Mnx8fDE3NjM4NDIwMDF8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1633241394397-927cc4ec0845?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxrYWRhaSUyMGNvb2t3YXJlJTIwcGFufGVufDB8Mnx8fDE3NjM4NDIwMDF8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 76. Cello Opalware Dinner Set 27pcs
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-026' OR sku = 'HOME-006' OR sku = 'FASH--14' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1587334207810-4915c4e40c67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxkaW5uZXIlMjBzZXQlMjBwbGF0ZXMlMjBkaW5uZXJ3YXJlfGVufDB8Mnx8fDE3NjM4NDIwMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1587334207810-4915c4e40c67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxkaW5uZXIlMjBzZXQlMjBwbGF0ZXMlMjBkaW5uZXJ3YXJlfGVufDB8Mnx8fDE3NjM4NDIwMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 77. Borosil Mixing Bowl Set 5pcs
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-027' OR sku = 'HOME-007' OR sku = 'FASH--13' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1682639094834-57366ac98862?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxib3Jvc2lsJTIwbWl4aW5nJTIwYm93bHMlMjBnbGFzc3xlbnwwfDJ8fHwxNzYzODQyMDAzfDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1682639094834-57366ac98862?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxib3Jvc2lsJTIwbWl4aW5nJTIwYm93bHMlMjBnbGFzc3xlbnwwfDJ8fHwxNzYzODQyMDAzfDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 80. Bajaj Majesty RX11 Toaster
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-030' OR sku = 'HOME-010' OR sku = 'FASH--10' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1686644823126-7ed947386b77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxiYWphaiUyMHRvYXN0ZXIlMjBhcHBsaWFuY2V8ZW58MHwyfHx8MTc2Mzg0MjAwNHww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1686644823126-7ed947386b77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxiYWphaiUyMHRvYXN0ZXIlMjBhcHBsaWFuY2V8ZW58MHwyfHx8MTc2Mzg0MjAwNHww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 87. Eureka Forbes Vacuum Cleaner
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-037' OR sku = 'HOME-017' OR sku = 'FASH-0-3' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1683029937055-3342dd0be6d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHx2YWN1dW0lMjBjbGVhbmVyJTIwZXVyZWthJTIwZm9yYmVzfGVufDB8Mnx8fDE3NjM4NDIwMDh8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1683029937055-3342dd0be6d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHx2YWN1dW0lMjBjbGVhbmVyJTIwZXVyZWthJTIwZm9yYmVzfGVufDB8Mnx8fDE3NjM4NDIwMDh8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 90. Solimo Bedsheet Queen Size
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-040' OR sku = 'HOME-020' OR sku = 'FASH-000' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1656433795335-b62feb58e2fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxiZWRzaGVldCUyMGJlZCUyMGxpbmVufGVufDB8Mnx8fDE3NjM4NDIwMTB8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1656433795335-b62feb58e2fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxiZWRzaGVldCUyMGJlZCUyMGxpbmVufGVufDB8Mnx8fDE3NjM4NDIwMTB8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 91. Levi's Men's Slim Fit Jeans
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-041' OR sku = 'HOME-021' OR sku = 'FASH-001' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1725386391776-2cbbedb21aa3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxsZXZpcyUyMGplYW5zJTIwZGVuaW18ZW58MHwyfHx8MTc2Mzg0MjAxMHww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1725386391776-2cbbedb21aa3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxsZXZpcyUyMGplYW5zJTIwZGVuaW18ZW58MHwyfHx8MTc2Mzg0MjAxMHww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 92. Allen Solly Men's Formal Shirt
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-042' OR sku = 'HOME-022' OR sku = 'FASH-002' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxmb3JtYWwlMjBzaGlydCUyMG1lbnN8ZW58MHwyfHx8MTc2Mzg0MjAxMXww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxmb3JtYWwlMjBzaGlydCUyMG1lbnN8ZW58MHwyfHx8MTc2Mzg0MjAxMXww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 93. Peter England Blazer
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-043' OR sku = 'HOME-023' OR sku = 'FASH-003' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1748500192796-711d2b9384a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxibGF6ZXIlMjBmb3JtYWwlMjBzdWl0fGVufDB8Mnx8fDE3NjM4NDIwMTF8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1748500192796-711d2b9384a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxibGF6ZXIlMjBmb3JtYWwlMjBzdWl0fGVufDB8Mnx8fDE3NjM4NDIwMTF8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 94. Nike Air Max Running Shoes
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-044' OR sku = 'HOME-024' OR sku = 'FASH-004' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1581327512014-619407b6a116?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxuaWtlJTIwYWlyJTIwbWF4JTIwc2hvZXN8ZW58MHwyfHx8MTc2Mzg0MjAxMnww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1581327512014-619407b6a116?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxuaWtlJTIwYWlyJTIwbWF4JTIwc2hvZXN8ZW58MHwyfHx8MTc2Mzg0MjAxMnww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 95. Adidas Originals Superstar
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-045' OR sku = 'HOME-025' OR sku = 'FASH-005' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1721819269041-e14fc6c95eb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxhZGlkYXMlMjBzdXBlcnN0YXIlMjBzbmVha2Vyc3xlbnwwfDJ8fHwxNzYzODQyMDEyfDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1721819269041-e14fc6c95eb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxhZGlkYXMlMjBzdXBlcnN0YXIlMjBzbmVha2Vyc3xlbnwwfDJ8fHwxNzYzODQyMDEyfDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 97. Fastrack Analog Watch
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-047' OR sku = 'HOME-027' OR sku = 'FASH-007' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1761284976242-d55d1e339805?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxmYXN0cmFjayUyMHdhdGNoJTIwYW5hbG9nfGVufDB8Mnx8fDE3NjM4NDIwMTR8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1761284976242-d55d1e339805?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxmYXN0cmFjayUyMHdhdGNoJTIwYW5hbG9nfGVufDB8Mnx8fDE3NjM4NDIwMTR8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 99. Ray-Ban Aviator Sunglasses
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-049' OR sku = 'HOME-029' OR sku = 'FASH-009' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1581791538302-03537b9c97bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxyYXliYW4lMjBhdmlhdG9yJTIwc3VuZ2xhc3Nlc3xlbnwwfDJ8fHwxNzYzODQyMDE1fDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1581791538302-03537b9c97bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHxyYXliYW4lMjBhdmlhdG9yJTIwc3VuZ2xhc3Nlc3xlbnwwfDJ8fHwxNzYzODQyMDE1fDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 100. Wildcraft Travel Duffle 60L
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-050' OR sku = 'HOME-030' OR sku = 'FASH-010' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1734522986024-d6a3163c15e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHx3aWxkY3JhZnQlMjBkdWZmbGUlMjBiYWclMjB0cmF2ZWx8ZW58MHwyfHx8MTc2Mzg0MjAxNXww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1734522986024-d6a3163c15e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDl8MHwxfHNlYXJjaHwxfHx3aWxkY3JhZnQlMjBkdWZmbGUlMjBiYWclMjB0cmF2ZWx8ZW58MHwyfHx8MTc2Mzg0MjAxNXww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  RAISE NOTICE 'Successfully updated product images 51-100 with Unsplash URLs!';
END $$;
