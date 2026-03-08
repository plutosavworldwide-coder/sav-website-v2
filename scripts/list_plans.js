import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const PAYPAL_CLIENT_ID = 'ASMtybhnFMdAuSQtlkjj7FiZxfb2muN6jCt6LnNrOpGrg2nu6RxFocHWklqo5zWw2UByrV-3R7a1FA77';
const PAYPAL_SECRET = 'EOCJ1_ZMJyQZlMZwy5bOSFaa1BXrgD9oEI2NDlA2zmxjiA_jRddmCwhvj_KzpI1K1zgtdIPm5SdZv6a0';
const PAYPAL_API = 'https://api-m.paypal.com'; // Live API

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

console.log('='.repeat(70));
console.log('PAYPAL SUBSCRIPTION PLANS - SAV FX');
console.log('='.repeat(70));
console.log('');

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
    return data.access_token;
}

async function listPayPalPlans(accessToken) {
    const response = await fetch(`${PAYPAL_API}/v1/billing/plans?page_size=20&total_required=true`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    return await response.json();
}

async function listPlans() {
    try {
        // 1. Check database plans table
        console.log('📊 PLANS IN DATABASE (Supabase):');
        console.log('-'.repeat(70));

        const { data: dbPlans, error: dbError } = await supabase
            .from('plans')
            .select('*')
            .order('price', { ascending: true });

        if (dbError) {
            console.log('❌ Error querying database:', dbError.message);
        } else if (dbPlans && dbPlans.length > 0) {
            dbPlans.forEach((plan, idx) => {
                console.log(`${idx + 1}. ${plan.name}`);
                console.log(`   Price: €${plan.price} ${plan.currency || 'EUR'}`);
                console.log(`   Interval: ${plan.interval_count} ${plan.interval_unit}(s)`);
                console.log(`   PayPal Plan ID: ${plan.paypal_plan_id || 'Not linked'}`);
                console.log(`   Status: ${plan.is_active ? '✅ Active' : '❌ Inactive'}`);
                console.log('');
            });
        } else {
            console.log('⚠️  No plans found in database');
        }
        console.log('');

        // 2. Check PayPal account
        console.log('💳 PLANS IN PAYPAL ACCOUNT:');
        console.log('-'.repeat(70));

        const accessToken = await getPayPalAccessToken();
        const paypalPlans = await listPayPalPlans(accessToken);

        if (paypalPlans.plans && paypalPlans.plans.length > 0) {
            console.log(`Found ${paypalPlans.total_items || paypalPlans.plans.length} plan(s) in PayPal\n`);

            paypalPlans.plans.forEach((plan, idx) => {
                console.log(`${idx + 1}. ${plan.name}`);
                console.log(`   Plan ID: ${plan.id}`);
                console.log(`   Status: ${plan.status}`);

                if (plan.billing_cycles && plan.billing_cycles[0]) {
                    const cycle = plan.billing_cycles[0];
                    const pricing = cycle.pricing_scheme?.fixed_price;
                    if (pricing) {
                        console.log(`   Price: ${pricing.currency_code} ${pricing.value}`);
                    }
                    console.log(`   Frequency: ${cycle.frequency.interval_count} ${cycle.frequency.interval_unit}(s)`);
                }

                console.log('');
            });
        } else {
            console.log('⚠️  No plans found in PayPal account');
            if (paypalPlans.message) {
                console.log('   Error:', paypalPlans.message);
            }
        }
        console.log('');

        // 3. Summary
        console.log('='.repeat(70));
        console.log('SUMMARY');
        console.log('='.repeat(70));
        console.log(`Database Plans: ${dbPlans?.length || 0}`);
        console.log(`PayPal Plans: ${paypalPlans.plans?.length || 0}`);
        console.log('');

        if (dbPlans && dbPlans.length > 0 && paypalPlans.plans && paypalPlans.plans.length > 0) {
            console.log('💡 Recommendation: Ensure database plans are linked to PayPal Plan IDs');
            console.log('   This allows the webhook to automatically detect subscription types');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

listPlans();
