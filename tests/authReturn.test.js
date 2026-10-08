import test from 'node:test';
import assert from 'node:assert/strict';
import {
    clearPendingAuth, hasOAuthReturn, PENDING_AUTH_KEY, PENDING_AUTH_TTL_MS, PENDING_PLAN_KEY,
    readOAuthError, readPendingAuth, resolveAuthDestination, safeAuthNext, shouldHandleDashboardReturn, storePendingAuth,
} from '../src/lib/authReturn.js';
import { PURCHASE_PLANS } from '../src/lib/purchasePlans.js';

const NOW = 1000000;
const dashboard = { pathname: '/dashboard', search: '', hash: '' };
const createStorage = () => {
    const values = new Map();
    return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
};

test('dashboard OAuth code, token and error returns are intercepted before membership checks', () => {
    for (const [search, hash] of [
        ['?code=returned-code', ''], ['', '#access_token=returned-token&refresh_token=returned-refresh'],
        ['?error=access_denied', ''], ['', '#error_description=Login+cancelled'], ['?error_code=', ''],
    ]) {
        assert.equal(hasOAuthReturn(search, hash), true);
        assert.equal(shouldHandleDashboardReturn({ ...dashboard, search, hash }, createStorage(), NOW), true);
    }
    assert.equal(shouldHandleDashboardReturn(dashboard, createStorage(), NOW), false);
    assert.equal(shouldHandleDashboardReturn({ ...dashboard, pathname: '/admin', search: '?code=value' }, createStorage(), NOW), false);
});

test('a short-lived ordinary-login marker survives Supabase clearing the URL hash', () => {
    const storage = createStorage();
    storePendingAuth(storage, '/dashboard', null, NOW);
    assert.equal(shouldHandleDashboardReturn(dashboard, storage, NOW + 100), true);
    assert.deepEqual(resolveAuthDestination(null, readPendingAuth(storage, NOW + 100)), { path: '/dashboard' });
    clearPendingAuth(storage);
    assert.equal(shouldHandleDashboardReturn(dashboard, storage, NOW + 100), false);
});

test('purchase returns restore canonical pricing and infer payment when next is absent', () => {
    const storage = createStorage();
    const offered = PURCHASE_PLANS[0];
    storePendingAuth(storage, '/payment', { ...offered, price: '1', features: ['modified'] }, NOW);
    const pending = readPendingAuth(storage, NOW + 100);
    assert.equal(shouldHandleDashboardReturn(dashboard, storage, NOW + 100), true);
    assert.equal(pending.plan, offered);
    assert.deepEqual(resolveAuthDestination(null, pending), { path: '/payment', state: { plan: offered } });
    clearPendingAuth(storage);
    assert.equal(storage.getItem(PENDING_PLAN_KEY), null);
    assert.equal(storage.getItem(PENDING_AUTH_KEY), null);
});

test('a legacy canonical pending purchase still returns to payment without a new marker', () => {
    const storage = createStorage();
    storage.setItem(PENDING_PLAN_KEY, JSON.stringify(PURCHASE_PLANS[1]));
    assert.equal(shouldHandleDashboardReturn(dashboard, storage, NOW), true);
    assert.equal(resolveAuthDestination(null, readPendingAuth(storage, NOW)).path, '/payment');
});

test('expired or future markers do not redirect a normal dashboard visit to an old purchase', () => {
    for (const timestamp of [NOW + PENDING_AUTH_TTL_MS + 1, NOW - 1]) {
        const storage = createStorage();
        storePendingAuth(storage, '/payment', PURCHASE_PLANS[0], NOW);
        assert.equal(readPendingAuth(storage, timestamp), null);
        assert.equal(shouldHandleDashboardReturn(dashboard, storage, timestamp), false);
    }
});

test('missing, malformed and retired stored purchases never start payment', () => {
    for (const value of [null, '{bad-json', JSON.stringify({ name: 'Indicators Only' })]) {
        const storage = createStorage();
        storePendingAuth(storage, '/payment', null, NOW);
        if (value) storage.setItem(PENDING_PLAN_KEY, value);
        assert.deepEqual(resolveAuthDestination(null, readPendingAuth(storage, NOW)), { path: '/choose-plan', state: { planUnavailable: true } });
    }
});

test('return destinations accept supported internal routes and reject external or looping paths', () => {
    assert.equal(safeAuthNext('/dashboard/profile'), '/dashboard/profile');
    for (const path of ['https://example.invalid', '//example.invalid', '/\\example.invalid', '/%2f%2fexample.invalid', '/auth/callback', '/signing', '/unknown', '/dashboard?next=https://example.invalid']) {
        assert.equal(safeAuthNext(path), '/dashboard');
        assert.deepEqual(resolveAuthDestination(path, null), { path: '/dashboard' });
    }
    assert.deepEqual(resolveAuthDestination('/indicators', { next: '/dashboard', plan: PURCHASE_PLANS[0] }), { path: '/indicators' });
});

test('dashboard case and encoded aliases use the same return handling', () => {
    for (const pathname of ['/DASHBOARD/', '/dash%62oard', '/dashboard//']) {
        assert.equal(shouldHandleDashboardReturn({ ...dashboard, pathname, search: '?code=value' }, createStorage(), NOW), true);
    }
});

test('invalid or inaccessible session storage cannot redirect or prevent cleanup', () => {
    const storage = createStorage();
    storage.setItem(PENDING_AUTH_KEY, '{bad-json');
    storage.setItem(PENDING_PLAN_KEY, JSON.stringify(PURCHASE_PLANS[0]));
    assert.equal(readPendingAuth(storage, NOW), null);
    const blocked = { getItem() { throw new Error('Storage unavailable'); }, removeItem() { throw new Error('Storage unavailable'); } };
    assert.equal(readPendingAuth(blocked, NOW), null);
    assert.doesNotThrow(() => clearPendingAuth(blocked));
    assert.equal(shouldHandleDashboardReturn({ ...dashboard, hash: '#error=denied' }, blocked, NOW), true);
    assert.equal(readOAuthError('', '#error=denied'), 'denied');
    assert.match(readOAuthError('?error_code=', ''), /could not complete/);
});

test('starting ordinary sign-in removes an earlier purchase before storing its return marker', () => {
    const storage = createStorage();
    storePendingAuth(storage, '/payment', PURCHASE_PLANS[0], NOW);
    storePendingAuth(storage, '/dashboard', null, NOW + 10);
    assert.equal(storage.getItem(PENDING_PLAN_KEY), null);
    assert.deepEqual(readPendingAuth(storage, NOW + 20), { next: '/dashboard', plan: null });
});
