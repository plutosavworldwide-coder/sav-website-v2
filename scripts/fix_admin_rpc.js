
const SUPABASE_ACCESS_TOKEN = 'sbp_6db4905eaab719c79b7475be900a6b0ca8a7d94d';
const PROJECT_REF = 'pbxrtqurwdfoplhbzyhd';

const sql = `
CREATE OR REPLACE FUNCTION get_admin_tv_users()
RETURNS TABLE (
    id uuid,
    full_name text,
    tradingview_username text,
    subscription_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Forbidden: Admin privileges required';
    END IF;

    RETURN QUERY
    SELECT p.id, p.full_name, p.tradingview_username, p.subscription_type
    FROM profiles p
    WHERE p.tradingview_username IS NOT NULL
    AND p.tradingview_username != ''
    ORDER BY p.full_name ASC;
END;
$$;
`;

async function applySQL() {
    console.log('Fixing RPC function (removing created_at reference)...');
    const response = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: sql }),
        }
    );
    console.log('Status:', response.status);
    console.log('Response:', await response.text());
}

applySQL();
