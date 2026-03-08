
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const TARGET_EMAILS = [
    'amitfrenkel20@gmail.com',
    'Tinofx17@gmail.com'
];

const DURATION_WEEKS = 52; // 1 Year

async function grantStandardAccess() {
    console.log(`🔍 GRANTING STANDARD ACCESS TO USERS`);
    console.log('='.repeat(60));

    try {
        // 1. Find Users by Email
        const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
        if (userError) throw userError;

        for (const email of TARGET_EMAILS) {
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (!user) {
                console.error(`❌ User ${email} not found!`);
                continue;
            }

            console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);

            // 2. Calculate Dates
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + (DURATION_WEEKS * 7));

            // 3. Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    subscription_status: 'active',
                    subscription_type: 'standard',
                    subscription_start_date: startDate.toISOString(),
                    subscription_end_date: endDate.toISOString(),
                    // Also set verification_status to verified so they don't get blocked by the new feature
                    verification_status: 'verified',
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (updateError) {
                // If verification_status column doesn't exist yet, this might fail or just ignore it.
                // To be safe, let's try updating without verification_status first if it fails?
                // Actually, since I haven't added the column yet, it WILL fail if I include it.
                // GOOD CATCH. I should NOT include verification_status yet.
                // Re-running update without it.
                /*
                 Wait, Supabase ignores extra columns usually? Or throws error?
                 It usually throws error for columns that don't exist.
                 */
                console.warn("Attempting update without verification_status column...");
                const { error: retryError } = await supabase
                    .from('profiles')
                    .update({
                        subscription_status: 'active',
                        subscription_type: 'standard',
                        subscription_start_date: startDate.toISOString(),
                        subscription_end_date: endDate.toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', user.id);

                if (retryError) throw retryError;
            } else {
                // If the first one succeeded (unlikely if col doesn't exist), great.
                // Actually the logic above is flawed (can't try/catch the result of the constant assignment).
            }

            // Let's just do the clean update since I haven't added the column yet.
            const { error: finalError } = await supabase
                .from('profiles')
                .update({
                    subscription_status: 'active',
                    subscription_type: 'standard',
                    subscription_start_date: startDate.toISOString(),
                    subscription_end_date: endDate.toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (finalError) throw finalError;

            console.log(`✅ Successfully updated profile for ${email}`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

grantStandardAccess();
