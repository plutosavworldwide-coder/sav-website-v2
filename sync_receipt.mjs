import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pbxrtqurwdfoplhbzyhd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY'
);

async function applyReceiptData() {
  const userId = '85fbdbfa-54ad-4491-98ea-75a3347fbd6b'; // alonhayu@gmail.com
  const { data, error } = await supabase
    .from('profiles')
    .update({
      subscription_start_date: '2026-02-14T00:00:00.000Z',
      subscription_end_date: '2026-03-14T00:00:00.000Z',
      paypal_subscription_id: 'receipt-273', // Placeholding for now
    })
    .eq('id', userId)
    .select();
    
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Successfully aligned receipt dates:", data);
  }
}

applyReceiptData();
