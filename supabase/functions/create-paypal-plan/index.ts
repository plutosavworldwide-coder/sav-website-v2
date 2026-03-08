
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"

const PAYPAL_API_BASE = Deno.env.get("PAYPAL_API_URL") || "https://api-m.sandbox.paypal.com";

// Helper to get PayPal Access Token
async function getPayPalAccessToken() {
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
        throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET");
    }

    const auth = btoa(`${clientId}:${clientSecret}`);
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${auth}`
        },
        body: "grant_type=client_credentials"
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error("PayPal Auth Failed: " + JSON.stringify(data));
    }
    return data.access_token;
}

serve(async (req) => {
    try {
        const { record } = await req.json();

        // Only run if paypal_plan_id is missing
        if (record.paypal_plan_id) {
            return new Response(JSON.stringify({ success: true, message: "Plan ID already exists" }), { headers: { "Content-Type": "application/json" } });
        }

        const accessToken = await getPayPalAccessToken();

        // 1. Create Product
        console.log(`Creating Product: ${record.name}`);
        const productRes = await fetch(`${PAYPAL_API_BASE}/v1/catalogs/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                name: record.name,
                description: record.description || `Subscription for ${record.name}`,
                type: "SERVICE",
                category: "SOFTWARE"
            })
        });

        const productData = await productRes.json();
        console.log("Product Response:", JSON.stringify(productData));

        if (!productRes.ok) {
            throw new Error("Product Creation Failed: " + JSON.stringify(productData));
        }
        const productId = productData.id;

        // 2. Create Plan
        console.log(`Creating Plan for Product: ${productId}`);
        const planRes = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                product_id: productId,
                name: record.name,
                description: record.description || `Subscription for ${record.name}`,
                status: "ACTIVE",
                billing_cycles: [
                    {
                        frequency: {
                            interval_unit: record.interval_unit,
                            interval_count: record.interval_count || 1
                        },
                        tenure_type: "REGULAR",
                        sequence: 1,
                        total_cycles: 0,
                        pricing_scheme: {
                            fixed_price: {
                                value: record.price.toString(),
                                currency_code: "EUR"
                            }
                        }
                    }
                ],
                payment_preferences: {
                    auto_bill_outstanding: true,
                    setup_fee: {
                        value: "0",
                        currency_code: "EUR"
                    },
                    setup_fee_failure_action: "CONTINUE",
                    payment_failure_threshold: 3
                }
            })
        });

        const planData = await planRes.json();
        console.log("Plan Response:", JSON.stringify(planData));

        if (!planRes.ok) {
            throw new Error("Plan Creation Failed: " + JSON.stringify(planData));
        }

        // 3. Update Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error: updateError } = await supabase
            .from('plans')
            .update({ paypal_plan_id: planData.id })
            .eq('id', record.id);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ success: true, plan_id: planData.id }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Error in Edge Function:", error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
});
