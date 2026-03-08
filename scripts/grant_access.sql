-- Run this in your Supabase SQL Editor
UPDATE profiles
SET subscription_status = 'active', 
    paypal_subscription_id = 'MANUAL_GRANT_LIFETIME'
WHERE id = 'd8834dca-5407-4fe6-9e3b-5f6fd08f2eb5';

-- Verify the change
SELECT * FROM profiles WHERE id = 'd8834dca-5407-4fe6-9e3b-5f6fd08f2eb5';
