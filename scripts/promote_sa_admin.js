
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function findAndPromote() {
    console.log("Searching for user with TradingView username 'SA' or Name 'SA'...");

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .or('tradingview_username.eq.SA,full_name.eq.SA,full_name.ilike.%Sav%');

    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    console.log(`Found ${profiles.length} profiles.`);

    for (const p of profiles) {
        console.log(`Found user: ${p.full_name} (${p.email}) - TV: ${p.tradingview_username} - Role: ${p.role}`);

        if (p.role !== 'admin') {
            console.log(`Promoting ${p.full_name} to admin...`);
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ role: 'admin' })
                .eq('id', p.id);

            if (updateError) {
                console.error(`Failed to update:`, updateError);
            } else {
                console.log(`SUCCESS: Promoted to admin.`);
            }
        } else {
            console.log(`User is already admin.`);
        }
    }
}

findAndPromote();
