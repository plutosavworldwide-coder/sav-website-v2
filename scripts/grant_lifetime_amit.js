
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const usersToUpgrade = [
    'amitfrenkelz@gmail.com'
];

console.log('🎁 GRANTING LIFETIME ACCESS');
console.log('='.repeat(60));
console.log('');

async function grantLifetimeAccess() {
    try {
        // Get all auth users
        const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            console.log(`❌ Failed to list users: ${authError.message}`);
            return;
        }

        for (const email of usersToUpgrade) {
            console.log(`Processing ${email}...`);

            // Find user by email
            let authUser = authUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
            let userId;

            if (!authUser) {
                console.log(`  User not found in auth system. Creating new user...`);
                // Extract name from email as fallback
                const name = email.split('@')[0];
                const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                    email: email,
                    password: 'TempPassword123!',
                    email_confirm: true,
                    user_metadata: { full_name: name }
                });

                if (createError) {
                    console.log(`  ❌ Failed to create user: ${createError.message}`);
                    continue;
                }

                userId = newUser.user.id;
                console.log(`  ✅ Created new user: ${userId}`);
            } else {
                userId = authUser.id;
                console.log(`  Found existing user: ${userId}`);
            }

            // Update profile
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    subscription_status: 'active',
                    subscription_type: 'lifetime',
                    subscription_start_date: new Date().toISOString(),
                    subscription_end_date: null, // Lifetime has no expiry
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.log(`  ❌ Failed to update profile: ${error.message}`);
            } else {
                console.log(`  ✅ SUCCESS - Granted lifetime access to ${email}`);
            }
            console.log('');
        }

        console.log('='.repeat(60));
        console.log('Done!');
        console.log('');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

grantLifetimeAccess();
