
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function debug() {
    console.log("--- DEBUGGING USER CREATION ---");

    // 1. Check if specific users exist (exhaustively)
    console.log("1. Checking for existing users (page size 1000)...");
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (listError) {
        console.error("List Users Error:", listError);
        return;
    }

    const targetEmail = 'y2004d@gmail.com';
    const found = users.find(u => u.email === targetEmail);
    if (found) {
        console.log(`✅ Found target user ${targetEmail}: ${found.id}`);
        console.log("Status:", found.aud, found.confirmed_at ? "Confirmed" : "Unconfirmed");
    } else {
        console.log(`❌ Target user ${targetEmail} NOT found in list of ${users.length} users.`);
    }

    // 2. Attempt creation of a pure test user
    const testEmail = `debug_test_${Date.now()}@example.com`;
    console.log(`\n2. Attempting to create test user: ${testEmail}`);

    // Attempt A: Full Metadata
    console.log("   Attempt A: With Metadata...");
    const { data: dataA, error: errorA } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'TestPassword123!',
        email_confirm: true,
        user_metadata: { full_name: 'Test User' }
    });

    if (errorA) {
        console.error(`   ❌ Failed (With Metadata):`, JSON.stringify(errorA, null, 2));

        // Attempt B: No Metadata (If A failed)
        const testEmailB = `debug_test_nometa_${Date.now()}@example.com`;
        console.log(`\n   Attempt B: No Metadata (${testEmailB})...`);
        const { data: dataB, error: errorB } = await supabase.auth.admin.createUser({
            email: testEmailB,
            password: 'TestPassword123!',
            email_confirm: true
        });

        if (errorB) {
            console.error(`   ❌ Failed (No Metadata):`, JSON.stringify(errorB, null, 2));
        } else {
            console.log(`   ✅ Success (No Metadata)! User ID: ${dataB.user.id}`);
            // Cleanup
            await supabase.auth.admin.deleteUser(dataB.user.id);
        }

    } else {
        console.log(`   ✅ Success (With Metadata)! User ID: ${dataA.user.id}`);
        // Cleanup
        await supabase.auth.admin.deleteUser(dataA.user.id);
    }
}

debug();
