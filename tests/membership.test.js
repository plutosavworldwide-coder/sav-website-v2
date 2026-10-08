import test from 'node:test';
import assert from 'node:assert/strict';
import { matchRoutes } from 'react-router-dom';
import { buildWeekAccessMap, getDashboardRedirect, resolveMembership, WEEKS } from '../src/lib/membership.js';

const NOW = Date.parse('2026-10-08T12:00:00Z');
const active = {
    role: 'user',
    subscription_status: 'active',
    subscription_type: 'standard',
    subscription_start_date: '2026-10-01T12:00:00Z',
    subscription_end_date: '2026-11-01T12:00:00Z',
};

const allOpen = map => WEEKS.every(weekId => map[weekId].unlocked);
const allLocked = map => WEEKS.every(weekId => !map[weekId].unlocked);

test('active standard memberships can enter and watch every curriculum week', () => {
    const membership = resolveMembership(active, NOW);
    assert.equal(membership.plan, 'standard');
    assert.equal(membership.status, 'active');
    assert.equal(membership.label, 'Standard Plan');
    assert.equal(membership.canEnterDashboard, true);
    assert.equal(membership.canWatchCourses, true);
    assert.equal(allOpen(buildWeekAccessMap(active, [], NOW)), true);
});

test('legacy active null plans default to standard without changing any stored fields', () => {
    const legacy = { ...active, subscription_type: null, subscription_start_date: null, subscription_end_date: null };
    const before = { ...legacy };
    const membership = resolveMembership(legacy, NOW);
    assert.equal(membership.plan, 'standard');
    assert.equal(membership.label, 'Standard Plan');
    assert.equal(membership.canWatchCourses, true);
    assert.equal(allOpen(buildWeekAccessMap(legacy, [], NOW)), true);
    assert.deepEqual(legacy, before);
});

test('a future start date does not drip-lock active standard memberships', () => {
    const profile = { ...active, subscription_start_date: '2027-01-01T00:00:00Z' };
    assert.equal(resolveMembership(profile, NOW).canWatchCourses, true);
    assert.equal(allOpen(buildWeekAccessMap(profile, [], NOW)), true);
});

test('extended plans keep their plan identity and all curriculum access', () => {
    const profile = { ...active, subscription_type: 'extended' };
    assert.equal(resolveMembership(profile, NOW).plan, 'extended');
    assert.equal(resolveMembership(profile, NOW).label, 'Extended Plan');
    assert.equal(allOpen(buildWeekAccessMap(profile, [], NOW)), true);
});

test('legacy plan casing preserves known memberships while unknown plans stay rejected', () => {
    for (const [subscription_type, plan, canWatchCourses] of [
        ['Standard', 'standard', true],
        ['EXTENDED', 'extended', true],
        ['Lifetime', 'lifetime', true],
        ['INDICATORS_ONLY', 'indicators_only', false],
    ]) {
        const membership = resolveMembership({ ...active, subscription_type }, NOW);
        assert.equal(membership.plan, plan);
        assert.equal(membership.status, 'active');
        assert.equal(membership.canWatchCourses, canWatchCourses);
    }
    const unknown = resolveMembership({ ...active, subscription_type: 'UNKNOWN_PLAN' }, NOW);
    assert.equal(unknown.status, 'invalid');
    assert.equal(unknown.canEnterDashboard, false);
});

test('elapsed expiry dates deny access even when status is active or plan is null', () => {
    for (const subscription_type of ['standard', 'extended', 'indicators_only', null]) {
        const profile = { ...active, subscription_type, subscription_end_date: '2026-10-07T12:00:00Z' };
        const membership = resolveMembership(profile, NOW);
        assert.equal(membership.status, 'expired');
        assert.equal(membership.canEnterDashboard, false);
        assert.equal(membership.canWatchCourses, false);
        assert.equal(allLocked(buildWeekAccessMap(profile, [], NOW)), true);
    }
});

test('access expires at the end timestamp', () => {
    const profile = { ...active, subscription_end_date: new Date(NOW).toISOString() };
    assert.equal(resolveMembership(profile, NOW).status, 'expired');
});

test('inactive, suspended, cancelled, and explicitly expired memberships stay denied', () => {
    for (const subscription_status of ['inactive', 'suspended', 'cancelled', 'expired', null]) {
        const profile = { ...active, subscription_status };
        const membership = resolveMembership(profile, NOW);
        assert.equal(membership.canEnterDashboard, false);
        assert.equal(membership.canWatchCourses, false);
        assert.equal(allLocked(buildWeekAccessMap(profile, [{ week_id: 'week-1', state: 'open' }], NOW)), true);
    }
});

test('inactive null plans are not promoted to standard', () => {
    const membership = resolveMembership({ ...active, subscription_status: 'inactive', subscription_type: null }, NOW);
    assert.equal(membership.plan, null);
    assert.equal(membership.label, 'No plan');
    assert.equal(membership.canEnterDashboard, false);
});

