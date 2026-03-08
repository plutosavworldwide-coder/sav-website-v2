import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const TARGET_EMAIL = 'alonhayu@gmail.com';

async function getAllUsers() {
    let allUsers = [];
    let page = 1;
    const perPage = 50; // Fetch 50 at a time

    while (true) {
        const { data: { users }, error } = await supabase.auth.admin.listUsers({
            page: page,
            perPage: perPage
        });

        if (error) throw error;
        if (!users || users.length === 0) break;

        allUsers = allUsers.concat(users);
        if (users.length < perPage) break; // Reached the end
        page++;
    }
    return allUsers;
}

async function checkUserAccess() {
    console.log(`🔍 CHECKING ACCESS FOR: ${TARGET_EMAIL}`);
    console.log('='.repeat(60));

    try {
        // 1. Fetch ALL users
        console.log('⏳ Fetching all users...');
        const users = await getAllUsers();
        console.log(`   Found ${users.length} total users.`);

        // 2. Exact Match
        let user = users.find(u => u.email.toLowerCase() === TARGET_EMAIL.toLowerCase());

        // 3. Fuzzy/Partial Match if not found
        if (!user) {
            console.log('❌ Exact match not found. Searching for partial matches...');
            const matches = users.filter(u => u.email.toLowerCase().includes('alon') || u.email.toLowerCase().includes('hayu'));

            if (matches.length > 0) {
                console.log('⚠️ Potential matches found:');
                matches.forEach(m => console.log(`   - ${m.email} (ID: ${m.id})`));
                // Consider the first match as the target if only one? No, unsafe.
            } else {
                console.log('❌ No partial matches found either.');
            }
            return;
        }

        console.log(`✅ Found Auth User: ${user.email} (ID: ${user.id})`);

        // 4. Fetch Profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('❌ Error fetching profile:', profileError.message);
        } else {
            console.log('\n👤 User Profile:');
            console.table(profile);

            // Check logic manually
            const now = new Date();
            const endDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
            const isActive = profile.subscription_status === 'active';
            const isExpired = endDate && endDate < now && profile.subscription_type !== 'lifetime';
            const type = profile.subscription_type;

            console.log('\n🧠 Analysis:');
            console.log(`   - Status Active? ${isActive ? '✅' : '❌'} (${profile.subscription_status})`);
            console.log(`   - Not Expired? ${!isExpired ? '✅' : '❌'} (End Date: ${endDate ? endDate.toLocaleString() : 'None'})`);
            console.log(`   - Subscription Type: ${profile.subscription_type}`);

            // Re-simulate week 5 logic
            // Assuming standard logic: allAccess = true
            // But wait, accessEngine.js lines 63-69 implement progressive unlock if rules.weeksPerPeriod is set.
            // But lines 20-22 set allAccess: true for standard.
            // Wait, let's re-read accessEngine.js carefully.

            // UNLOCK_RULES:
            // standard: { allAccess: true }
            // getSubscriptionUnlockedWeeks:
            // if (rules.allAccess) return [...WEEKS];

            // So for standard, ALL weeks should be unlocked.
            // Unless accessEngine.js on disk is DIFFERENT from what I think?
            // I read it earlier. 
            // 18:     standard: {
            // 19:         // All weeks unlocked
            // 20:         allAccess: true
            // 21:     },

            // So if they are standard/active/not-expired, they should have Week 5.
        }

        // 5. Fetch Overrides
        const { data: overrides, error: overrideError } = await supabase
            .from('access_overrides')
            .select('*')
            .eq('user_id', user.id);

        if (overrideError) {
            console.error('❌ Error fetching overrides:', overrideError.message);
        } else {
            console.log('\nWm Access Overrides:');
            if (overrides.length === 0) {
                console.log('   (None)');
            } else {
                console.table(overrides);
            }
        }

    } catch (error) {
        console.error('❌ Unexpected Error:', error);
    }
}

checkUserAccess();
