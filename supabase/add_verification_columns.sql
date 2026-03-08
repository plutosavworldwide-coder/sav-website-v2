-- Add verification columns to profiles table

-- 1. Add verification_status column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'none';

-- 2. Add paypal_verification_info column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS paypal_verification_info jsonb DEFAULT '{}'::jsonb;

-- 3. Update existing users to 'verified' if they are already active
UPDATE public.profiles 
SET verification_status = 'verified' 
WHERE subscription_status = 'active';
