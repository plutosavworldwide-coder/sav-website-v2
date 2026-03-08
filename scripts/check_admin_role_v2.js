
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdmin() {
    // First, let's find the user 'Sav FX'
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, tradingview_username')
        .ilike('full_name', '%Sav%');

    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    console.log('Found profiles:', JSON.stringify(profiles, null, 2));

    // Also check if there are ANY users with tradingview_username
    const { data: tvUsers, error: tvError } = await supabase
        .from('profiles')
        .select('id, full_name, tradingview_username')
        .not('tradingview_username', 'is', null)
        .neq('tradingview_username', '')
        .limit(5);

    if (tvError) {
        console.error('Error fetching TV users:', tvError);
    } else {
        console.log('Sample TV Users:', JSON.stringify(tvUsers, null, 2));
    }
}

checkAdmin();
