import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const TARGET_EMAIL = 'alonhayu@gmail.com';
const TARGET_WEEK = 'week-5';
const ACCESS_STATE = 'open'; // 'open' or 'locked'

async function grantAccessOverride() {
    console.log(`🔧 APPLYING OVERRIDE FOR: ${TARGET_EMAIL}`);
    console.log(`   Week: ${TARGET_WEEK} -> ${ACCESS_STATE}`);
    console.log('='.repeat(60));

    try {
        // 1. Find User by Email (using our robust pagination method just in case)
        let userId = null;

        // Fast path: try exact match on listUsers first page
        const { data: { users }, error: userError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });
        if (userError) throw userError;

        const user = users.find(u => u.email.toLowerCase() === TARGET_EMAIL.toLowerCase());

        if (user) {
            userId = user.id;
            console.log(`✅ Found User ID: ${userId}`);
        } else {
            // Fallback: search profile directly if auth user listing fails or is paginated out
            console.log('⚠️  User not found in first 100 auth users. Searching Profile...');
            // We can't search profile by email usually? 
            // Actually, the profile table DOES NOT have email usually. 
            // Wait, let's check profile schema from earlier...
            // [id, updated_at, username, full_name, avatar_url, website, ... tradingview_username]
            // No email in profiles.

            // So we MUST paginate auth.users.
            let page = 2;
            while (true) {
                const { data: { users: pUsers }, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
                if (error || !pUsers || pUsers.length === 0) break;
                const found = pUsers.find(u => u.email.toLowerCase() === TARGET_EMAIL.toLowerCase());
                if (found) {
                    userId = found.id;
                    console.log(`✅ Found User ID: ${userId} (on page ${page})`);
                    break;
                }
                page++;
            }
        }

        if (!userId) {
            console.error('❌ User not found!');
            return;
        }

        // 2. Insert Override
        // Table: access_overrides (user_id, week_id, state, created_by, created_at)
        // We'll upsert.

        const { data, error } = await supabase
            .from('access_overrides')
            .upsert({
                user_id: userId,
                week_id: TARGET_WEEK,
                state: ACCESS_STATE,
                created_at: new Date().toISOString()
            }, { onConflict: 'user_id, week_id' })
            .select();

        if (error) {
            console.error('❌ Error inserting override:', error);
        } else {
            console.log('✅ Successfully applied override:');
            console.table(data);
        }

    } catch (error) {
        console.error('❌ Unexpected Error:', error);
    }
}

grantAccessOverride();
