/**
 * Access Engine
 * 
 * Handles subscription-based content access logic with admin override support.
 */

import { supabase } from './supabase';

// Week definitions for the curriculum
export const WEEKS = [
    'week-1', 'week-2', 'week-3', 'week-4',
    'week-5', 'week-6', 'week-7', 'week-8',
    'week-9', 'week-10', 'week-11', 'week-12',
    'week-13', 'week-14'
];

// Subscription unlock rules
const UNLOCK_RULES = {
    standard: {
        // All weeks unlocked
        allAccess: true
    },
    extended: {
        // All weeks unlocked
        allAccess: true
    },
    lifetime: {
        // All weeks unlocked
        allAccess: true
    }
};

/**
 * Calculate days since subscription started
 */
function daysSinceStart(startDate) {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const diffMs = now - start;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get unlocked weeks based on subscription type and start date
 */
function getSubscriptionUnlockedWeeks(subscriptionType, startDate) {
    if (!subscriptionType) return [];

    const rules = UNLOCK_RULES[subscriptionType.toLowerCase()];
    if (!rules) return [];

    // Lifetime gets everything
    if (rules.allAccess) {
        return [...WEEKS];
    }

    // Extended gets first 8 weeks
    if (rules.maxWeeks) {
        return WEEKS.slice(0, rules.maxWeeks);
    }

    // Standard: progressive unlock based on time
    if (rules.weeksPerPeriod && rules.periodDays) {
        const days = daysSinceStart(startDate);
        const periods = Math.floor(days / rules.periodDays) + 1; // +1 for initial period
        const unlockedCount = Math.min(periods * rules.weeksPerPeriod, WEEKS.length);
        return WEEKS.slice(0, unlockedCount);
    }

    return [];
}

/**
 * Fetch user's access overrides from database
 */
async function fetchOverrides(userId) {
    const { data, error } = await supabase
        .from('access_overrides')
        .select('week_id, state')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching overrides:', error);
        return {};
    }

    // Convert to map: { 'week-1': 'open', 'week-5': 'locked' }
    const overrideMap = {};
    data?.forEach(o => {
        overrideMap[o.week_id] = o.state;
    });
    return overrideMap;
}

/**
 * Get full access map for a user
 * Returns: { weekId: { unlocked: boolean, reason: string } }
 */
export async function getUserAccessMap(user) {
    if (!user?.id) {
        return WEEKS.reduce((acc, weekId) => {
            acc[weekId] = { unlocked: false, reason: 'Not logged in' };
            return acc;
        }, {});
    }

    // Fetch user profile
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, subscription_type, subscription_start_date, subscription_status, subscription_end_date')
        .eq('id', user.id)
        .single();

    if (error || !profile) {
        return WEEKS.reduce((acc, weekId) => {
            acc[weekId] = { unlocked: false, reason: 'Profile not found' };
            return acc;
        }, {});
    }

    // Admin gets full access
    if (profile.role === 'admin') {
        return WEEKS.reduce((acc, weekId) => {
            acc[weekId] = { unlocked: true, reason: 'Admin access' };
            return acc;
        }, {});
    }

    // Check subscription status
    if (profile.subscription_status !== 'active') {
        return WEEKS.reduce((acc, weekId) => {
            acc[weekId] = { unlocked: false, reason: 'Subscription inactive' };
            return acc;
        }, {});
    }

    // Check subscription end date (skip for lifetime which has null end_date)
    if (profile.subscription_end_date) {
        const endDate = new Date(profile.subscription_end_date);
        if (endDate < new Date()) {
            return WEEKS.reduce((acc, weekId) => {
                acc[weekId] = { unlocked: false, reason: 'Subscription expired' };
                return acc;
            }, {});
        }
    }

    // Get subscription-based unlocks
    const subscriptionUnlocked = getSubscriptionUnlockedWeeks(
        profile.subscription_type,
        profile.subscription_start_date
    );

    // Fetch overrides
    const overrides = await fetchOverrides(user.id);

    // Build final access map
    const accessMap = {};
    WEEKS.forEach(weekId => {
        const override = overrides[weekId];

        if (override === 'open') {
            accessMap[weekId] = { unlocked: true, reason: 'Admin override' };
        } else if (override === 'locked') {
            accessMap[weekId] = { unlocked: false, reason: 'Admin locked' };
        } else if (subscriptionUnlocked.includes(weekId)) {
            accessMap[weekId] = { unlocked: true, reason: 'Subscription' };
        } else {
            accessMap[weekId] = { unlocked: false, reason: 'Not in plan' };
        }
    });

    return accessMap;
}

/**
 * Check if user can access a specific week
 */
export async function canAccessWeek(user, weekId) {
    const accessMap = await getUserAccessMap(user);
    return accessMap[weekId]?.unlocked ?? false;
}

/**
 * Get list of unlocked week IDs for a user
 */
export async function getUnlockedWeeks(user) {
    const accessMap = await getUserAccessMap(user);
    return Object.entries(accessMap)
        .filter(([_, access]) => access.unlocked)
        .map(([weekId, _]) => weekId);
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId) {
    if (!userId) return false;

    const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    return data?.role === 'admin';
}

/**
 * Set access override (admin only)
 */
export async function setAccessOverride(userId, weekId, state, adminId) {
    if (state === null) {
        // Remove override
        const { error } = await supabase
            .from('access_overrides')
            .delete()
            .eq('user_id', userId)
            .eq('week_id', weekId);
        return { error };
    }

    // Set or update override
    const { error } = await supabase
        .from('access_overrides')
        .upsert({
            user_id: userId,
            week_id: weekId,
            state,
            created_by: adminId
        }, { onConflict: 'user_id,week_id' });

    return { error };
}
