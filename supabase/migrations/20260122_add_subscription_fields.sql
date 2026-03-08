-- Add subscription tracking fields to profiles table
-- Migration: 20260122_add_subscription_fields

-- Add role field (for admin detection)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Add subscription type field
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_type text;

-- Add subscription start date field
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_start_date timestamptz;

-- Set admin role for the primary admin
UPDATE profiles SET role = 'admin' WHERE id = (
  SELECT id FROM auth.users WHERE email = 'savfxtrading@gmail.com'
);

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
