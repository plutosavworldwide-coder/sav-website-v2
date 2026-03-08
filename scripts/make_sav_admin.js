
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function makeAdmin() {
    console.log("Searching for 'Sav'...");

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', '%Sav%');

    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    console.log(`Found ${profiles.length} profiles.`);

    for (const p of profiles) {
        console.log(`Updating user: ${p.full_name} (${p.id}) - Current Role: ${p.role}`);

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', p.id);

        if (updateError) {
            console.error(`Failed to update ${p.full_name}:`, updateError);
        } else {
            console.log(`SUCCESS: Updated ${p.full_name} using ID ${p.id} to role 'admin'.`);
        }
    }
}

makeAdmin();
