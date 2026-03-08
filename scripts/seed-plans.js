
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const PLANS_TO_CREATE = [
    { name: "Standard Plan", price: 80, interval_unit: "MONTH", interval_count: 1 },
    { name: "Indicators", price: 30, interval_unit: "MONTH", interval_count: 1 },
    { name: "Extended Plan", price: 140, interval_unit: "MONTH", interval_count: 2 },
    // Lifetime is usually a one-time payment, skipping subscription creation for now or handling separately
];

async function seedPlans() {
    console.log("Checking existing plans...");
    const { data: existing } = await supabase.from('plans').select('name');
    const existingNames = new Set(existing?.map(p => p.name) || []);

    for (const plan of PLANS_TO_CREATE) {
        if (existingNames.has(plan.name)) {
            console.log(`Plan "${plan.name}" already exists. Skipping.`);
        } else {
            console.log(`Inserting "${plan.name}"...`);
            const { error } = await supabase.from('plans').insert(plan);
            if (error) console.error(`Error inserting ${plan.name}:`, error.message);
        }
    }

    console.log("Waiting 10 seconds for Webhooks to fire...");
    await new Promise(r => setTimeout(r, 10000));

    console.log("Fetching finalized IDs...");
    const { data: finalPlans } = await supabase.from('plans').select('*');

    const configMap = {};
    finalPlans.forEach(p => {
        if (p.paypal_plan_id) {
            configMap[p.name] = p.paypal_plan_id;
            console.log(`✅ ${p.name}: ${p.paypal_plan_id}`);
        } else {
            console.log(`❌ ${p.name}: No ID yet (Webhook failed?)`);
        }
    });

    console.log("\nCopy this map for your config:");
    console.log(JSON.stringify(configMap, null, 2));
}

seedPlans();
