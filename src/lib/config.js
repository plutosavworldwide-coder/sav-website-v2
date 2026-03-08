
export const PAYPAL_CONFIG = {
    // Replace with your actual PayPal Client ID from developer.paypal.com
    clientId: "ASMtybhnFMdAuSQtlkjj7FiZxfb2muN6jCt6LnNrOpGrg2nu6RxFocHWklqo5zWw2UByrV-3R7a1FA77",
    currency: "EUR",
    intent: "subscription"
};

export const PAYPAL_PLANS = {
    // Replace these with your actual PayPal Subscription Plan IDs (P-...)
    "Indicators": "P-8FD866303K0149612NGB7XUI",
    "Standard Plan": "P-7KL844720V653143GNGB7XUQ",
    "Extended Plan": "P-62Y35020WC550063BNGB7XUY",
    "Lifetime Plan": "P-LIFETIME_PLAN_ID" // Needs separate one-time payment logic if not subscription
};
