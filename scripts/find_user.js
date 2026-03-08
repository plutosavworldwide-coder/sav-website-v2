
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findUser() {
    console.log('Searching for savfx2023@gmail.com in profiles...');

    // Attempt to select email from profiles
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(100);

    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    console.log(`Found ${data.length} profiles. Checking emails...`);

    // Verify subscription status for target user
    const { data: user, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'd8834dca-5407-4fe6-9e3b-5f6fd08f2eb5')
        .single();

    if (fetchError) {
        console.error('Error fetching profile:', fetchError);
    } else {
        console.log('User Profile:', {
            id: user.id,
            name: user.full_name,
            status: user.subscription_status,
            plan: user.paypal_subscription_id
        });
    }
}

findUser();
