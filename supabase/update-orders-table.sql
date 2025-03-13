
-- This SQL would be executed in your Supabase project
-- Add order_number column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT;
