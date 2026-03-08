
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const functionUrl = `${supabaseUrl}/functions/v1/create-paypal-plan`;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugEdgeFunction() {
    console.log("Fetching a plan without PayPal ID...");
    const { data: plan, error } = await supabase
        .from('plans')
        .select('*')
        .is('paypal_plan_id', null)
        .limit(1)
        .single();

    if (error || !plan) {
        console.log("No pending plans found to debug (or error fetching).");
        if (error) console.error(error);
        return;
    }

    console.log(`Found Plan: ${plan.name} (${plan.id})`);
    console.log(`Simulating Webhook call to: ${functionUrl}`);

    const payload = {
        type: "INSERT",
        table: "plans",
        record: plan,
        schema: "public",
        old_record: null
    };

    try {
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}` // Using Anon key
            },
            body: JSON.stringify(payload)
        });

        console.log(`Response Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.log("Response Body:", text);

    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

debugEdgeFunction();
