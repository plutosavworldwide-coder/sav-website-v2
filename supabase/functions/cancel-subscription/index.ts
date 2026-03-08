import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// PayPal Live API credentials
const PAYPAL_CLIENT_ID = "BAA_bixUooojj0XCHWl60y2SHzYv3xuiEj7aAc9u4mfncWw9-5iC5rS-rCOR8blFW-aUdeU7l8H3QRs4zM";
const PAYPAL_SECRET = "EDLGTRDvtWc7XuvQu1vKCyluJQmoeDGWL9JnbFGiSIJ7yE-69FVVjNHxoDqdTdv8ejBET4o3pRphTCyD";
const PAYPAL_API = "https://api-m.paypal.com";

interface CancelRequest {
    reason?: string;
}

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Get authorization header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "No authorization header" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Initialize Supabase clients
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

        // Client with user's auth token (to get user identity)
        const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        });

        // Admin client (to update profile)
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // Get the authenticated user
        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: "Not authenticated" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Get user's profile to find PayPal subscription ID
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("paypal_subscription_id, subscription_status, subscription_type")
            .eq("id", user.id)
            .single();

        if (profileError || !profile) {
            return new Response(
                JSON.stringify({ error: "Profile not found" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Check if user has an active subscription to cancel
        if (!profile.paypal_subscription_id) {
            return new Response(
                JSON.stringify({ error: "No active PayPal subscription found" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (profile.subscription_status === "cancelled") {
            return new Response(
                JSON.stringify({ error: "Subscription is already cancelled" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Get cancellation reason from request body
        const body: CancelRequest = await req.json().catch(() => ({}));
        const reason = body.reason || "User requested cancellation";

        console.log(`[Cancel Subscription] Cancelling subscription ${profile.paypal_subscription_id} for user ${user.id}`);

        // Step 1: Get PayPal access token
        const authBuffer = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`);
        const tokenResponse = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${authBuffer}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "grant_type=client_credentials"
        });

        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
            console.error("[Cancel Subscription] Failed to get PayPal token:", tokenData);
            return new Response(
                JSON.stringify({ error: "Failed to authenticate with PayPal" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Step 2: Cancel the subscription on PayPal
        const cancelResponse = await fetch(
            `${PAYPAL_API}/v1/billing/subscriptions/${profile.paypal_subscription_id}/cancel`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${tokenData.access_token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ reason })
            }
        );

        // PayPal returns 204 No Content on successful cancellation
        if (cancelResponse.status !== 204 && !cancelResponse.ok) {
            const errorData = await cancelResponse.json().catch(() => ({}));
            console.error("[Cancel Subscription] PayPal API error:", errorData);
            return new Response(
                JSON.stringify({
                    error: "Failed to cancel subscription with PayPal",
                    details: errorData
                }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Step 3: Update user's profile in database
        const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({
                subscription_status: "cancelled",
                updated_at: new Date().toISOString()
            })
            .eq("id", user.id);

        if (updateError) {
            console.error("[Cancel Subscription] Failed to update profile:", updateError);
            // Note: Subscription is cancelled on PayPal side, but database update failed
            return new Response(
                JSON.stringify({
                    success: true,
                    warning: "Subscription cancelled on PayPal but database update failed",
                    paypal_cancelled: true
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Step 4: Log the cancellation in transactions
        await supabaseAdmin.from("transactions").insert({
            user_id: user.id,
            paypal_subscription_id: profile.paypal_subscription_id,
            amount: 0,
            status: "completed",
            event_type: "USER_INITIATED_CANCELLATION",
            metadata: { reason, cancelled_at: new Date().toISOString() }
        });

        console.log(`[Cancel Subscription] Successfully cancelled subscription for user ${user.id}`);

        return new Response(
            JSON.stringify({
                success: true,
                message: "Subscription cancelled successfully",
                subscription_id: profile.paypal_subscription_id
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("[Cancel Subscription] Error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
