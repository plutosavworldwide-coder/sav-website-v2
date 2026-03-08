
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

async function updateNames() {
    console.log(`Updating names for ${targetUsernames.length} users...\n`);

    for (const username of targetUsernames) {
        // 1. Find profile
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, full_name, tradingview_username')
            .ilike('tradingview_username', username);

        if (error) {
            console.error(`Error fetching ${username}:`, error.message);
            continue;
        }

        if (!profiles || profiles.length === 0) {
            console.log(`[NOT FOUND] ${username}`);
            continue;
        }

        for (const profile of profiles) {
            console.log(`Processing ${profile.tradingview_username} (Current Name: ${profile.full_name})`);

            // 2. Update full_name to tradingview_username
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ full_name: profile.tradingview_username })
                .eq('id', profile.id);

            if (updateError) {
                console.error(`   Failed to update: ${updateError.message}`);
            } else {
                console.log(`   SUCCESS: Updated name to "${profile.tradingview_username}"`);
            }
        }
    }
}

updateNames();
