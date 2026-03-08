import { createClient } from '@supabase/supabase-js';

const PAYPAL_CLIENT_ID = 'BAA_bixUooojj0XCHWl60y2SHzYv3xuiEj7aAc9u4mfncWw9-5iC5rS-rCOR8blFW-aUdeU7l8H3QRs4zM';
const PAYPAL_SECRET = 'EDLGTRDvtWc7XuvQu1vKCyluJQmoeDGWL9JnbFGiSIJ7yE-69FVVjNHxoDqdTdv8ejBET4o3pRphTCyD';
const PAYPAL_API = 'https://api-m.paypal.com'; // Live API

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

console.log('📦 CREATING INDICATORS-ONLY PLAN IN PAYPAL');
console.log('='.repeat(70));
console.log('');

async function getAccessToken() {
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

    if (!data.access_token) {
        throw new Error(`Failed to get access token: ${JSON.stringify(data)}`);
    }

    return data.access_token;
}

async function createProduct(accessToken) {
    const productPayload = {
        name: "Sav FX Indicators",
        description: "Access to premium TradingView indicators and market data tools",
        type: "SERVICE",
        category: "SOFTWARE",
        image_url: "https://savfx.com/logo.png", // Optional
        home_url: "https://savfx.com"
    };

    console.log('Creating product in PayPal...');

    const response = await fetch(`${PAYPAL_API}/v1/catalogs/products`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(productPayload)
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('❌ Failed to create product:');
        console.error(JSON.stringify(data, null, 2));
        throw new Error(`PayPal API error: ${data.message || 'Unknown error'}`);
    }

    return data;
}

async function createBillingPlan(accessToken, productId) {
    const planPayload = {
        product_id: productId,
        name: "Indicators Only",
        description: "Essential market data and proprietary algorithms - Access to indicators only",
        status: "ACTIVE",
        billing_cycles: [
            {
                frequency: {
                    interval_unit: "MONTH",
                    interval_count: 1
                },
                tenure_type: "REGULAR",
                sequence: 1,
                total_cycles: 0, // 0 = infinite
                pricing_scheme: {
                    fixed_price: {
                        value: "10",
                        currency_code: "EUR"
                    }
                }
            }
        ],
        payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee: {
                value: "0",
                currency_code: "EUR"
            },
            setup_fee_failure_action: "CONTINUE",
            payment_failure_threshold: 3
        }
    };

    console.log('Creating billing plan...');

    const response = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(planPayload)
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('❌ Failed to create plan:');
        console.error(JSON.stringify(data, null, 2));
        throw new Error(`PayPal API error: ${data.message || 'Unknown error'}`);
    }

    return data;
}

async function addPlanToDatabase(planId) {
    console.log('Adding plan to database...');

    const { data, error } = await supabase
        .from('plans')
        .insert({
            name: 'Indicators Only',
            description: 'Essential market data and proprietary algorithms',
            price: 10,
            currency: 'EUR',
            interval_unit: 'month',
            interval_count: 1,
            paypal_plan_id: planId,
            is_active: true
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Failed to insert into database:', error.message);
        throw error;
    }

    return data;
}

async function createIndicatorsPlan() {
    try {
        // Step 1: Get PayPal access token
        console.log('1. Authenticating with PayPal...');
        const accessToken = await getAccessToken();
        console.log('✅ Authenticated successfully');
        console.log('');

        // Step 2: Create product
        console.log('2. Creating product...');
        const product = await createProduct(accessToken);
        console.log('✅ Product created successfully!');
        console.log(`   Product ID: ${product.id}`);
        console.log('');

        // Step 3: Create the billing plan
        console.log('3. Creating billing plan...');
        const plan = await createBillingPlan(accessToken, product.id);
        console.log('✅ Plan created successfully!');
        console.log('');
        console.log('Plan Details:');
        console.log(`  ID: ${plan.id}`);
        console.log(`  Name: ${plan.name}`);
        console.log(`  Status: ${plan.status}`);
        console.log('');

        // Step 4: Add to database
        console.log('4. Adding plan to Supabase...');
        const dbPlan = await addPlanToDatabase(plan.id);
        console.log('✅ Added to database successfully!');
        console.log('');
        console.log('Database Record:');
        console.log(`  ID: ${dbPlan.id}`);
        console.log(`  Name: ${dbPlan.name}`);
        console.log(`  Price: €${dbPlan.price}/${dbPlan.interval_unit}`);
        console.log(`  PayPal Plan ID: ${dbPlan.paypal_plan_id}`);
        console.log('');

        console.log('='.repeat(70));
        console.log('✅ INDICATORS-ONLY PLAN CREATED SUCCESSFULLY!');
        console.log('='.repeat(70));
        console.log('');
        console.log('PayPal Plan URL:');
        console.log(`https://www.paypal.com/billing/plans/${plan.id}`);
        console.log('');
        console.log('The webhook will now automatically detect €10 payments');
        console.log('and assign users the "indicators_only" subscription type.');
        console.log('');

    } catch (error) {
        console.error('');
        console.error('='.repeat(70));
        console.error('❌ ERROR');
        console.error('='.repeat(70));
        console.error(error.message);
        console.error('');
    }
}

createIndicatorsPlan();
