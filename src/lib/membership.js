const PLAN_LABELS = {
    standard: 'Standard Plan',
    extended: 'Extended Plan',
    lifetime: 'Lifetime Plan',
    indicators_only: 'Indicators Plan',
};

export const WEEKS = Array.from({ length: 14 }, (_, index) => `week-${index + 1}`);

/**
 * Resolve the membership policy once for navigation and curriculum access.
 * Legacy active profiles without a plan use the migration's standard default.
 * Start dates do not release individual weeks: active course plans include all weeks.
 */
export function resolveMembership(profile, now = Date.now()) {
    const isAdmin = profile?.role === 'admin';
    const subscriptionStatus = profile?.subscription_status;
    const subscriptionType = typeof profile?.subscription_type === 'string'
        ? profile.subscription_type.toLowerCase()
        : profile?.subscription_type;
    const plan = profile?.subscription_type == null && subscriptionStatus === 'active'
        ? 'standard'
        : subscriptionType || null;
    const membership = {
        plan,
        status: 'missing',
        reason: 'Membership profile missing',
        canEnterDashboard: false,
        canWatchCourses: false,
        isAdmin,
        label: isAdmin ? 'Administrator' : PLAN_LABELS[plan] || 'No plan',
    };

    if (!profile) return membership;
    if (isAdmin) {
        return { ...membership, status: 'active', reason: 'Admin access', canEnterDashboard: true, canWatchCourses: true };
    }
    if (subscriptionStatus !== 'active') {
        const expired = subscriptionStatus === 'expired';
        return { ...membership, status: expired ? 'expired' : 'inactive', reason: expired ? 'Subscription expired' : 'Subscription inactive' };
    }
    if (!Object.hasOwn(PLAN_LABELS, plan)) {
        return { ...membership, status: 'invalid', reason: 'Membership plan unavailable' };
    }

    // A lifetime plan has no expiry. Never move or extend a paid plan's dates.
    if (plan !== 'lifetime' && profile.subscription_end_date) {
        const end = new Date(profile.subscription_end_date).getTime();
        const timestamp = now instanceof Date ? now.getTime() : Number(now);
        if (!Number.isFinite(end) || !Number.isFinite(timestamp)) {
            return { ...membership, status: 'invalid', reason: 'Membership dates unavailable' };
        }
        if (end <= timestamp) {
            return { ...membership, status: 'expired', reason: 'Subscription expired' };
        }
    }

    const canWatchCourses = plan !== 'indicators_only';
    return {
        ...membership,
        status: 'active',
        reason: canWatchCourses ? 'Subscription' : 'Indicators-only membership',
        canEnterDashboard: true,
        canWatchCourses,
    };
}

/**
 * Explicit admin locks are respected for eligible course members. Overrides never
 * bypass membership expiry or give indicators-only members curriculum access.
 */
export function buildWeekAccessMap(profile, overrides = [], now = Date.now()) {
    const membership = resolveMembership(profile, now);
    const overrideStates = new Map(overrides.map(override => [override.week_id, override.state]));
    return Object.fromEntries(WEEKS.map(weekId => {
        let unlocked = membership.canWatchCourses;
        let reason = membership.reason;
        if (unlocked && !membership.isAdmin) {
            const override = overrideStates.get(weekId);
            if (override === 'locked') {
                unlocked = false;
                reason = 'Locked by administrator';
            } else if (override === 'open') {
                reason = 'Admin override';
            }
        }
        return [weekId, { unlocked, reason }];
    }));
}

/** Match React Router's decoded, case-insensitive paths before applying route policy. */
export function getDashboardRedirect(membership, pathname) {
    let path = pathname || '/';
    try { path = decodeURIComponent(path); } catch { /* A malformed URL must not skip membership checks. */ }
    path = path.toLowerCase().replace(/\/+$/, '') || '/';

    if (!membership.canEnterDashboard) {
        return membership.status === 'missing' ? '/choose-plan' : '/subscription-expired';
    }
    if ((path === '/admin' || path.startsWith('/admin/')) && !membership.isAdmin) {
        return membership.canWatchCourses ? '/dashboard' : '/indicators';
    }
    if (!membership.canWatchCourses && !['/indicators', '/profile', '/dashboard/profile'].includes(path)) {
        return '/indicators';
    }
    return null;
}
