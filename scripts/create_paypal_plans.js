import { createClient } from '@supabase/supabase-js';

const PAYPAL_CLIENT_ID = 'ASMtybhnFMdAuSQtlkjj7FiZxfb2muN6jCt6LnNrOpGrg2nu6RxFocHWklqo5zWw2UByrV-3R7a1FA77';
const PAYPAL_SECRET = 'EOCJ1_ZMJyQZlMZwy5bOSFaa1BXrgD9oEI2NDlA2zmxjiA_jRddmCwhvj_KzpI1K1zgtdIPm5SdZv6a0';
const PAYPAL_API = 'https://api-m.paypal.com'; // Live API

const PLANS_TO_CREATE = [
    {
        name: "Indicators",
        description: "Essential market data and proprietary algorithms",
        price: "10.80", // 10 + 8%
        interval_unit: "MONTH",
        interval_count: 1
    },
    {
        name: "Standard Plan",
        description: "Core mentorship and daily guidance",
        price: "86.40", // 80 + 8%
        interval_unit: "MONTH",
        interval_count: 1
    },
    {
        name: "Extended Plan",
        description: "Deep dive with extended access",
        price: "151.20", // 140 + 8%
        interval_unit: "MONTH", // PayPal uses MONTH for billing cycles
        interval_count: 2 // Every 2 months
    }
];

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
    if (!data.access_token) throw new Error(`Failed to get access token: ${JSON.stringify(data)}`);
    return data.access_token;
}

async function createProduct(accessToken, planName, planDesc) {
    const response = await fetch(`${PAYPAL_API}/v1/catalogs/products`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            name: planName,
            description: planDesc,
            type: "SERVICE",
            category: "SOFTWARE",
            image_url: "https://savfx.com/logo.png",
            home_url: "https://savfx.com"
        })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(`Failed to create product: ${JSON.stringify(data)}`);
    return data.id;
}

async function createBillingPlan(accessToken, productId, planConfig) {
    const planPayload = {
        product_id: productId,
        name: planConfig.name,
        description: planConfig.description,
        status: "ACTIVE",
        billing_cycles: [
            {
                frequency: {
                    interval_unit: planConfig.interval_unit,
                    interval_count: planConfig.interval_count
                },
                tenure_type: "REGULAR",
                sequence: 1,
                total_cycles: 0, // Infinite
                pricing_scheme: {
                    fixed_price: {
                        value: planConfig.price,
                        currency_code: "EUR"
                    }
                }
            }
        ],
        payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee: { value: "0", currency_code: "EUR" },
            setup_fee_failure_action: "CONTINUE",
            payment_failure_threshold: 3
        }
    };

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
    if (!response.ok) throw new Error(`Failed to create plan: ${JSON.stringify(data)}`);
    return data.id;
}

async function main() {
    try {
        console.log('Authenticating...');
        const token = await getAccessToken();
        console.log('Authenticated.');

        const results = {};

        for (const plan of PLANS_TO_CREATE) {
            console.log(`Creating ${plan.name} (${plan.price} EUR every ${plan.interval_count} ${plan.interval_unit})...`);
            const productId = await createProduct(token, plan.name, plan.description);
            const planId = await createBillingPlan(token, productId, plan);
            results[plan.name] = planId;
            console.log(`✅ ${plan.name}: ${planId}`);
        }

        console.log('\n--- NEW PAYPAL PLAN IDs ---');
        console.log(JSON.stringify(results, null, 2));

    } catch (err) {
        console.error('Error:', err);
    }
}

main();
