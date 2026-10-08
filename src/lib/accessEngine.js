/**
 * Access Engine
 * 
 * Handles subscription-based content access logic with admin override support.
 */

import { supabase } from './supabase';
import { buildWeekAccessMap, resolveMembership, WEEKS } from './membership';

// Week definitions for the curriculum
export { WEEKS };

/**
 * Get full access map for a user
 * Returns: { weekId: { unlocked: boolean, reason: string } }
 */
export async function getUserAccessMap(user, options = {}) {
    if (!user?.id) {
        return WEEKS.reduce((acc, weekId) => {
            acc[weekId] = { unlocked: false, reason: 'Not logged in' };
            return acc;
        }, {});
    }

    let profile = options.profile;
    if (!Object.hasOwn(options, 'profile')) {
        const { data, error } = await supabase
            .from('profiles')
            .select('role, subscription_type, subscription_start_date, subscription_status, subscription_end_date')
            .eq('id', user.id)
            .maybeSingle();
        if (error) throw new Error('Membership lookup unavailable');
        profile = data;
    }
    const membership = resolveMembership(profile, options.now);
    if (membership.status === 'invalid') throw new Error('Membership details unavailable');
    if (!membership.canWatchCourses || membership.isAdmin) {
        return buildWeekAccessMap(profile, [], options.now);
    }

    const { data: overrides, error } = await supabase
        .from('access_overrides')
        .select('week_id, state')
        .eq('user_id', user.id);
    if (error) throw new Error('Course access lookup unavailable');
    return buildWeekAccessMap(profile, overrides || [], options.now);
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

    if (error) throw new Error('Admin access lookup unavailable');
    return resolveMembership(data).isAdmin;
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
