-- Fix existing delivery persons to be marked as available
-- Run this AFTER running 09-fix-delivery-person-registration.sql

-- Update all existing delivery persons to be available by default
UPDATE public.delivery_persons 
SET is_available = true 
WHERE is_available IS NULL OR is_available = false;

-- Verify the update
SELECT 
  dp.id,
  p.full_name,
  p.email,
  dp.vehicle_type,
  dp.vehicle_number,
  dp.license_number,
  dp.is_available
FROM public.delivery_persons dp
JOIN public.profiles p ON p.id = dp.id
WHERE p.role = 'delivery';
