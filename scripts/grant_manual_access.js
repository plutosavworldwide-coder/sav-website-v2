
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const users = [
    { email: 'sebastiankozieja@gmail.com', name: 'Sebastian Kozieja' },
    { email: 'zohaibghani8@gmail.com', name: 'Zohaib Ghani' }
];

async function grantAccess() {
    console.log(`Granting access to ${users.length} users...`);

    for (const user of users) {
        try {
            console.log(`Processing ${user.email}...`);

            // 1. Create/Get Auth User
            let { data: { user: authUser }, error: createError } = await supabase.auth.admin.createUser({
                email: user.email,
                email_confirm: true,
                user_metadata: { full_name: user.name }
            });

            if (createError) {
                if (createError.message.includes('already has been registered')) {
                    console.log(`  - User exists, fetching ID...`);
                    const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();
                    authUser = existingUsers.find(u => u.email === user.email);
                } else {
                    console.error(`  - Failed to create/fetch auth user: ${createError.message}`);
                    continue;
                }
            }

            if (!authUser) {
                console.error(`  - Failed to resolve user for ${user.email}`);
                continue;
            }

            // 2. Upsert Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authUser.id,
                    full_name: user.name,
                    subscription_status: 'active',
                    updated_at: new Date()
                });

            if (profileError) {
                console.error(`  - Failed to update profile: ${profileError.message}`);
            } else {
                console.log(`  - SUCCESS: Access granted (Status: Active).`);
            }

        } catch (err) {
            console.error(`  - Error: ${err.message}`);
        }
    }
}

grantAccess();
