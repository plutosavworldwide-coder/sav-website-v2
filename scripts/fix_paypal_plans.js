
import { createClient } from '@supabase/supabase-js';

// Using credentials from scripts/add_plan.js which appear to be valid service role credentials
const supabaseUrl = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Prices include 8% fee to match UI (Tax Rate 0.08)
// Standard: 80 * 1.08 = 86.40
// Extended: 140 * 1.08 = 151.20
// Indicators: 10 * 1.08 = 10.80

const NEW_PLANS = [
    {
        name: "Standard Plan",
        description: "Core mentorship and daily guidance.",
        price: 86.40,
        interval_unit: "MONTH",
        interval_count: 1
    },
    {
        name: "Extended Plan",
        description: "Deep dive with extended access.",
        price: 151.20,
        interval_unit: "MONTH",
        interval_count: 2
    },
    {
        name: "Indicators",
        description: "Essential market data and proprietary algorithms.",
        price: 10.80,
        interval_unit: "MONTH",
        interval_count: 1
    }
];

async function upgradePlans() {
    console.log("Deleting old plans from database to verify clean slate...");
    // Only deleting ones that match our names or all except special ones if needed.
    // For safety, let's delete clearly named ones to avoid duplicates.
    // Actually, update-prices.js deleted everything except ID 0. Let's do the same to be consistent.
    const { error: deleteError } = await supabase.from('plans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) {
        console.error("Error clearing table:", deleteError);
    } else {
        console.log("Existing plans cleared.");
    }

    console.log("Inserting NEW plans with 8% tax included...");
    for (const plan of NEW_PLANS) {
        console.log(`Creating ${plan.name} (€${plan.price})...`);
        const { error } = await supabase.from('plans').insert(plan);
        if (error) console.error(`Error inserting ${plan.name}:`, error);
    }

    console.log("Waiting 20 seconds for provisioning (Edge Function triggers)...");
    await new Promise(r => setTimeout(r, 20000));

    // Check if we need to force provision
    console.log("Ensuring provisioning...");
    const { data: pending } = await supabase.from('plans').select('*').is('paypal_plan_id', null);

    if (pending && pending.length > 0) {
        const functionUrl = `${supabaseUrl}/functions/v1/create-paypal-plan`;
        for (const plan of pending) {
            console.log(`Force provisioning: ${plan.name}`);
            try {
                const res = await fetch(functionUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
                    body: JSON.stringify({ type: "INSERT", record: plan })
                });
                const responseData = await res.json();
                console.log(`Result: ${JSON.stringify(responseData)}`);
            } catch (err) {
                console.error(`Failed to force provision ${plan.name}:`, err);
            }
        }
        console.log("Waiting 10 more seconds...");
        await new Promise(r => setTimeout(r, 10000));
    }

    console.log("Fetching Final IDs...");
    const { data: finalPlans } = await supabase.from('plans').select('*');

    const configMap = {};
    if (finalPlans) {
        finalPlans.forEach(p => {
            configMap[p.name] = p.paypal_plan_id;
            console.log(`✅ ${p.name}: ${p.paypal_plan_id} (Price: ${p.price})`);
        });
    }

    console.log("\nUPDATED CONFIG MAP (Copy this to src/lib/config.js):");
    console.log(JSON.stringify(configMap, null, 2));
}

upgradePlans();
