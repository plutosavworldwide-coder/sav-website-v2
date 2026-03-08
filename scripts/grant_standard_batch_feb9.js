
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const usersToGrant = [
    { email: 'abannes@gmail.com' },
    { email: 'tinofx17@gmail.com' }
];

async function grantStandardAccess() {
    console.log(`Starting batch grant for ${usersToGrant.length} users...`);
    console.log('Target Plan: STANDARD');

    // Calculate 1 month from now for Standard Plan
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    for (const u of usersToGrant) {
        console.log(`Processing: ${u.email}...`);

        try {
            // 1. Check if user exists in Auth
            let userId;
            const { data: { users }, error: searchError } = await supabase.auth.admin.listUsers();

            if (searchError) {
                console.error(`   ❌ Error listing users: ${searchError.message}`);
                continue;
            }

            const existingUser = users.find(user => user.email.toLowerCase() === u.email.toLowerCase());

            if (existingUser) {
                console.log(`   - Found existing Auth user: ${existingUser.id}`);
                userId = existingUser.id;
            } else {
                console.log(`   - User not found. Creating new account...`);
                const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                    email: u.email,
                    password: 'TempPassword123!',
                    email_confirm: true,
                    user_metadata: { full_name: u.email.split('@')[0] }
                });

                if (createError) {
                    console.error(`   ❌ Failed to create auth user: ${createError.message}`);
                    continue;
                }
                userId = newUser.user.id;
                console.log(`   - Created new Auth user: ${userId}`);
            }

            // 2. Update/Upsert Profile with Subscription
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    // email: u.email, // Removing this as it's not in the schema
                    subscription_status: 'active',
                    subscription_type: 'standard', // Changed from lifetime to standard
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
