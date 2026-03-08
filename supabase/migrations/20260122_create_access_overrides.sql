-- Create access_overrides table for admin manual controls
-- Migration: 20260122_create_access_overrides

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
