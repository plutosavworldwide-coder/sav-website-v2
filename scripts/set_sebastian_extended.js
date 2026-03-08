import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

console.log('📦 SETTING SEBASTIAN TO EXTENDED PLAN');
console.log('='.repeat(60));
console.log('');

async function setExtendedPlan() {
    try {
        // Find Sebastian by email
        const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
        const sebastian = authUsers.find(u => u.email === 'sebastiankozieja@gmail.com');

        if (!sebastian) {
            console.log('❌ Sebastian not found');
            return;
        }

        console.log(`Found: ${sebastian.email}`);
        console.log('');

        // Calculate end date (60 days)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 60);

        const { error } = await supabase
            .from('profiles')
            .update({
                subscription_status: 'active',
                subscription_type: 'extended',
                subscription_start_date: startDate.toISOString(),
                subscription_end_date: endDate.toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', sebastian.id);

        if (error) {
            console.log(`❌ Failed: ${error.message}`);
        } else {
            console.log('✅ SUCCESS - Set to Extended Plan');
            console.log(`   Plan: Extended (€140/2 months)`);
            console.log(`   Expires: ${endDate.toLocaleDateString()}`);
        }
        console.log('');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

setExtendedPlan();
