
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://pbxrtqurwdfoplhbzyhd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY'
);

async function getLatestTVUsers() {
    console.log('🔍 Fetching latest TradingView IDs...\n');

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, tradingview_username, updated_at, subscription_status')
        .not('tradingview_username', 'is', null)
        .neq('tradingview_username', '')
        .order('updated_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('❌ Error fetching profiles:', error.message);
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.log('No profiles found with TradingView usernames.');
        return;
    }

    console.log(`Found ${profiles.length} recent users:\n`);
    console.table(profiles.map(p => ({
        'TradingView ID': p.tradingview_username,
        'Name': p.full_name || 'N/A',
        'Status': p.subscription_status || 'N/A',
        'Last Updated': new Date(p.updated_at).toLocaleString()
    })));
}

getLatestTVUsers();
