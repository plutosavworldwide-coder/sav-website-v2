
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const functionUrl = `${supabaseUrl}/functions/v1/create-paypal-plan`;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function provisionAllPlans() {
    console.log("Fetching ALL plans without PayPal ID...");
    const { data: plans, error } = await supabase
        .from('plans')
        .select('*')
        .is('paypal_plan_id', null);

    if (error) {
        console.error(error);
        return;
    }

    if (!plans || plans.length === 0) {
        console.log("All plans are already provisioned!");
        return;
    }

    console.log(`Found ${plans.length} pending plans.`);

    for (const plan of plans) {
        console.log(`Provisioning: ${plan.name}...`);

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
                    'Authorization': `Bearer ${supabaseKey}`
                },
                body: JSON.stringify(payload)
            });

            const text = await response.text();
            if (response.ok) {
                console.log(`✅ Success: ${plan.name}`);
            } else {
                console.error(`❌ Failed: ${plan.name} - Status: ${response.status}`);
                console.error(`   Error: ${text}`);
            }

        } catch (err) {
            console.error(`❌ Network Error: ${plan.name}`, err);
        }

        // Wait a bit between calls to avoid rate limits
        await new Promise(r => setTimeout(r, 2000));
    }
}

provisionAllPlans();
