-- Add TradingView username field to profiles table
-- This allows us to track which TradingView account is associated with each subscription

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tradingview_username text;

-- Add index for faster lookups by TradingView username
CREATE INDEX IF NOT EXISTS idx_profiles_tradingview_username 
ON profiles(tradingview_username) 
WHERE tradingview_username IS NOT NULL;
