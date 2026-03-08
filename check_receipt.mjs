import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pbxrtqurwdfoplhbzyhd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY'
);

async function checkReceipt() {
  const { data: tables, error: tableError } = await supabase.from('profiles').select('*').limit(1);
  console.log("Looking in database...");
}
checkReceipt();
