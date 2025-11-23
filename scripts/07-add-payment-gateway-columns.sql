-- Add payment gateway columns to orders table for Razorpay integration
-- Run this migration in your Supabase SQL editor

-- Add payment gateway columns to orders table
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS payment_gateway text,
  ADD COLUMN IF NOT EXISTS payment_gateway_order_id text,
  ADD COLUMN IF NOT EXISTS payment_gateway_payment_id text,
  ADD COLUMN IF NOT EXISTS payment_gateway_signature text;

-- Update payment_method check constraint to include more specific values
ALTER TABLE public.orders 
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE public.orders 
  ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('online', 'cash_on_delivery', 'cod', 'offline', 'razorpay', 'upi'));

-- Update payment_status check constraint to include pending_cod
ALTER TABLE public.orders 
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE public.orders 
  ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status IN ('pending', 'pending_cod', 'completed', 'failed', 'refunded'));

-- Create index on payment gateway fields for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_gateway_order_id 
  ON public.orders(payment_gateway_order_id) 
  WHERE payment_gateway_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_payment_gateway_payment_id 
  ON public.orders(payment_gateway_payment_id) 
  WHERE payment_gateway_payment_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.orders.payment_gateway IS 'Payment gateway used (e.g., razorpay, stripe)';
COMMENT ON COLUMN public.orders.payment_gateway_order_id IS 'Order ID from payment gateway (e.g., Razorpay order_id)';
COMMENT ON COLUMN public.orders.payment_gateway_payment_id IS 'Payment ID from gateway after successful payment';
COMMENT ON COLUMN public.orders.payment_gateway_signature IS 'Signature for payment verification (HMAC)';
