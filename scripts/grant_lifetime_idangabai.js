
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://pbxrtqurwdfoplhbzyhd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY'
);

const targetEmail = 'idangabai554@gmail.com';

console.log(`🎁 GRANTING LIFETIME ACCESS TO: ${targetEmail}`);
console.log('='.repeat(60));

async function grantAccess() {
    try {
        // Get all auth users
        const { data: { users: authUsers }, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) {
            console.error('❌ Failed to list users:', listError);
            return;
        }

        // Find user by email (case-insensitive)
        let authUser = authUsers.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());
        let userId;

        if (!authUser) {
            console.log(`  User not found in auth system. Creating new user...`);
            const name = targetEmail.split('@')[0];
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: targetEmail,
                password: 'TempPassword123!',
                email_confirm: true,
                user_metadata: { full_name: name }
            });

            if (createError) {
                console.log(`  ❌ Failed to create user: ${createError.message}`);
                return;
            }

            userId = newUser.user.id;
            console.log(`  ✅ Created new user: ${userId}`);
        } else {
            userId = authUser.id;
            console.log(`  User found: ${userId}`);
        }

        // Update profile
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                subscription_status: 'active',
                subscription_type: 'lifetime',
                subscription_start_date: new Date().toISOString(),
                subscription_end_date: null,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.log(`  ❌ Failed to update profile: ${error.message}`);
        } else {
            console.log(`  ✅ SUCCESS - Granted lifetime access to ${targetEmail}`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

grantAccess();
