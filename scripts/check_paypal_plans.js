
import dotenv from 'dotenv';
import fs from 'fs';

// Since we're running this as a standalone script, we need to handle env vars or just use the provided credentials directly.
// For security in a real app we'd use .env, but for this one-off investigation script requested by the user, I'll use the provided credentials.

const CLIENT_ID = 'BAA_bixUooojj0XCHWl60y2SHzYv3xuiEj7aAc9u4mfncWw9-5iC5rS-rCOR8blFW-aUdeU7l8H3QRs4zM';
const SECRET_KEY = process.argv[2]; // Pass secret key as argument to avoid hardcoding in file if possible, or just hardcode if easier for this context. 

if (!SECRET_KEY) {
    console.error("Please provide the Secret Key as a command line argument.");
    process.exit(1);
}

const BASE_URL = 'https://api-m.paypal.com'; // Live Environment

async function getAccessToken() {
    const auth = Buffer.from(`${CLIENT_ID}:${SECRET_KEY}`).toString('base64');
    const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
}

async function listPlans(accessToken) {
    console.log("Fetching Plans...");
    // Fetch user created plans
    const response = await fetch(`${BASE_URL}/v1/billing/plans?page_size=20&total_required=true`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        console.error("Failed to list plans:", await response.text());
        return [];
    }

    const data = await response.json();
    console.log(`Found ${data.total_items} plans.`);
    return data.plans || [];
}

async function searchSubscriptions(accessToken) {
    console.log("Searching for transactions over the last 365 days (in 30-day chunks)...");

    const allTransactions = [];
    const endDate = new Date();
    // Look back 12 months (roughly 365 days)
    // We must respect the 31-day limit per request. 

    let currentEnd = new Date(endDate);

    for (let i = 0; i < 12; i++) {
        let currentStart = new Date(currentEnd);
        currentStart.setDate(currentEnd.getDate() - 30);

        console.log(`fetching: ${currentStart.toISOString().split('T')[0]} to ${currentEnd.toISOString().split('T')[0]}`);

        try {
            const url = `${BASE_URL}/v1/reporting/transactions?start_date=${currentStart.toISOString()}&end_date=${currentEnd.toISOString()}&fields=all&page_size=500&transaction_status=S`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error(`  - Failed chunk: ${await response.text()}`);
            } else {
                const data = await response.json();
                const found = data.transaction_details || [];
                console.log(`  - Found ${found.length} transactions.`);
                allTransactions.push(...found);
            }
        } catch (err) {
            console.error(`  - Error fetching chunk: ${err.message}`);
        }

        // Move window back
        currentEnd = new Date(currentStart);
        // Reduce fetching speed slightly to be nice to API
        // await new Promise(r => setTimeout(r, 200)); 
    }

    console.log(`Total transactions found: ${allTransactions.length}`);
    return allTransactions;
}

async function main() {
    try {
        const token = await getAccessToken();
        console.log("Authenticated successfully.");

        const plans = await listPlans(token);

        console.log("\n--- Plans Detail ---");
        plans.forEach(p => {
            console.log(`Plan ID: ${p.id} | Name: ${p.name} | Status: ${p.status} | Create Time: ${p.create_time}`);
        });

        // Retrieving accurate "active subscriber count" is hard via API without iterating. 
        // We will infer activity from transactions.
        const transactions = await searchSubscriptions(token);

        console.log("\n--- Recent Activity (Last 30 Days) ---");

        const categories = {
            standard: new Set(), // 80
            extended: new Set(), // 140
            lifetime: new Set(), // 800
            basic: new Set(),    // 30
            promo_75: new Set(), // 75.55
            other: new Set()
        };

        if (transactions.length > 0) {
            console.log("DEBUG: Sample Transaction Structure:");
            console.log(JSON.stringify(transactions[0], null, 2));
        }

        transactions.forEach(t => {
            const info = t.payer_info || {};
            const email = info.email_address || 'No Email';

            let name = 'No Name';
            if (info.payer_name) {
                name = info.payer_name.alternate_full_name ||
                    [info.payer_name.given_name, info.payer_name.surname].filter(Boolean).join(' ');
            } else if (t.shipping_info && t.shipping_info.name) {
                name = t.shipping_info.name;
            }

            const identifier = `${name} (${email})`;

            const amount = parseFloat(t.transaction_info.transaction_amount.value);
            // PayPal might use strings, so parsing is safer. 
            // Also checking strictly might miss currency conversions, but usually matching the exact plan price is a good start.

            if (amount === 80.00) {
                categories.standard.add(identifier);
            } else if (amount === 140.00) {
                categories.extended.add(identifier);
            } else if (amount === 800.00) {
                categories.lifetime.add(identifier);
            } else if (amount === 30.00) {
                categories.basic.add(identifier);
            } else if (amount === 75.55) {
                categories.promo_75.add(identifier);
            } else {
                categories.other.add(`${identifier} - ${amount} ${t.transaction_info.transaction_amount.currency_code}`);
            }
        });

        console.log(`\n--- ANALYSIS RESULT ---`);
        console.log(`Standard Plan (€80): ${categories.standard.size} users`);
        if (categories.standard.size > 0) console.log([...categories.standard]);

        console.log(`\nExtended Plan (€140): ${categories.extended.size} users`);
        if (categories.extended.size > 0) console.log([...categories.extended]);

        console.log(`\nLifetime Plan (€800): ${categories.lifetime.size} users`);
        if (categories.lifetime.size > 0) console.log([...categories.lifetime]);

        console.log(`\nBasic Plan (€30/$30): ${categories.basic.size} users`);
        if (categories.basic.size > 0) console.log([...categories.basic]);

        console.log(`\nPromo Plan (€75.55): ${categories.promo_75.size} users`);
        if (categories.promo_75.size > 0) console.log([...categories.promo_75]);

        console.log(`\nOther Amounts: ${categories.other.size} users`);
        if (categories.other.size > 0) console.log([...categories.other]);

    } catch (error) {
        console.error("Error:", error.message);
    }
}

main();
