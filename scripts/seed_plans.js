
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Credentials from what we just configured
const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDEyMDksImV4cCI6MjA4NTQ3NzIwOX0.cVMMjFrx8RqHfqoAesF7b2QFIEQhENykenyuuhxVjLk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const plans = [
    {
        name: 'Standard Plan',
        description: 'Core mentorship and daily guidance. 30 days/ 4 Week lecture folders, Daily Bias / Routine Lecture, Live Session Lectures + 4 more benefits.',
        price: 80,
        interval_unit: 'month',
        interval_count: 1,
        // Since we couldn't fetch PayPal IDs automatically, we might need to create them or user needs to provide them. 
        // For now we will insert them without paypal_plan_id or with a placeholder if the app handles creation.
        // Assuming app needs these to exist in DB first.
    },
    {
        name: 'Extended Plan',
        description: 'Deep dive with extended access. 60 days/ 4 Week lecture folders, Daily Bias / Routine Lecture, Live Session Lectures + 2 more benefits.',
        price: 140,
        interval_unit: 'month', // 2 months
        interval_count: 2,
    },
    {
        name: 'Lifetime Plan',
        description: 'Permanent, unrestricted access. Lifetime Lectures, Daily Bias / Routine Lecture, Live Session Lectures + 4 more benefits.',
        price: 800,
        interval_unit: 'year', // Lifetime usually treated as 100 years or null. Let's say 100 years for "lifetime" logic to work if interval based.
        interval_count: 100,
    }
];

async function seedPlans() {
    console.log("Seeding Plans...");

    // Clear existing plans to avoid duplicates since we don't have a unique constraint
    const { error: deleteError } = await supabase.from('plans').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    if (deleteError) console.error("Error clearing plans:", deleteError.message);

    for (const plan of plans) {
        const { error } = await supabase
            .from('plans')
            .insert(plan)
            .select();

        if (error) {
            console.error(`Error inserting ${plan.name}:`, error.message);
        } else {
            console.log(`Synced: ${plan.name}`);
        }
    }

    console.log("Done.");
}

seedPlans();
