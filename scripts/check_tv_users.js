
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkTVUsers() {
    console.log("Checking for users with TradingView usernames...");

    const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('tradingview_username', 'is', null)
        .neq('tradingview_username', '');

    if (error) {
        console.error('Error counting users:', error);
        return;
    }

    console.log(`Found ${count} users with TradingView usernames.`);
}

checkTVUsers();
