
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://pbxrtqurwdfoplhbzyhd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY'
);

async function revealEmails() {
    console.log('🔍 Revealing Emails for Latest TradingView Users...\n');

    // 1. Fetch recent profiles with TV IDs
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, tradingview_username, updated_at')
        .not('tradingview_username', 'is', null)
        .neq('tradingview_username', '')
        .order('updated_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('❌ Error fetching profiles:', error.message);
        return;
    }

    // 2. Fetch all auth users (to get emails)
    // Note: listUsers defaults to 50 per page, which should cover the recent ones.
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers({
        perPage: 100
    });

    if (authError) {
        console.error('❌ Error fetching auth users:', authError.message);
        return;
    }

    // 3. Map profiles to emails
    const targetIDs = [
        'Vanillahennessey', 'BessemHabchi', 'Shay_Dabi',
        'Amos_Nagar', 'Moshiko8', 'Benny', 'Barak_m', 'Lior_S', 'abannes', 'idangabai554'
    ];

    const mappedUsers = profiles
        .filter(p => targetIDs.includes(p.tradingview_username))
        .map(profile => {
            const user = authUsers.find(u => u.id === profile.id);
            return {
                tradingview_id: profile.tradingview_username,
                email: user ? user.email : '❌ Email Not Found',
                name: profile.full_name,
            };
        });

    console.log(JSON.stringify(mappedUsers, null, 2));
}

revealEmails();
