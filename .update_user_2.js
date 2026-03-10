import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function checkAndUpsert() {
  const email = 'imdonrasaq@gmail.com';
  
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === email);
  if (!user) {
    console.error(`User with email ${email} not found in auth.users.`);
    process.exit(1);
  }

  console.log(`Checking profile for user ID: ${user.id}`);
  const { data: existingProfile, error: selectError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  
  if (selectError && selectError.code !== 'PGRST116') {
    console.error('Error fetching profile:', selectError);
    process.exit(1);
  }

  if (existingProfile) {
    console.log('Profile exists, doing update...');
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_type: 'standard',
        subscription_start_date: new Date().toISOString()
      })
      .eq('id', user.id)
      .select();
      
    if (error) {
      console.error('Update error:', error);
      process.exit(1);
    }
    console.log(`✅ Updated existing profile to standard access for ${email}.`);
  } else {
    console.log('Profile does NOT exist. Doing insert...');
    const { data: inserted, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: user?.user_metadata?.full_name || email.split('@')[0],
        subscription_status: 'active',
        subscription_type: 'standard',
        subscription_start_date: new Date().toISOString()
      })
      .select();
      
    if (error) {
      console.error('Insert error:', error);
      process.exit(1);
    }
    console.log(`✅ Created new profile with standard access for ${email}.`);
  }
}

checkAndUpsert().catch(console.error);
