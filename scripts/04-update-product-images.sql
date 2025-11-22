-- Update product_images with Unsplash URLs
-- Generated on: 2025-11-22T20:02:18.597Z
-- Total products: 100

DO $$
DECLARE
  prod_id uuid;
  img_count int;
BEGIN

  -- 1. Samsung Galaxy S24 Ultra
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-001' OR sku = 'GROC--24' OR sku = 'PERS--49' OR sku = 'HOME--69' OR sku = 'FASH--89' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1590929382053-747686bfab75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxzYW1zdW5nJTIwc21hcnRwaG9uZSUyMGdhbGF4eXxlbnwwfDJ8fHwxNzYzODQxNjkwfDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1590929382053-747686bfab75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxzYW1zdW5nJTIwc21hcnRwaG9uZSUyMGdhbGF4eXxlbnwwfDJ8fHwxNzYzODQxNjkwfDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 2. Apple iPhone 15 Pro Max
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-002' OR sku = 'GROC--23' OR sku = 'PERS--48' OR sku = 'HOME--68' OR sku = 'FASH--88' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1568909039591-91857e3f46d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxpcGhvbmUlMjBhcHBsZSUyMHNtYXJ0cGhvbmV8ZW58MHwyfHx8MTc2Mzg0MTY5MHww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1568909039591-91857e3f46d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxpcGhvbmUlMjBhcHBsZSUyMHNtYXJ0cGhvbmV8ZW58MHwyfHx8MTc2Mzg0MTY5MHww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 3. OnePlus 12
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-003' OR sku = 'GROC--22' OR sku = 'PERS--47' OR sku = 'HOME--67' OR sku = 'FASH--87' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1744692149286-5c8b73250f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxvbmVwbHVzJTIwYW5kcm9pZCUyMHNtYXJ0cGhvbmV8ZW58MHwyfHx8MTc2Mzg0MTY5MXww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1744692149286-5c8b73250f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxvbmVwbHVzJTIwYW5kcm9pZCUyMHNtYXJ0cGhvbmV8ZW58MHwyfHx8MTc2Mzg0MTY5MXww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 4. Google Pixel 8 Pro
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-004' OR sku = 'GROC--21' OR sku = 'PERS--46' OR sku = 'HOME--66' OR sku = 'FASH--86' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1715702732514-4bfd6ae66ac4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxnb29nbGUlMjBwaXhlbCUyMHNtYXJ0cGhvbmV8ZW58MHwyfHx8MTc2Mzg0MTY5MXww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1715702732514-4bfd6ae66ac4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxnb29nbGUlMjBwaXhlbCUyMHNtYXJ0cGhvbmV8ZW58MHwyfHx8MTc2Mzg0MTY5MXww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 5. Xiaomi 14 Pro
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-005' OR sku = 'GROC--20' OR sku = 'PERS--45' OR sku = 'HOME--65' OR sku = 'FASH--85' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1615215271299-608ada121f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHx4aWFvbWklMjBzbWFydHBob25lJTIwbW9iaWxlfGVufDB8Mnx8fDE3NjM4NDE2OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1615215271299-608ada121f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHx4aWFvbWklMjBzbWFydHBob25lJTIwbW9iaWxlfGVufDB8Mnx8fDE3NjM4NDE2OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 6. MacBook Pro 14" M3
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-006' OR sku = 'GROC--19' OR sku = 'PERS--44' OR sku = 'HOME--64' OR sku = 'FASH--84' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1644171703660-81c9da68402b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxtYWNib29rJTIwYXBwbGUlMjBsYXB0b3B8ZW58MHwyfHx8MTc2Mzg0MTY5Mnww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1644171703660-81c9da68402b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxtYWNib29rJTIwYXBwbGUlMjBsYXB0b3B8ZW58MHwyfHx8MTc2Mzg0MTY5Mnww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 7. Dell XPS 15
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-007' OR sku = 'GROC--18' OR sku = 'PERS--43' OR sku = 'HOME--63' OR sku = 'FASH--83' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1720556405438-d67f0f9ecd44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxkZWxsJTIwbGFwdG9wJTIwY29tcHV0ZXJ8ZW58MHwyfHx8MTc2Mzg0MTY5M3ww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1720556405438-d67f0f9ecd44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxkZWxsJTIwbGFwdG9wJTIwY29tcHV0ZXJ8ZW58MHwyfHx8MTc2Mzg0MTY5M3ww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 9. HP Pavilion Plus 14
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-009' OR sku = 'GROC--16' OR sku = 'PERS--41' OR sku = 'HOME--61' OR sku = 'FASH--81' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1729370775808-aab21a6b7039?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxocCUyMGxhcHRvcCUyMGNvbXB1dGVyfGVufDB8Mnx8fDE3NjM4NDE2OTR8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1729370775808-aab21a6b7039?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxocCUyMGxhcHRvcCUyMGNvbXB1dGVyfGVufDB8Mnx8fDE3NjM4NDE2OTR8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 10. Lenovo ThinkPad X1 Carbon
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-010' OR sku = 'GROC--15' OR sku = 'PERS--40' OR sku = 'HOME--60' OR sku = 'FASH--80' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1684384891902-12fe45aa3596?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxsZW5vdm8lMjB0aGlua3BhZCUyMGxhcHRvcHxlbnwwfDJ8fHwxNzYzODQxNjk0fDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1684384891902-12fe45aa3596?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxsZW5vdm8lMjB0aGlua3BhZCUyMGxhcHRvcHxlbnwwfDJ8fHwxNzYzODQxNjk0fDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 11. iPad Pro 12.9" M2
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-011' OR sku = 'GROC--14' OR sku = 'PERS--39' OR sku = 'HOME--59' OR sku = 'FASH--79' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1587037541125-235940489a6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxpcGFkJTIwYXBwbGUlMjB0YWJsZXR8ZW58MHwyfHx8MTc2Mzg0MTY5NXww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1587037541125-235940489a6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxpcGFkJTIwYXBwbGUlMjB0YWJsZXR8ZW58MHwyfHx8MTc2Mzg0MTY5NXww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 12. Samsung Galaxy Tab S9
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-012' OR sku = 'GROC--13' OR sku = 'PERS--38' OR sku = 'HOME--58' OR sku = 'FASH--78' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1665057538466-c2d0e443a242?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxzYW1zdW5nJTIwdGFibGV0JTIwZ2FsYXh5JTIwdGFifGVufDB8Mnx8fDE3NjM4NDE2OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1665057538466-c2d0e443a242?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxzYW1zdW5nJTIwdGFibGV0JTIwZ2FsYXh5JTIwdGFifGVufDB8Mnx8fDE3NjM4NDE2OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 13. Sony WH-1000XM5
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-013' OR sku = 'GROC--12' OR sku = 'PERS--37' OR sku = 'HOME--57' OR sku = 'FASH--77' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1598900863662-da1c3e6dd9d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxzb255JTIwaGVhZHBob25lcyUyMHdpcmVsZXNzfGVufDB8Mnx8fDE3NjM4NDE2OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1598900863662-da1c3e6dd9d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxzb255JTIwaGVhZHBob25lcyUyMHdpcmVsZXNzfGVufDB8Mnx8fDE3NjM4NDE2OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 14. AirPods Pro 2nd Gen
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-014' OR sku = 'GROC--11' OR sku = 'PERS--36' OR sku = 'HOME--56' OR sku = 'FASH--76' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1600375104627-c94c416deefa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxhaXJwb2RzJTIwYXBwbGUlMjBlYXJidWRzfGVufDB8Mnx8fDE3NjM4NDE2OTd8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1600375104627-c94c416deefa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxhaXJwb2RzJTIwYXBwbGUlMjBlYXJidWRzfGVufDB8Mnx8fDE3NjM4NDE2OTd8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 16. Apple Watch Series 9
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-016' OR sku = 'GROC-0-9' OR sku = 'PERS--34' OR sku = 'HOME--54' OR sku = 'FASH--74' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1641457474122-5bce8b622ace?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxhcHBsZSUyMHdhdGNoJTIwc21hcnR3YXRjaHxlbnwwfDJ8fHwxNzYzODQxNjk4fDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1641457474122-5bce8b622ace?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxhcHBsZSUyMHdhdGNoJTIwc21hcnR3YXRjaHxlbnwwfDJ8fHwxNzYzODQxNjk4fDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 17. Samsung Galaxy Watch 6
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-017' OR sku = 'GROC-0-8' OR sku = 'PERS--33' OR sku = 'HOME--53' OR sku = 'FASH--73' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1590929382053-747686bfab75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxzYW1zdW5nJTIwc21hcnR3YXRjaHxlbnwwfDJ8fHwxNzYzODQxNjk4fDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1590929382053-747686bfab75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxzYW1zdW5nJTIwc21hcnR3YXRjaHxlbnwwfDJ8fHwxNzYzODQxNjk4fDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 18. Canon EOS R6 Mark II
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-018' OR sku = 'GROC-0-7' OR sku = 'PERS--32' OR sku = 'HOME--52' OR sku = 'FASH--72' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1720842439235-f1ab16808f0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxjYW5vbiUyMGNhbWVyYSUyMHByb2Zlc3Npb25hbHxlbnwwfDJ8fHwxNzYzODQxNjk5fDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1720842439235-f1ab16808f0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxjYW5vbiUyMGNhbWVyYSUyMHByb2Zlc3Npb25hbHxlbnwwfDJ8fHwxNzYzODQxNjk5fDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 19. Sony A7 IV
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-019' OR sku = 'GROC-0-6' OR sku = 'PERS--31' OR sku = 'HOME--51' OR sku = 'FASH--71' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1637270871981-4b579f127c0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxzb255JTIwY2FtZXJhJTIwbWlycm9ybGVzc3xlbnwwfDJ8fHwxNzYzODQxNzAwfDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1637270871981-4b579f127c0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxzb255JTIwY2FtZXJhJTIwbWlycm9ybGVzc3xlbnwwfDJ8fHwxNzYzODQxNzAwfDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 20. GoPro Hero 12 Black
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-020' OR sku = 'GROC-0-5' OR sku = 'PERS--30' OR sku = 'HOME--50' OR sku = 'FASH--70' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1665632498171-8b5241590c94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxnb3BybyUyMGFjdGlvbiUyMGNhbWVyYXxlbnwwfDJ8fHwxNzYzODQxNzAwfDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1665632498171-8b5241590c94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxnb3BybyUyMGFjdGlvbiUyMGNhbWVyYXxlbnwwfDJ8fHwxNzYzODQxNzAwfDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 23. Sony PS5 Slim
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-023' OR sku = 'GROC-0-2' OR sku = 'PERS--27' OR sku = 'HOME--47' OR sku = 'FASH--67' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1632803227975-b6a5688c9c46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxwbGF5c3RhdGlvbiUyMHBzNSUyMGNvbnNvbGV8ZW58MHwyfHx8MTc2Mzg0MTcwMnww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1632803227975-b6a5688c9c46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxwbGF5c3RhdGlvbiUyMHBzNSUyMGNvbnNvbGV8ZW58MHwyfHx8MTc2Mzg0MTcwMnww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 24. Xbox Series X
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-024' OR sku = 'GROC-0-1' OR sku = 'PERS--26' OR sku = 'HOME--46' OR sku = 'FASH--66' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1603985753826-30c036e8804d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHx4Ym94JTIwY29uc29sZSUyMGdhbWluZ3xlbnwwfDJ8fHwxNzYzODQxNzAyfDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1603985753826-30c036e8804d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHx4Ym94JTIwY29uc29sZSUyMGdhbWluZ3xlbnwwfDJ8fHwxNzYzODQxNzAyfDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 25. Nintendo Switch OLED
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-025' OR sku = 'GROC-000' OR sku = 'PERS--25' OR sku = 'HOME--45' OR sku = 'FASH--65' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1640955045488-9a4bdad646d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxuaW50ZW5kbyUyMHN3aXRjaCUyMGNvbnNvbGV8ZW58MHwyfHx8MTc2Mzg0MTcwM3ww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1640955045488-9a4bdad646d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxuaW50ZW5kbyUyMHN3aXRjaCUyMGNvbnNvbGV8ZW58MHwyfHx8MTc2Mzg0MTcwM3ww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 26. Aashirvaad Atta 10kg
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-026' OR sku = 'GROC-001' OR sku = 'PERS--24' OR sku = 'HOME--44' OR sku = 'FASH--64' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1705239056823-01c35c9f994d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMGZsb3VyJTIwYXR0YXxlbnwwfDJ8fHwxNzYzODQxNzAzfDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1705239056823-01c35c9f994d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMGZsb3VyJTIwYXR0YXxlbnwwfDJ8fHwxNzYzODQxNzAzfDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 28. Tata Salt Iodized 1kg
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-028' OR sku = 'GROC-003' OR sku = 'PERS--22' OR sku = 'HOME--42' OR sku = 'FASH--62' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1730397188704-0e6c9670b1b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxzYWx0JTIwaW9kaXplZHxlbnwwfDJ8fHwxNzYzODQxNzA0fDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1730397188704-0e6c9670b1b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxzYWx0JTIwaW9kaXplZHxlbnwwfDJ8fHwxNzYzODQxNzA0fDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 29. India Gate Basmati Rice 5kg
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-029' OR sku = 'GROC-004' OR sku = 'PERS--21' OR sku = 'HOME--41' OR sku = 'FASH--61' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1694953593181-6ce423500712?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxiYXNtYXRpJTIwcmljZXxlbnwwfDJ8fHwxNzYzODQxNzA1fDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1694953593181-6ce423500712?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxiYXNtYXRpJTIwcmljZXxlbnwwfDJ8fHwxNzYzODQxNzA1fDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 30. Maggi 2-Minute Noodles 12-Pack
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-030' OR sku = 'GROC-005' OR sku = 'PERS--20' OR sku = 'HOME--40' OR sku = 'FASH--60' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1603033172872-c2525115c7b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxtYWdnaSUyMG5vb2RsZXMlMjBpbnN0YW50fGVufDB8Mnx8fDE3NjM4NDE3MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1603033172872-c2525115c7b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxtYWdnaSUyMG5vb2RsZXMlMjBpbnN0YW50fGVufDB8Mnx8fDE3NjM4NDE3MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 31. Amul Gold Milk 1L
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-031' OR sku = 'GROC-006' OR sku = 'PERS--19' OR sku = 'HOME--39' OR sku = 'FASH--59' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1523473827533-2a64d0d36748?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxtaWxrJTIwZGFpcnklMjBhbXVsfGVufDB8Mnx8fDE3NjM4NDE3MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1523473827533-2a64d0d36748?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxtaWxrJTIwZGFpcnklMjBhbXVsfGVufDB8Mnx8fDE3NjM4NDE3MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 32. Britannia Good Day Butter 600g
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-032' OR sku = 'GROC-007' OR sku = 'PERS--18' OR sku = 'HOME--38' OR sku = 'FASH--58' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1600625649542-f668edc636dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxjb29raWVzJTIwYmlzY3VpdHMlMjBidXR0ZXJ8ZW58MHwyfHx8MTc2Mzg0MTcwN3ww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1600625649542-f668edc636dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxjb29raWVzJTIwYmlzY3VpdHMlMjBidXR0ZXJ8ZW58MHwyfHx8MTc2Mzg0MTcwN3ww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 33. Parle-G Biscuits 1kg
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-033' OR sku = 'GROC-008' OR sku = 'PERS--17' OR sku = 'HOME--37' OR sku = 'FASH--57' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1600625649542-f668edc636dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxwYXJsZSUyMGJpc2N1aXRzJTIwZ2x1Y29zZXxlbnwwfDJ8fHwxNzYzODQxNzA3fDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1600625649542-f668edc636dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxwYXJsZSUyMGJpc2N1aXRzJTIwZ2x1Y29zZXxlbnwwfDJ8fHwxNzYzODQxNzA3fDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 34. Cadbury Dairy Milk 120g
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-034' OR sku = 'GROC-009' OR sku = 'PERS--16' OR sku = 'HOME--36' OR sku = 'FASH--56' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1722799944070-b4230c837cee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxjYWRidXJ5JTIwY2hvY29sYXRlJTIwZGFpcnklMjBtaWxrfGVufDB8Mnx8fDE3NjM4NDE3MDh8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1722799944070-b4230c837cee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxjYWRidXJ5JTIwY2hvY29sYXRlJTIwZGFpcnklMjBtaWxrfGVufDB8Mnx8fDE3NjM4NDE3MDh8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 36. Taj Mahal Tea 1kg
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-036' OR sku = 'GROC-011' OR sku = 'PERS--14' OR sku = 'HOME--34' OR sku = 'FASH--54' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1693333653026-abcfdefc8989?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHx0ZWElMjBibGFjayUyMHRhaiUyMG1haGFsfGVufDB8Mnx8fDE3NjM4NDE3MDl8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1693333653026-abcfdefc8989?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHx0ZWElMjBibGFjayUyMHRhaiUyMG1haGFsfGVufDB8Mnx8fDE3NjM4NDE3MDl8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 37. Red Label Natural Care Tea 1kg
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-037' OR sku = 'GROC-012' OR sku = 'PERS--13' OR sku = 'HOME--33' OR sku = 'FASH--53' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1587049479964-c5618ddf1e9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxyZWQlMjBsYWJlbCUyMHRlYXxlbnwwfDJ8fHwxNzYzODQxNzEwfDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1587049479964-c5618ddf1e9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxyZWQlMjBsYWJlbCUyMHRlYXxlbnwwfDJ8fHwxNzYzODQxNzEwfDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 38. Kissan Fresh Tomato Ketchup 1kg
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-038' OR sku = 'GROC-013' OR sku = 'PERS--12' OR sku = 'HOME--32' OR sku = 'FASH--52' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1715554408507-0df6ad6d6b26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxrZXRjaHVwJTIwdG9tYXRvJTIwa2lzc2FufGVufDB8Mnx8fDE3NjM4NDE3MTF8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1715554408507-0df6ad6d6b26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxrZXRjaHVwJTIwdG9tYXRvJTIwa2lzc2FufGVufDB8Mnx8fDE3NjM4NDE3MTF8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 39. Everest Garam Masala 100g
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-039' OR sku = 'GROC-014' OR sku = 'PERS--11' OR sku = 'HOME--31' OR sku = 'FASH--51' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1721934081798-34c4488fdd12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxnYXJhbSUyMG1hc2FsYSUyMHNwaWNlc3xlbnwwfDJ8fHwxNzYzODQxNzEyfDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1721934081798-34c4488fdd12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxnYXJhbSUyMG1hc2FsYSUyMHNwaWNlc3xlbnwwfDJ8fHwxNzYzODQxNzEyfDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 40. MDH Chana Masala 100g
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-040' OR sku = 'GROC-015' OR sku = 'PERS--10' OR sku = 'HOME--30' OR sku = 'FASH--50' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1595265185654-f7b3c41c9a57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxjaGFuYSUyMG1hc2FsYSUyMHNwaWNlcyUyMG1kaHxlbnwwfDJ8fHwxNzYzODQxNzEyfDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1595265185654-f7b3c41c9a57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxjaGFuYSUyMG1hc2FsYSUyMHNwaWNlcyUyMG1kaHxlbnwwfDJ8fHwxNzYzODQxNzEyfDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 41. Catch Sprinklers Chat Masala 100g
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-041' OR sku = 'GROC-016' OR sku = 'PERS-0-9' OR sku = 'HOME--29' OR sku = 'FASH--49' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1728910156510-77488f19b152?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxjaGF0JTIwbWFzYWxhJTIwc3BpY2VzfGVufDB8Mnx8fDE3NjM4NDE3MTN8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1728910156510-77488f19b152?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxjaGF0JTIwbWFzYWxhJTIwc3BpY2VzfGVufDB8Mnx8fDE3NjM4NDE3MTN8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 42. Haldiram Aloo Bhujia 1kg
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-042' OR sku = 'GROC-017' OR sku = 'PERS-0-8' OR sku = 'HOME--28' OR sku = 'FASH--48' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1586357507341-3fbe59f2a5d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxoYWxkaXJhbSUyMGJodWppYSUyMHNuYWNrfGVufDB8Mnx8fDE3NjM4NDE3MTN8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1586357507341-3fbe59f2a5d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxoYWxkaXJhbSUyMGJodWppYSUyMHNuYWNrfGVufDB8Mnx8fDE3NjM4NDE3MTN8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 43. Kurkure Masala Munch 90g
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-043' OR sku = 'GROC-018' OR sku = 'PERS-0-7' OR sku = 'HOME--27' OR sku = 'FASH--47' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1708746333842-b811e0bf6c05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxrdXJrdXJlJTIwc25hY2tzJTIwY2hpcHN8ZW58MHwyfHx8MTc2Mzg0MTcxNHww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1708746333842-b811e0bf6c05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxrdXJrdXJlJTIwc25hY2tzJTIwY2hpcHN8ZW58MHwyfHx8MTc2Mzg0MTcxNHww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 44. Lays Classic Salted 90g
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-044' OR sku = 'GROC-019' OR sku = 'PERS-0-6' OR sku = 'HOME--26' OR sku = 'FASH--46' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1615485290836-4ebcebf44aaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxsYXlzJTIwY2hpcHMlMjBwb3RhdG98ZW58MHwyfHx8MTc2Mzg0MTcxNXww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1615485290836-4ebcebf44aaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxsYXlzJTIwY2hpcHMlMjBwb3RhdG98ZW58MHwyfHx8MTc2Mzg0MTcxNXww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 45. Bingo Mad Angles 90g
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-045' OR sku = 'GROC-020' OR sku = 'PERS-0-5' OR sku = 'HOME--25' OR sku = 'FASH--45' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1548459730-335811610ac0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxiaW5nbyUyMGNoaXBzJTIwc25hY2tzfGVufDB8Mnx8fDE3NjM4NDE3MTV8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1548459730-335811610ac0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxiaW5nbyUyMGNoaXBzJTIwc25hY2tzfGVufDB8Mnx8fDE3NjM4NDE3MTV8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 46. Amul Butter 500g
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-046' OR sku = 'GROC-021' OR sku = 'PERS-0-4' OR sku = 'HOME--24' OR sku = 'FASH--44' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1569696074196-402ff5882e23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxhbXVsJTIwYnV0dGVyJTIwZGFpcnl8ZW58MHwyfHx8MTc2Mzg0MTcxNnww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1569696074196-402ff5882e23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxhbXVsJTIwYnV0dGVyJTIwZGFpcnl8ZW58MHwyfHx8MTc2Mzg0MTcxNnww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 47. Mother Dairy Paneer 200g
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-047' OR sku = 'GROC-022' OR sku = 'PERS-0-3' OR sku = 'HOME--23' OR sku = 'FASH--43' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1733907557463-915a34237e8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxwYW5lZXIlMjBjb3R0YWdlJTIwY2hlZXNlfGVufDB8Mnx8fDE3NjM4NDE3MTd8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1733907557463-915a34237e8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxwYW5lZXIlMjBjb3R0YWdlJTIwY2hlZXNlfGVufDB8Mnx8fDE3NjM4NDE3MTd8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 48. Amul Cheese Slices 400g
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-048' OR sku = 'GROC-023' OR sku = 'PERS-0-2' OR sku = 'HOME--22' OR sku = 'FASH--42' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1668434344247-5daf7c7aff63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxjaGVlc2UlMjBzbGljZXMlMjBhbXVsfGVufDB8Mnx8fDE3NjM4NDE3MTd8MA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1668434344247-5daf7c7aff63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxjaGVlc2UlMjBzbGljZXMlMjBhbXVsfGVufDB8Mnx8fDE3NjM4NDE3MTd8MA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 49. Surf Excel Matic Liquid 2L
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-049' OR sku = 'GROC-024' OR sku = 'PERS-0-1' OR sku = 'HOME--21' OR sku = 'FASH--41' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1495331466114-2913a2d3945b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxkZXRlcmdlbnQlMjBsaXF1aWQlMjBzdXJmJTIwZXhjZWx8ZW58MHwyfHx8MTc2Mzg0MTcxOHww&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1495331466114-2913a2d3945b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxkZXRlcmdlbnQlMjBsaXF1aWQlMjBzdXJmJTIwZXhjZWx8ZW58MHwyfHx8MTc2Mzg0MTcxOHww&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  -- 50. Vim Dishwash Liquid 2L
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-050' OR sku = 'GROC-025' OR sku = 'PERS-000' OR sku = 'HOME--20' OR sku = 'FASH--40' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = 'https://images.unsplash.com/photo-1662926912214-1a1bd0a07227?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxkaXNod2FzaCUyMGxpcXVpZCUyMHZpbXxlbnwwfDJ8fHwxNzYzODQxNzE4fDA&ixlib=rb-4.1.0&q=80&w=1080' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, 'https://images.unsplash.com/photo-1662926912214-1a1bd0a07227?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzQyNDh8MHwxfHNlYXJjaHwxfHxkaXNod2FzaCUyMGxpcXVpZCUyMHZpbXxlbnwwfDJ8fHwxNzYzODQxNzE4fDA&ixlib=rb-4.1.0&q=80&w=1080', true, 0);
    END IF;
  END IF;

  RAISE NOTICE 'Successfully updated product images with Unsplash URLs!';
END $$;
