
import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

// PayPal Config (from create_paypal_plans.js)
const PAYPAL_CLIENT_ID = 'ASMtybhnFMdAuSQtlkjj7FiZxfb2muN6jCt6LnNrOpGrg2nu6RxFocHWklqo5zWw2UByrV-3R7a1FA77';
const PAYPAL_SECRET = 'EOCJ1_ZMJyQZlMZwy5bOSFaa1BXrgD9oEI2NDlA2zmxjiA_jRddmCwhvj_KzpI1K1zgtdIPm5SdZv6a0';
const PAYPAL_API = 'https://api-m.paypal.com';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function getPayPalAccessToken() {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    if (!data.access_token) throw new Error(`Failed to get PayPal access token: ${JSON.stringify(data)}`);
    return data.access_token;
}

// Reuse logic from check_paypal_plans.js to fetch recent transactions
async function fetchPayPalTransactions(accessToken) {
    console.log("Fetching PayPal transactions for the last 90 days...");
    const allTransactions = [];
    const endDate = new Date();

    // Fetch last 3 months just to be safe and efficient
    let currentEnd = new Date(endDate);
    for (let i = 0; i < 3; i++) {
        let currentStart = new Date(currentEnd);
        currentStart.setDate(currentEnd.getDate() - 30);

        try {
            const url = `${PAYPAL_API}/v1/reporting/transactions?start_date=${currentStart.toISOString()}&end_date=${currentEnd.toISOString()}&fields=all&page_size=500&transaction_status=S`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const found = data.transaction_details || [];
                allTransactions.push(...found);
            }
        } catch (err) {
            console.error(`  - Error fetching PayPal chunk: ${err.message}`);
        }
        currentEnd = new Date(currentStart);
    }
    return allTransactions;
}

async function fixAnonymousUsers() {
    console.log('🕵️ STARTING ANONYMOUS USER FIX');
    console.log('='.repeat(60));

    try {
        // 1. Get all profiles
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*');

        if (profileError) throw new Error(`Profile fetch error: ${profileError.message}`);
        console.log(`Loaded ${profiles.length} profiles.`);

        // 2. Get all auth users
        const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers({ per_page: 1000 });
        if (authError) throw new Error(`Auth fetch error: ${authError.message}`);
        console.log(`Loaded ${authUsers.length} auth users.`);

        // 3. Get PayPal Data
        let payPalTransactions = [];
        try {
            const payPalToken = await getPayPalAccessToken();
            payPalTransactions = await fetchPayPalTransactions(payPalToken);
            console.log(`Loaded ${payPalTransactions.length} PayPal transactions.`);
        } catch (e) {
            console.log(`⚠️ PayPal fetch failed, skipping PayPal sync: ${e.message}`);
        }

        // Map PayPal emails to names
        const payPalMap = {};
        payPalTransactions.forEach(t => {
            const info = t.payer_info || {};
            const email = info.email_address;
            if (email) {
                let name = null;
                if (info.payer_name) {
                    name = info.payer_name.alternate_full_name ||
                        [info.payer_name.given_name, info.payer_name.surname].filter(Boolean).join(' ');
                } else if (t.shipping_info && t.shipping_info.name) {
                    name = t.shipping_info.name;
                }

                if (name && !payPalMap[email.toLowerCase()]) {
                    payPalMap[email.toLowerCase()] = name;
                }
            }
        });

        // 4. Process
        let updatedCount = 0;

        for (const profile of profiles) {
            const needsFix = !profile.full_name || profile.full_name === 'Unnamed User' || profile.full_name === 'Anonymous';

            // Try to find email from Auth if not in profile (though profile usually doesn't have email column, we need to match via ID)
            const authUser = authUsers.find(u => u.id === profile.id);
            const email = authUser?.email;

            if (!email) {
                // If we can't link to an email, we can't do much
                continue;
            }

            if (needsFix) {
                let newName = null;
                let source = null;

                // Priority 1: Auth Metadata
                if (authUser.user_metadata?.full_name) {
                    newName = authUser.user_metadata.full_name;
                    source = 'Auth Metadata';
                }

                // Priority 2: PayPal
                if (!newName && payPalMap[email.toLowerCase()]) {
                    newName = payPalMap[email.toLowerCase()];
                    source = 'PayPal';
                }

                // Priority 3: Extract from email
                if (!newName && email) {
                    // better than nothing for "Anonymous"
                    // newName = email.split('@')[0]; 
                    // source = 'Email Fallback';
                    // User requested "linked to their gmail and paypal", implying we should find REAL names. 
                    // I will skip email fallback for now to avoid just replacing "Anonymous" with "amitfrenkelz".
                }

                if (newName) {
                    console.log(`🔧 Fixing ${email} (ID: ${profile.id})`);
                    console.log(`   Old Name: ${profile.full_name}`);
                    console.log(`   New Name: ${newName} (Source: ${source})`);

                    const { error: updateError } = await supabase
                        .from('profiles')
                        .update({ full_name: newName })
                        .eq('id', profile.id);

                    if (updateError) {
                        console.log(`   ❌ Update failed: ${updateError.message}`);
                    } else {
                        console.log(`   ✅ Synced!`);
                        updatedCount++;
                    }
                }
            }
        }

        console.log('='.repeat(60));
        console.log(`🎉 Done! Updated ${updatedCount} user profiles.`);

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    }
}

fixAnonymousUsers();
