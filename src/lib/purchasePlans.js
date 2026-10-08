// The only plans offered for new purchases. Membership policy for existing
// accounts is intentionally independent of this catalog.
const plans = [
    {
        name: "Standard Access",
        category: "mentorship",
        price: "80",
        period: "/month",
        description: "Core mentorship and daily guidance.",
        features: ["30 days of curriculum access", "Daily Bias / Routine Lecture", "Live Session Lectures", "Access to Telegram & Discord", "Access to Quarterly & SSC Indicator Tool", "Access to SMT Range based Indicator", "Access to Time based PDA finder (Manual Edition)"],
        delay: 0.2,
        highlight: false
    },
    {
        name: "Extended Access",
        category: "mentorship",
        price: "140",
        period: "/2 months",
        description: "Deep dive with extended access to mentorship.",
        features: ["60 days of curriculum access", "Daily Bias / Routine Lecture", "Live Session Lectures", "Access to Telegram & Discord", "All Indicator Tools Included"],
        popular: true,
        delay: 0.3,
        highlight: true
    },
    {
        name: "Lifetime Edition",
        category: "mentorship",
        price: "800",
        period: "/lifetime",
        description: "Permanent, unrestricted access.",
        features: ["Lifetime Lectures", "Daily Bias / Routine Lecture", "Live Session Lectures", "Access to Telegram & Discord", "All Indicator Tools Included", "Access to Time based PDA (Smart Edition)", "Access to a 1 on 1 session"],
        delay: 0.5,
        highlight: false
    }
];

export const PURCHASE_PLANS = Object.freeze(plans.map(plan => Object.freeze({
    ...plan,
    features: Object.freeze([...plan.features]),
})));

// Navigation and session storage can contain old or modified plan objects.
// Resolve by an offered name and always use canonical pricing and metadata.
export function resolvePurchasePlan(candidate) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate) || typeof candidate.name !== 'string') return null;
    return PURCHASE_PLANS.find(plan => plan.name === candidate.name) || null;
}
