
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Use Service Key if available for admin privileges, otherwise fall back to Anon Key
// WARNING: Anon Key will likely fail RLS unless policies are very permissive
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars or supabase key');
    process.exit(1);
}

if (!supabaseServiceKey) {
    console.warn('WARNING: No Service Role Key found. Update might fail due to RLS policies.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_USER_ID = 'd8834dca-5407-4fe6-9e3b-5f6fd08f2eb5';

async function grantAccess() {
    console.log(`Granting access to user ${TARGET_USER_ID}...`);

    const { data, error } = await supabase
        .from('profiles')
        .update({
            subscription_status: 'active',
            paypal_subscription_id: 'MANUAL_GRANT_LIFETIME'
        })
        .eq('id', TARGET_USER_ID)
        .select();

    if (error) {
        console.error('Error updating profile:', error);
        console.log('TIP: You may need to add VITE_SUPABASE_SERVICE_ROLE_KEY to your .env file to bypass RLS.');
    } else {
        console.log('Success! Updated profile:', data);
    }
}

grantAccess();
