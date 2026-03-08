import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

console.log('='.repeat(90));
console.log('SAV FX - USER SUBSCRIPTION PLANS');
console.log('='.repeat(90));
console.log('');

async function listUsers() {
    try {
        // Get all users with their subscription details
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, full_name, subscription_status, subscription_type, subscription_start_date, subscription_end_date, paypal_subscription_id')
            .order('subscription_status', { ascending: false })
            .order('full_name', { ascending: true });

        if (error) {
            console.error('Error:', error.message);
            return;
        }

        // Get auth users to match emails
        const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
        const emailMap = {};
        authUsers.forEach(u => {
            emailMap[u.id] = u.email;
        });

        // Group by subscription status
        const active = profiles.filter(p => p.subscription_status === 'active');
        const inactive = profiles.filter(p => p.subscription_status !== 'active');

        console.log(`📊 TOTAL USERS: ${profiles.length}`);
        console.log('');

        // Active subscriptions
        if (active.length > 0) {
            console.log('✅ ACTIVE SUBSCRIPTIONS ('.concat(active.length, ')'));
            console.log('-'.repeat(90));
            active.forEach((profile, idx) => {
                const email = emailMap[profile.id] || 'No email';
                const endDate = profile.subscription_end_date
                    ? new Date(profile.subscription_end_date).toLocaleDateString()
                    : 'Never (Lifetime)';

                console.log(`${idx + 1}. ${profile.full_name || 'Unnamed User'}`);
                console.log(`   Email: ${email}`);
                console.log(`   Plan: ${profile.subscription_type || 'Not Set'}`);
                console.log(`   Expires: ${endDate}`);
                if (profile.paypal_subscription_id) {
                    console.log(`   PayPal Sub ID: ${profile.paypal_subscription_id}`);
                }
                console.log('');
            });
        }

        // Inactive/Other subscriptions
        if (inactive.length > 0) {
            console.log('⚠️  INACTIVE/OTHER SUBSCRIPTIONS ('.concat(inactive.length, ')'));
            console.log('-'.repeat(90));
            inactive.forEach((profile, idx) => {
                const email = emailMap[profile.id] || 'No email';

                console.log(`${idx + 1}. ${profile.full_name || 'Unnamed User'}`);
                console.log(`   Email: ${email}`);
                console.log(`   Status: ${profile.subscription_status || 'None'}`);
                console.log(`   Plan: ${profile.subscription_type || 'Not Set'}`);
                console.log('');
            });
        }

        // Summary by plan type
        console.log('='.repeat(90));
        console.log('BREAKDOWN BY PLAN TYPE');
        console.log('='.repeat(90));

        const standard = profiles.filter(p => p.subscription_type === 'standard');
        const extended = profiles.filter(p => p.subscription_type === 'extended');
        const lifetime = profiles.filter(p => p.subscription_type === 'lifetime');
        const noType = profiles.filter(p => !p.subscription_type);

        console.log(`Standard Plan (€80/month):  ${standard.length} users`);
        if (standard.length > 0) {
            standard.forEach(p => console.log(`   - ${p.full_name || emailMap[p.id]}`));
        }
        console.log('');

        console.log(`Extended Plan (€140/2mo):   ${extended.length} users`);
        if (extended.length > 0) {
            extended.forEach(p => console.log(`   - ${p.full_name || emailMap[p.id]}`));
        }
        console.log('');

        console.log(`Lifetime Plan (€800):       ${lifetime.length} users`);
        if (lifetime.length > 0) {
            lifetime.forEach(p => console.log(`   - ${p.full_name || emailMap[p.id]}`));
        }
        console.log('');

        console.log(`No Plan Set:                ${noType.length} users`);
        if (noType.length > 0) {
            noType.forEach(p => console.log(`   - ${p.full_name || emailMap[p.id]}`));
        }
        console.log('');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

listUsers();
