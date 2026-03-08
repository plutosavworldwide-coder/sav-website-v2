-- Admin Access System - Combined Migration
-- Run this in Supabase SQL Editor

-- =====================================================
-- STEP 1: Add subscription tracking fields to profiles
-- =====================================================

-- Add role field (for admin detection)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Add subscription type field
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_type text;

-- Add subscription start date field
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_start_date timestamptz;

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- =====================================================
-- STEP 2: Set admin role for primary admin
-- =====================================================

UPDATE profiles SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'savfxtrading@gmail.com'
);

-- =====================================================
-- STEP 3: Create access_overrides table
-- =====================================================

CREATE TABLE IF NOT EXISTS access_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_id text NOT NULL,
  state text NOT NULL CHECK (state IN ('open', 'locked')),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  
  -- Ensure one override per user per week
  UNIQUE(user_id, week_id)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_access_overrides_user ON access_overrides(user_id);

-- Enable RLS
ALTER TABLE access_overrides ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: RLS Policies for access_overrides
-- =====================================================

-- Policy: Admin can do anything
CREATE POLICY admin_full_access ON access_overrides
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy: Users can read their own overrides
CREATE POLICY user_read_own ON access_overrides
  FOR SELECT
  USING (user_id = auth.uid());

-- =====================================================
-- STEP 5: Update existing users with subscription info
-- =====================================================

-- Set subscription_start_date for all active users who don't have one
UPDATE profiles 
SET subscription_start_date = now()
WHERE subscription_status = 'active' 
AND subscription_start_date IS NULL;

-- Default existing active subscriptions to 'standard' if not set
UPDATE profiles 
SET subscription_type = 'standard'
WHERE subscription_status = 'active' 
AND subscription_type IS NULL;

-- =====================================================
-- DONE! Verify with:
-- SELECT * FROM profiles WHERE role = 'admin';
-- SELECT * FROM access_overrides;
-- =====================================================
