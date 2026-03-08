
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://pbxrtqurwdfoplhbzyhd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY'
);

async function findAnna() {
    console.log('🔍 Searching for "Anna" in database...\n');

    // 1. Get all profiles (to filter in memory for 'ilike' behavior if needed, or use OR logic)
    // Supabase JS 'or' syntax: .or('full_name.ilike.%Anna%,tradingview_username.ilike.%Anna%')
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .or('full_name.ilike.%Anna%,tradingview_username.ilike.%Anna%');

    if (profileError) {
        console.error('❌ Error fetching profiles:', profileError.message);
        return;
    }

    // 2. Get all auth users to check emails
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers({
        perPage: 1000
    });

    if (authError) {
        console.error('❌ Error fetching auth users:', authError.message);
        return;
    }

    // Filter auth users for "anna" in email
    const annaAuthUsers = authUsers.filter(u => u.email.toLowerCase().includes('anna'));

    // Combine results
    // We want a unique list of users found either by profile match OR email match
    const foundUsers = new Map();

    // Add profile matches
    profiles.forEach(p => {
        foundUsers.set(p.id, {
            id: p.id,
            name: p.full_name,
            tv_id: p.tradingview_username,
            updated_at: p.updated_at,
            source: 'Profile Match'
        });
    });

    // Add email matches (merge if exists)
    annaAuthUsers.forEach(u => {
        const existing = foundUsers.get(u.id) || {};
        foundUsers.set(u.id, {
            ...existing,
            id: u.id,
            email: u.email,
            source: existing.source ? 'Both' : 'Email Match'
        });
    });

    // Fetch profile data for email-only matches if any
    for (const [id, user] of foundUsers) {
        if (!user.tv_id && !user.name) {
            const { data: p } = await supabase.from('profiles').select('*').eq('id', id).single();
            if (p) {
                user.name = p.full_name;
                user.tv_id = p.tradingview_username;
                user.updated_at = p.updated_at;
            }
        }
    }

    const results = Array.from(foundUsers.values());

    if (results.length === 0) {
        console.log('❌ No users found matching "Anna".');
        return;
    }

    console.log(`✅ Found ${results.length} users:\n`);
    console.table(results.map(u => ({
        'TradingView ID': u.tv_id || '—',
        'Email': u.email || '—', // Email might be missing if only profile matched and mapping failed (unlikely with this logic but possible)
        'Name': u.name || 'N/A',
        'Updated At': u.updated_at ? new Date(u.updated_at).toLocaleString() : 'N/A'
    })));
}

findAnna();
