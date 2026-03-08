
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://pbxrtqurwdfoplhbzyhd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY'
);

async function getTodaysUsers() {
    console.log('🔍 Fetching users updated TODAY (2026-02-16)...\n');

    // Start of day in UTC (or local, depending on DB preference, usually UTC)
    // The user's local time is 2026-02-16T22:41+02:00.
    // Let's filter for anything after 2026-02-16 00:00:00 UTC to be safe/inclusive.
    const startOfDay = '2026-02-16T00:00:00.000Z';

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, tradingview_username, updated_at')
        .gte('updated_at', startOfDay)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('❌ Error fetching profiles:', error.message);
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.log('No users updated today.');
        return;
    }

    // Get all auth users to map emails
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers({
        perPage: 100
    });

    if (authError) {
        console.error('❌ Error fetching auth users:', authError.message);
        return;
    }

    const mappedUsers = profiles.map(profile => {
        const user = authUsers.find(u => u.id === profile.id);
        return {
            'TradingView ID': profile.tradingview_username || '—',
            'Name': profile.full_name || 'N/A',
            'Email': user ? user.email : '❌ Email Not Found',
            'Updated At': new Date(profile.updated_at).toLocaleString()
        };
    });

    console.table(mappedUsers);
}

getTodaysUsers();
