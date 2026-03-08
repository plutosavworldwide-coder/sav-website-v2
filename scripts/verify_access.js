
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const usersToCheck = [
    'refaelinvest@gmail.com',
    'Habchibessem@gmail.com',
    'rehalramsamujh48@gmail.com'
];

async function verifyUsers() {
    console.log('🔍 VERIFYING SUPABASE ACCESS');
    console.log('='.repeat(60));

    try {
        const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) throw authError;

        for (const email of usersToCheck) {
            console.log(`Checking ${email}...`);

            // 1. Check Auth User
            const authUser = authUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (!authUser) {
                console.log(`  ❌ Auth: User NOT FOUND`);
                continue;
            }
            console.log(`  ✅ Auth: User exists (ID: ${authUser.id})`);

            // 2. Check Profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (profileError) {
                console.log(`  ❌ Profile: Not found or error (${profileError.message})`);
            } else {
                console.log(`  ✅ Profile: Found`);
                console.log(`     - Subscription Status: ${profile.subscription_status}`);
                console.log(`     - Subscription Type:   ${profile.subscription_type}`);
                console.log(`     - Start Date:          ${profile.subscription_start_date}`);
                console.log(`     - End Date:            ${profile.subscription_end_date}`);
            }
            console.log('-'.repeat(30));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

verifyUsers();
