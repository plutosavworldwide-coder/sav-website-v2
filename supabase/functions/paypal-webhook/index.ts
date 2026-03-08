import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, paypal-transmission-id, paypal-transmission-time, paypal-transmission-sig, paypal-cert-url, paypal-auth-algo",
};

// Configuration
// TODO: Switch to "https://api-m.paypal.com" for PRODUCTION
const PAYPAL_API_BASE = "https://api-m.paypal.com";

// Subscription type durations in days
const PLAN_DURATIONS: Record<string, number> = {
    indicators_only: 30, // 1 month
    standard: 30,    // 1 month
    extended: 60,    // 2 months
    lifetime: 36500, // 100 years (effectively forever)
};

interface PayPalWebhookEvent {
    id: string;
    event_type: string;
    resource: {
        id?: string;
        billing_agreement_id?: string;
        custom_id?: string;
        amount?: { total?: string; value?: string; currency_code?: string };
        payer?: { email_address?: string; payer_id?: string };
        subscriber?: { email_address?: string; payer_id?: string };
        plan_id?: string;
        status?: string;
    };
    create_time: string;
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Get raw body for verification
        const rawBody = await req.text();
        let event: PayPalWebhookEvent;
        try {
            event = JSON.parse(rawBody);
        } catch {
            throw new Error("Invalid JSON body");
        }

        // 2. Verify Signature (Critical Security)
        // Skip verification ONLY if specifically allowed (e.g. local testing with a flag)
        const skipVerify = Deno.env.get("SKIP_PAYPAL_VERIFY") === "true";

