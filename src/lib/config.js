
export const PAYPAL_CONFIG = {
    // Replace with your actual PayPal Client ID from developer.paypal.com
    clientId: "ASMtybhnFMdAuSQtlkjj7FiZxfb2muN6jCt6LnNrOpGrg2nu6RxFocHWklqo5zWw2UByrV-3R7a1FA77",
    currency: "EUR",
    intent: "subscription"
};

export const PAYPAL_PLANS = {
    // Keys MUST match plan names from ChoosePlan.jsx and Pricing.jsx
    "Indicators Only": "P-8FD866303K0149612NGB7XUI",
    "Standard Access": "P-7KL844720V653143GNGB7XUQ",
    "Extended Access": "P-62Y35020WC550063BNGB7XUY",
    // Lifetime is handled separately as a one-time payment (not subscription)
};