test('active lifetime memberships have no expiry but still require active status', () => {
    for (const subscription_end_date of [null, '2020-01-01T00:00:00Z']) {
        const profile = { ...active, subscription_type: 'lifetime', subscription_end_date };
        assert.equal(resolveMembership(profile, NOW).canWatchCourses, true);
        assert.equal(allOpen(buildWeekAccessMap(profile, [], NOW)), true);
        assert.equal(resolveMembership({ ...profile, subscription_status: 'expired' }, NOW).canEnterDashboard, false);
    }
});

test('indicators-only members can enter their workspace but cannot watch curriculum', () => {
    const profile = { ...active, subscription_type: 'indicators_only' };
    const membership = resolveMembership(profile, NOW);
    assert.equal(membership.canEnterDashboard, true);
    assert.equal(membership.canWatchCourses, false);
    assert.equal(membership.label, 'Indicators Plan');
    assert.equal(allLocked(buildWeekAccessMap(profile, [{ week_id: 'week-1', state: 'open' }], NOW)), true);
});

test('admins keep consistent dashboard and curriculum access regardless of plan status', () => {
    const profile = { ...active, role: 'admin', subscription_type: null, subscription_status: 'inactive', subscription_end_date: '2020-01-01T00:00:00Z' };
    const membership = resolveMembership(profile, NOW);
    assert.equal(membership.isAdmin, true);
    assert.equal(membership.label, 'Administrator');
    assert.equal(membership.canEnterDashboard, true);
    assert.equal(membership.canWatchCourses, true);
    assert.equal(allOpen(buildWeekAccessMap(profile, [{ week_id: 'week-1', state: 'locked' }], NOW)), true);
});

test('explicit administrator locks remain in force for eligible members', () => {
    const overrides = [{ week_id: 'week-1', state: 'locked' }, { week_id: 'week-2', state: 'open' }];
    const map = buildWeekAccessMap(active, overrides, NOW);
    assert.deepEqual(map['week-1'], { unlocked: false, reason: 'Locked by administrator' });
    assert.deepEqual(map['week-2'], { unlocked: true, reason: 'Admin override' });
    assert.equal(map['week-3'].unlocked, true);
    assert.deepEqual(overrides, [{ week_id: 'week-1', state: 'locked' }, { week_id: 'week-2', state: 'open' }]);
});

test('open overrides cannot extend expired subscriptions', () => {
    const profile = { ...active, subscription_end_date: '2026-10-07T12:00:00Z' };
    assert.equal(allLocked(buildWeekAccessMap(profile, WEEKS.map(week_id => ({ week_id, state: 'open' })), NOW)), true);
});

test('missing profiles and unknown explicit plans do not grant membership', () => {
    assert.equal(resolveMembership(null, NOW).status, 'missing');
    assert.equal(allLocked(buildWeekAccessMap(null, [], NOW)), true);
    const profile = { ...active, subscription_type: 'unknown' };
    assert.equal(resolveMembership(profile, NOW).status, 'invalid');
    assert.equal(resolveMembership(profile, NOW).canEnterDashboard, false);
});

test('malformed expiry dates are unavailable rather than falsely active or expired', () => {
    const membership = resolveMembership({ ...active, subscription_end_date: 'not-a-date' }, NOW);
    assert.equal(membership.status, 'invalid');
    assert.equal(membership.canEnterDashboard, false);
});

test('non-admin guards deny every URL alias that React Router resolves to the admin page', () => {
    const membership = resolveMembership(active, NOW);
    const routes = [{ path: '/admin' }];
    for (const pathname of ['/admin', '/Admin', '/ADMIN/', '/admin//', '/ad%6din', '/%61dmin']) {
        assert.equal(matchRoutes(routes, pathname)?.at(-1).route.path, '/admin');
        assert.equal(getDashboardRedirect(membership, pathname), '/dashboard');
    }
});

test('indicator members can use tools and account aliases but cannot enter protected learning or admin routes', () => {
    const membership = resolveMembership({ ...active, subscription_type: 'indicators_only' }, NOW);
    for (const pathname of ['/indicators', '/INDICATORS/', '/%69ndicators', '/profile/', '/DASHBOARD/PROFILE/', '/dashboard/%70rofile']) {
        assert.equal(getDashboardRedirect(membership, pathname), null);
    }
    for (const pathname of ['/dashboard', '/dashboard/time-price-energy-intro', '/ADMIN', '/ad%6din', '/daily-reviews', '/scheduled-sessions']) {
        assert.equal(getDashboardRedirect(membership, pathname), '/indicators');
    }
});

test('route normalization never grants inactive access and preserves legitimate administrator access', () => {
    const inactive = resolveMembership({ ...active, subscription_status: 'inactive' }, NOW);
    const admin = resolveMembership({ ...active, role: 'admin' }, NOW);
    for (const pathname of ['/ADMIN/', '/ad%6din', '/DASHBOARD/PROFILE/']) {
        assert.equal(getDashboardRedirect(inactive, pathname), '/subscription-expired');
        assert.equal(getDashboardRedirect(admin, pathname), null);
    }
    assert.equal(getDashboardRedirect(resolveMembership(null, NOW), '/admin'), '/choose-plan');
});
