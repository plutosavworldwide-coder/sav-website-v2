
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDEyMDksImV4cCI6MjA4NTQ3NzIwOX0.cVMMjFrx8RqHfqoAesF7b2QFIEQhENykenyuuhxVjLk';

const supabase = createClient(supabaseUrl, supabaseKey);

const targetUsernames = [
    'Vanillahennessey',
    'BessemHabchi',
    'idangabai554',
    'Shay_Dabi'
];

async function inspectUsers() {
    console.log(`Inspecting ${targetUsernames.length} users...\n`);

    for (const username of targetUsernames) {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, tradingview_username')
            .ilike('tradingview_username', username);

        if (error) {
            console.error(`Error fetching ${username}:`, error.message);
            // Try to list available columns by selecting * limit 1
            const { data: sample, error: sampleError } = await supabase.from('profiles').select('*').limit(1);
            if (sample && sample.length > 0) {
                console.log('Available columns:', Object.keys(sample[0]));
            }
            continue;
        }

        if (!profiles || profiles.length === 0) {
            console.log(`[NOT FOUND] ${username}`);
            continue;
        }

        for (const profile of profiles) {
            console.log(`[FOUND] Username: ${profile.tradingview_username}`);
            console.log(`        ID: ${profile.id}`);
            console.log(`        Full Name: ${profile.full_name}`);
            console.log(`        Email (from profiles): ${profile.email || 'N/A'}`);
            console.log('---');
        }
    }
}

inspectUsers();
