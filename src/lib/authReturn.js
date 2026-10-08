import { resolvePurchasePlan } from './purchasePlans.js';

export const PENDING_PLAN_KEY = 'savfx:pending-plan';
export const PENDING_AUTH_KEY = 'savfx:pending-auth';
export const PENDING_AUTH_TTL_MS = 10 * 60 * 1000;

const safePaths = new Set([
    '/dashboard', '/dashboard/profile', '/profile', '/dashboard/time-price-energy-intro',
    '/dashboard/market-mastery', '/dashboard/weekly-livestreams', '/dashboard/gordian-paradox',
    '/daily-reviews', '/indicators', '/scheduled-sessions', '/admin', '/choose-plan', '/payment',
]);

export const safeAuthNext = value => safePaths.has(value) ? value : '/dashboard';

export function getAuthStorage() {
    try { return globalThis.sessionStorage || null; } catch { return null; }
}

export function clearPendingAuth(storage) {
    for (const key of [PENDING_AUTH_KEY, PENDING_PLAN_KEY]) {
        try { storage?.removeItem(key); } catch { /* Sign-in can still finish when storage is unavailable. */ }
    }
}

export function storePendingAuth(storage, next, plan, now = Date.now()) {
    const purchasePlan = resolvePurchasePlan(plan);
    if (!storage) throw new Error('Your browser could not save the sign-in return. Please enable session storage and try again.');
    clearPendingAuth(storage);
    if (purchasePlan) storage.setItem(PENDING_PLAN_KEY, JSON.stringify(purchasePlan));
    storage.setItem(PENDING_AUTH_KEY, JSON.stringify({ next: safeAuthNext(next), startedAt: now }));
}

export function readPendingAuth(storage, now = Date.now()) {
    try {
        const markerValue = storage?.getItem(PENDING_AUTH_KEY);
        const marker = markerValue ? JSON.parse(markerValue) : null;
        if (markerValue && (!marker || !Number.isFinite(marker.startedAt) || now < marker.startedAt || now - marker.startedAt > PENDING_AUTH_TTL_MS)) return null;
        const planValue = storage?.getItem(PENDING_PLAN_KEY);
        let plan = null;
        try { plan = planValue ? resolvePurchasePlan(JSON.parse(planValue)) : null; } catch { /* Invalid stored plans are never restored. */ }
        if (!marker && !plan) return null;
        return { next: marker ? safeAuthNext(marker.next) : '/payment', plan };
    } catch {
        return null;
    }
}

const urlParams = (search, hash) => [new URLSearchParams(search), new URLSearchParams((hash || '').replace(/^#/, ''))];

export function hasOAuthReturn(search, hash) {
    return urlParams(search, hash).some(params => ['code', 'access_token', 'refresh_token', 'error', 'error_description', 'error_code'].some(key => params.has(key)));
}

export function readOAuthError(search, hash) {
    const [query, fragment] = urlParams(search, hash);
    const message = fragment.get('error_description') || query.get('error_description') || fragment.get('error') || query.get('error');
    if (message) return message;
    return [query, fragment].some(params => ['error', 'error_description', 'error_code'].some(key => params.has(key)))
        ? 'We could not complete Google sign in. Please try again.'
        : null;
}

export function shouldHandleDashboardReturn(location, storage, now = Date.now()) {
    let path = location.pathname || '/';
    try { path = decodeURIComponent(path); } catch { return false; }
    if (path.toLowerCase().replace(/\/+$/, '') !== '/dashboard') return false;
    return hasOAuthReturn(location.search, location.hash) || readPendingAuth(storage, now) !== null;
}

export function resolveAuthDestination(explicitNext, pending) {
    const next = safeAuthNext(explicitNext ?? (pending?.plan ? '/payment' : pending?.next));
    if (next !== '/payment') return { path: next };
    const plan = resolvePurchasePlan(pending?.plan);
    return plan
        ? { path: '/payment', state: { plan } }
        : { path: '/choose-plan', state: { planUnavailable: true } };
}
