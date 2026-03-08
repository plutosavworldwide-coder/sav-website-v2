-- Add Indicators Only plan to database
INSERT INTO plans (name, description, price, currency, interval_unit, interval_count, paypal_plan_id, is_active)
VALUES (
    'Indicators Only',
    'Essential market data and proprietary algorithms',
    10,
    'EUR',
    'month',
    1,
    'P-8WE96957F40623801NGAPTLI',
    true
)
ON CONFLICT (paypal_plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    is_active = EXCLUDED.is_active;
