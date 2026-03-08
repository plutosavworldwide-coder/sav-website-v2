
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Prices include 5% fee
const NEW_PLANS = [
    {
        name: "Standard Plan",
        description: "Core mentorship and daily guidance.",
        price: 84, // 80 + 5%
        interval_unit: "MONTH",
        interval_count: 1
    },
    {
        name: "Extended Plan",
        description: "Deep dive with extended access.",
        price: 147, // 140 + 5%
        interval_unit: "MONTH",
        interval_count: 2
    },
    {
        name: "Indicators",
        description: "Essential market data and proprietary algorithms.",
        price: 5.25, // 5 + 5%
        interval_unit: "MONTH",
        interval_count: 1
    }
];

async function upgradePlans() {
    console.log("Deleting old plans from database to verify clean slate...");
    // Note: This only deletes from Supabase, not PayPal. PayPal plans remain active but we will generate new ones.
    const { error: deleteError } = await supabase.from('plans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) console.error("Error clearing table:", deleteError);

    console.log("Inserting NEW plans with 5% fee...");
    for (const plan of NEW_PLANS) {
        console.log(`Creating ${plan.name} (€${plan.price})...`);
        await supabase.from('plans').insert(plan);
    }

    console.log("Waiting 15 seconds for provisioning...");
    await new Promise(r => setTimeout(r, 15000));

    // Check if we need to force provision (if webhook failed or is slow)
    // We'll run the provision script logic inline here to be safe
    console.log("Ensuring provisioning...");
    const { data: pending } = await supabase.from('plans').select('*').is('paypal_plan_id', null);

    if (pending && pending.length > 0) {
        const functionUrl = `${supabaseUrl}/functions/v1/create-paypal-plan`;
        for (const plan of pending) {
            console.log(`Force provisioning: ${plan.name}`);
            await fetch(functionUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
                body: JSON.stringify({ type: "INSERT", record: plan })
            });
        }
    }

    console.log("Fetching Final IDs...");
    await new Promise(r => setTimeout(r, 5000));
    const { data: finalPlans } = await supabase.from('plans').select('*');

    const configMap = {};
    finalPlans.forEach(p => {
        configMap[p.name] = p.paypal_plan_id;
        console.log(`✅ ${p.name}: ${p.paypal_plan_id}`);
    });

    console.log("\nUPDATED CONFIG MAP:");
    console.log(JSON.stringify(configMap, null, 2));
}

upgradePlans();
