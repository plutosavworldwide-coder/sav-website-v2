
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://pbxrtqurwdfoplhbzyhd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY'
);

const targetEmail = 'annagarbis16@gmail.com';  // Assuming this is the user from the previous context

console.log(`🔧 UPDATING PLAN FOR: ${targetEmail}`);
console.log('='.repeat(60));

async function updatePlan() {
    // 1. Find user ID
    const { data: { users: authUsers }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('❌ Failed to list users:', listError);
        return;
    }

    const authUser = authUsers.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());

    if (!authUser) {
        console.log('❌ User not found in Auth system.');
        return;
    }

    const userId = authUser.id;
    console.log(`  ✅ Found User ID: ${userId}`);

    // 2. Update Profile
    // We set subscription_type to 'indicators' or equivalent based on your schema usage.
    // Based on previous contexts, 'indicators' seems to be a valid plan type or distinction.
    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            subscription_status: 'active',
            subscription_type: 'indicators', // Explicitly setting to 'indicators'
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.log(`  ❌ Failed to update profile: ${error.message}`);
    } else {
        console.log(`  ✅ SUCCESS - Plan updated to 'indicators' for ${targetEmail}`);
        console.log(`  Status: active`);
    }
}

updatePlan();