        if (!skipVerify) {
            const isVerified = await verifyWebhookSignature(req, rawBody);
            if (!isVerified) {
                console.error("[PayPal Webhook] Signature Verification Failed!");
                return new Response(
                    JSON.stringify({ error: "Invalid Signature" }),
                    { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }
        }

        // Initialize Supabase with Service Role
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        console.log(`[PayPal Webhook] Received Verified Event: ${event.event_type}`, JSON.stringify(event, null, 2));

        const eventType = event.event_type;
        const resource = event.resource;

        // Extract key identifiers
        const paypalTransactionId = resource.id;
        const paypalSubscriptionId = resource.billing_agreement_id || resource.id;
        const payerEmail = resource.payer?.email_address || resource.subscriber?.email_address;
        const customId = resource.custom_id;
        const planId = resource.plan_id;

        // Determine amount
        const amount = parseFloat(resource.amount?.total || resource.amount?.value || "0");
        const currency = resource.amount?.currency_code || "EUR";

        // Find the user
        let userId: string | null = customId || null;

        if (!userId && paypalSubscriptionId) {
            const { data: profile } = await supabaseAdmin
                .from("profiles")
                .select("id")
                .eq("paypal_subscription_id", paypalSubscriptionId)
                .single();
            userId = profile?.id || null;
        }

        if (!userId && payerEmail) {
            const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
            const matchedUser = authUsers.users?.find((u) => u.email === payerEmail);
            userId = matchedUser?.id || null;
        }

        // Log transaction
        const { error: txError } = await supabaseAdmin.from("transactions").insert({
            user_id: userId,
            paypal_transaction_id: paypalTransactionId,
            paypal_subscription_id: paypalSubscriptionId,
            paypal_payer_email: payerEmail,
            amount: amount,
            currency: currency,
            status: getTransactionStatus(eventType),
            event_type: eventType,
            metadata: event,
        });

        if (txError) console.error("[PayPal Webhook] Failed to log transaction:", txError);

        if (!userId) {
            console.warn("[PayPal Webhook] Could not identify user for event:", eventType);
            return new Response(
                JSON.stringify({ received: true, warning: "User not identified" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Process logic
        switch (eventType) {
            case "PAYMENT.SALE.COMPLETED":
            case "BILLING.SUBSCRIPTION.ACTIVATED":
            case "BILLING.SUBSCRIPTION.RENEWED": {
                const subscriptionType = await determineSubscriptionType(supabaseAdmin, planId, amount);
                const durationDays = PLAN_DURATIONS[subscriptionType] || 30;
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + durationDays);

                await supabaseAdmin.from("profiles").update({
                    subscription_status: "active",
                    subscription_type: subscriptionType,
                    subscription_start_date: new Date().toISOString(),
                    subscription_end_date: subscriptionType === "lifetime" ? null : endDate.toISOString(),
                    paypal_subscription_id: paypalSubscriptionId,
                    updated_at: new Date().toISOString(),
                }).eq("id", userId);

                console.log(`[PayPal Webhook] Granted access to user ${userId} (${subscriptionType})`);
                break;
            }

            case "BILLING.SUBSCRIPTION.CANCELLED":
            case "BILLING.SUBSCRIPTION.SUSPENDED":
            case "BILLING.SUBSCRIPTION.EXPIRED":
            case "PAYMENT.SALE.DENIED":
            case "PAYMENT.SALE.REFUNDED": {
                await supabaseAdmin.from("profiles").update({
                    subscription_status: eventType.includes("CANCELLED") ? "cancelled" : "suspended",
                    updated_at: new Date().toISOString(),
                }).eq("id", userId);

                console.log(`[PayPal Webhook] Revoked access for user ${userId} (${eventType})`);
                break;
            }

            default:
                console.log(`[PayPal Webhook] Unhandled event type: ${eventType}`);
        }

        return new Response(
            JSON.stringify({ received: true, user_id: userId, event_type: eventType }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("[PayPal Webhook] Error:", error.message);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});

/**
 * Validates the webhook signature with PayPal API
 */
async function verifyWebhookSignature(req: Request, rawBody: string): Promise<boolean> {
    const webhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
    if (!webhookId) {
        console.error("Missing PAYPAL_WEBHOOK_ID env var");
        return false;
    }

    const headers = req.headers;
    const transmissionId = headers.get("paypal-transmission-id");
    const transmissionTime = headers.get("paypal-transmission-time");
    const certUrl = headers.get("paypal-cert-url");
    const authAlgo = headers.get("paypal-auth-algo");
    const transmissionSig = headers.get("paypal-transmission-sig");

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
        console.error("Missing PayPal signature headers");
        return false;
    }

    const accessToken = await getPayPalAccessToken();
    if (!accessToken) return false;

    const verificationPayload = {
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody)
    };

    const response = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(verificationPayload)
    });

    const result = await response.json();
    if (result.verification_status === "SUCCESS") {
        return true;
    }

    console.error("PayPal Verification Failed:", result);
    return false;
}

/**
 * Gets an OAuth2 access token from PayPal
 */
async function getPayPalAccessToken(): Promise<string | null> {
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
        console.error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET");
        return null;
    }

    const auth = btoa(`${clientId}:${clientSecret}`);
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
    });

    if (!response.ok) {
        console.error("Failed to get PayPal Access Token", await response.text());
        return null;
    }

    const data = await response.json();
    return data.access_token;
}

function getTransactionStatus(eventType: string): string {
    if (eventType.includes("COMPLETED") || eventType.includes("ACTIVATED") || eventType.includes("RENEWED")) {
        return "completed";
    }
    if (eventType.includes("REFUNDED")) return "refunded";
    if (eventType.includes("DENIED") || eventType.includes("FAILED")) return "failed";
    return "pending";
}

async function determineSubscriptionType(
    supabase: ReturnType<typeof createClient>,
    planId: string | undefined,
    amount: number
): Promise<string> {
    if (planId) {
        const { data: plan } = await supabase
            .from("plans")
            .select("name")
            .eq("paypal_plan_id", planId)
            .single();

        if (plan?.name) {
            const name = plan.name.toLowerCase();
            if (name.includes("lifetime")) return "lifetime";
            if (name.includes("extended")) return "extended";
            if (name.includes("standard")) return "standard";
            if (name.includes("indicators")) return "indicators_only";
        }
    }

    if (amount >= 700) return "lifetime";
    if (amount >= 120) return "extended";
    if (amount >= 70) return "standard";
    if (amount >= 9) return "indicators_only";
    return "standard";
}
