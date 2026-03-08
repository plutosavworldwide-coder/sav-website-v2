
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAutomation() {
    console.log("1. Insert Test Plan into 'plans' table...");
    const { data: inserted, error: insertError } = await supabase
        .from('plans')
        .insert({
            name: `Test Plan ${Date.now()}`,
            description: "Automated test plan",
            price: 10,
            interval_unit: "MONTH",
            interval_count: 1
        })
        .select()
        .single();

    if (insertError) {
        console.error("Insert Failed:", insertError);
        return;
    }

    console.log("   Inserted Plan ID:", inserted.id);
    console.log("   Waiting 5 seconds for Webhook to fire...");

    await new Promise(r => setTimeout(r, 5000));

    console.log("2. Checking if paypal_plan_id was updated...");
    const { data: updated, error: fetchError } = await supabase
        .from('plans')
        .select('*')
        .eq('id', inserted.id)
        .single();

    if (fetchError) {
        console.error("Fetch Failed:", fetchError);
        return;
    }

    if (updated.paypal_plan_id) {
        console.log("✅ SUCCESS! PayPal Plan ID generated:", updated.paypal_plan_id);
    } else {
        console.log("❌ FAILURE. paypal_plan_id is null.");
        console.log("   Possible Cause: The Supabase Database Webhook is not set up correctly.");
        console.log("   (It looks like you might have set up a PayPal webhook instead of a Supabase one!)");
    }
}

testAutomation();
