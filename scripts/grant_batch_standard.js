
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const usersToGrant = [
    { name: 'narcoleptic.dr', email: 'narcoleptic.dr@gmail.com' },
    { name: '47koren147', email: '47koren147@gmail.com' } // Processed as requested, despite likely typo for 147koren147
];

// Note: y2004d@gmail.com was listed twice. Processed once.

async function grantStandardAccess() {
    console.log(`Starting batch grant for ${usersToGrant.length} users...`);
    console.log('Target Plan: STANDARD (€80/month)');

    // Calculate 1 month from now
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    for (const u of usersToGrant) {
        console.log(`Processing: ${u.email} (${u.name})...`);

        try {
            // 1. Check if user exists in Auth
            let userId;
            const { data: { users }, error: searchError } = await supabase.auth.admin.listUsers();

            // Simple client-side filter since listUsers doesn't support email filtering directly in all versions
            const existingUser = users.find(user => user.email.toLowerCase() === u.email.toLowerCase());

            if (existingUser) {
                console.log(`   - Found existing Auth user: ${existingUser.id}`);
                userId = existingUser.id;
            } else {
                console.log(`   - User not found. Creating new account...`);
                const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                    email: u.email,
                    password: 'TempPassword123!',
                    email_confirm: true, // This is deprecated in some versions but good to keep
                    user_metadata: { full_name: u.name }
                });

                if (createError) {
                    console.error(`   ❌ Failed to create auth user: ${createError.message}`);
                    continue;
                }
                userId = newUser.user.id;
                console.log(`   - Created new Auth user: ${userId}`);
            }

            // 2. Update/Upsert Profile with Subscription
            // Note: Triggers might have created the profile on auth.createUser, but we upsert to be safe and update fields
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    full_name: u.name,
                    subscription_status: 'active',
                    subscription_type: 'standard',
                    subscription_start_date: startDate.toISOString(),
                    subscription_end_date: endDate.toISOString()
                }, { onConflict: 'id' });

            if (profileError) {
                console.error(`   ❌ Failed to update profile: ${profileError.message}`);
            } else {
                console.log(`   ✅ Successfully granted Standard Access.`);
            }

        } catch (err) {
            console.error(`   ❌ Unexpected error: ${err.message}`);
        }
        console.log('---');
    }
    console.log('Batch operation complete.');
}

grantStandardAccess();
