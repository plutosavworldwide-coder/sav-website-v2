import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://pbxrtqurwdfoplhbzyhd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY'
);

console.log('📋 Adding Indicators plan to database...');
console.log('');

const { data, error } = await supabase
    .from('plans')
    .insert({
        name: 'Indicators Only',
        description: 'Essential market data and proprietary algorithms',
        price: 10,
        currency: 'EUR',
        interval_unit: 'month',
        interval_count: 1,
        paypal_plan_id: 'P-8WE96957F40623801NGAPTLI',
        is_active: true
    })
    .select()
    .single();

if (error) {
    console.error('❌ Error:', error);
} else {
    console.log('✅ Plan added to database successfully!');
    console.log('');
    console.log('Record:');
    console.log(`  Database ID: ${data.id}`);
    console.log(`  Name: ${data.name}`);
    console.log(`  Price: €${data.price}/${data.interval_unit}`);
    console.log(`  PayPal Plan ID: ${data.paypal_plan_id}`);
    console.log(`  Active: ${data.is_active}`);
    console.log('');
}
