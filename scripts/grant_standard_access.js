
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const TARGET_EMAIL = 'rehalramsamujh48@gmail.com';
const DURATION_WEEKS = 2;

async function grantStandardAccess() {
    console.log(`🔍 GRANTING STANDARD ACCESS TO: ${TARGET_EMAIL}`);
    console.log('='.repeat(60));

    try {
        // 1. Find User by Email
        const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
        if (userError) throw userError;

        const user = users.find(u => u.email.toLowerCase() === TARGET_EMAIL.toLowerCase());

        if (!user) {
            console.error(`❌ User ${TARGET_EMAIL} not found!`);
            return;
        }

        console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);

        // 2. Calculate Dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + (DURATION_WEEKS * 7));

        console.log(`📅 Granting access for ${DURATION_WEEKS} weeks:`);
        console.log(`   Start: ${startDate.toISOString()}`);
        console.log(`   End:   ${endDate.toISOString()}`);

        // 3. Update Profile
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                subscription_status: 'active',
                subscription_type: 'standard',
                subscription_start_date: startDate.toISOString(),
                subscription_end_date: endDate.toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (updateError) {
            throw updateError;
        }

        console.log(`✅ Successfully updated profile for ${TARGET_EMAIL}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

grantStandardAccess();
