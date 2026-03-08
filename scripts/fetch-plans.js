
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

async function fetchPlans() {
    console.log("Fetching plans from Supabase...");
    const { data: plans, error } = await supabase
        .from('plans')
        .select('*');

    if (error) {
        console.error("Error fetching plans:", error);
        return;
    }

    if (plans.length === 0) {
        console.log("No plans found in the database. Did you insert them?");
    } else {
        console.log("Found Plans:");
        console.table(plans);

        console.log("\n--- COPY THESE IDs ---");
        plans.forEach(plan => {
            console.log(`Plan: "${plan.name}" -> ID: ${plan.paypal_plan_id || 'PENDING/NULL'}`);
        });
    }
}

fetchPlans();
