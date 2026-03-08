
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const PLAN_DURATIONS = {
    standard: 30,   // 1 month
    extended: 60,   // 2 months
    lifetime: null  // No expiry
};

const usersToMigrate = [
    // Standard Plan (€80) - type: 'standard'
    { email: 'alonhayu@gmail.com', name: 'Alon Hayu', plan: 'active', type: 'standard' },
    { email: 'bloch.bar@gmail.com', name: 'Bar Bloch', plan: 'active', type: 'standard' },
    { email: 'ybrijlal123@gmail.com', name: 'Yadav Brijlal', plan: 'active', type: 'standard' },

    // Extended Plan (€140) - type: 'extended'
    { email: 'biscuitrios@gmail.com', name: 'SpoonScale', plan: 'active', type: 'extended' },
    { email: 'zohaibghani8@gmail.com', name: 'Zohaib Ghani', plan: 'active', type: 'extended' },

    // Basic Plan (€30) - Mapped to 'standard' (4 weeks access)
    { email: 'xumanikgopotso0@gmail.com', name: 'Xumani mgimeti', plan: 'active', type: 'standard' },
    { email: 'jens@machnitzky.com', name: 'Jens Machnitzky', plan: 'active', type: 'standard' },
    { email: 'jerry.mokua@gmail.com', name: 'Jeremiah mokua', plan: 'active', type: 'standard' },
    { email: 'lukas-heidinger@gmx.de', name: 'Lukas Heidinger', plan: 'active', type: 'standard' }
];

async function migrateUsers() {
    console.log(`Starting migration for ${usersToMigrate.length} users...`);

    for (const user of usersToMigrate) {
        try {
            console.log(`Processing ${user.email}...`);

            // Fetch existing user ID
            let authId = null;

            let { data: { user: createdUser }, error: createError } = await supabase.auth.admin.createUser({
                email: user.email,
                email_confirm: true,
                user_metadata: { full_name: user.name }
            });

            if (createError) {
                if (createError.message.includes('already has been registered') || createError.status === 422) {
                    // User exists, fetch ID
                } else {
                    console.error(`  - Failed to create: ${createError.message}`);
                    continue;
                }
            } else {
                authId = createdUser.id;
            }

            if (!authId) {
                const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
                if (listError) {
                    console.error("  - Failed to list users to find ID.");
                    continue;
                }
                const found = users.find(u => u.email === user.email);
                if (found) {
                    authId = found.id;
                } else {
                    console.error("  - User exists but not found in list?");
                    continue;
                }
            }

            console.log(`  - Auth ID: ${authId}`);

            // Calculate end date
            const startDate = new Date();
            let endDate = null;

            if (user.type !== 'lifetime') {
                const durationDays = PLAN_DURATIONS[user.type] || 30;
                endDate = new Date();
                endDate.setDate(endDate.getDate() + durationDays);
            }

            // Upsert Profile with complete subscription data
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authId,
                    full_name: user.name,
                    role: 'user',
                    subscription_status: 'active',
                    subscription_type: user.type || 'standard',
                    subscription_start_date: startDate.toISOString(),
                    subscription_end_date: endDate ? endDate.toISOString() : null,
                    updated_at: new Date().toISOString()
                });

            if (profileError) {
                console.error(`  - Failed to update profile: ${profileError.message}`);
            } else {
                console.log(`  - SUCCESS: ${user.type} plan, expires: ${endDate ? endDate.toLocaleDateString() : 'Never (Lifetime)'}`);
            }

        } catch (err) {
            console.error(`  - Unexpected error: ${err.message}`);
        }
    }
    console.log("Migration complete.");
}

migrateUsers();
