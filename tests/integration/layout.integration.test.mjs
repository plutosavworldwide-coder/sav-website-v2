import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { DashboardLayout, mocks } from './layout.subject.mjs';

const user = { id: 'first-member', email: 'first@example.invalid' };
const profile = { role: 'user', subscription_status: 'active', subscription_type: 'standard', subscription_end_date: null };
const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;
let timers = [];

function reset() {
    Object.assign(mocks, {
        user, pathname: '/dashboard', profiles: { [user.id]: { ...profile } }, profileQueue: [],
        profileError: null, overrideError: null, listener: null, dashboard: null, mounts: 0, unmounts: 0,
    });
    timers = [];
    globalThis.setTimeout = callback => { timers.push(callback); return timers.length; };
    globalThis.clearTimeout = () => {};
}
async function renderLayout() {
    let renderer;
    await act(async () => { renderer = TestRenderer.create(React.createElement(DashboardLayout)); });
    return renderer;
}
async function dispose(renderer) {
    await act(async () => renderer.unmount());
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
}
const outlets = renderer => renderer.root.findAllByType('protected-outlet');
const text = node => typeof node === 'string' ? node : (node?.children || []).map(text).join('');

test('auth changes hide existing protected content before deferred network work runs', async () => {
    for (const event of ['SIGNED_IN', 'USER_UPDATED']) {
        reset(); const renderer = await renderLayout();
        assert.equal(outlets(renderer).length, 1);
        act(() => mocks.listener(event));
        assert.equal(outlets(renderer).length, 0);
        assert.match(text(renderer.toJSON()), /Preparing your dashboard/);
        assert.equal(timers.length, 1);
        await act(async () => timers.shift()());
        assert.equal(outlets(renderer).length, 1);
        await dispose(renderer);
    }
});

test('a pending prior-account refresh cannot restore old content after an auth change', async () => {
    reset(); const renderer = await renderLayout();
    let resolveOldProfile;
    const oldProfile = new Promise(resolve => { resolveOldProfile = resolve; });
    mocks.profileQueue.push(oldProfile);
    let pendingRefresh;
    await act(async () => { pendingRefresh = mocks.dashboard.refresh(); });
    assert.equal(outlets(renderer).length, 1);
    const nextUser = { id: 'next-member', email: 'next@example.invalid' };
    mocks.user = nextUser;
    mocks.profiles[nextUser.id] = { ...profile };
    act(() => mocks.listener('SIGNED_IN'));
    assert.equal(outlets(renderer).length, 0);
    await act(async () => { resolveOldProfile({ data: profile, error: null }); await pendingRefresh; });
    assert.equal(outlets(renderer).length, 0);
    await act(async () => timers.shift()());
    assert.equal(renderer.root.findByType('workspace-user').props.id, nextUser.id);
    assert.equal(outlets(renderer).length, 1);
    await dispose(renderer);
});

test('same-account profile refresh preserves mounted content and updates shared profile', async () => {
    reset(); const renderer = await renderLayout();
    mocks.profiles[user.id] = { ...profile, full_name: 'Updated member' };
    await act(async () => mocks.dashboard.refresh());
    assert.equal(mocks.dashboard.profile.full_name, 'Updated member');
    assert.equal(mocks.mounts, 1);
    assert.equal(mocks.unmounts, 0);
    await dispose(renderer);
});

test('lookup failures withhold protected content and retry without reporting expiry', async () => {
    reset(); mocks.profileError = new Error('Fixture network failure');
    const renderer = await renderLayout();
    assert.equal(outlets(renderer).length, 0);
    assert.equal(renderer.root.findAllByType('navigate-test').length, 0);
    assert.match(text(renderer.toJSON()), /Membership check unavailable/);
    mocks.profileError = null;
    await act(async () => renderer.root.findByType('button').props.onClick());
    assert.equal(outlets(renderer).length, 1);
    await dispose(renderer);
});

test('mixed-case and encoded admin URLs never mount protected content for ordinary members', async () => {
    for (const pathname of ['/ADMIN/', '/ad%6din', '/%61dmin']) {
        reset(); mocks.pathname = pathname; const renderer = await renderLayout();
        assert.equal(outlets(renderer).length, 0);
        assert.equal(renderer.root.findByType('navigate-test').props.to, '/dashboard');
        await dispose(renderer);
    }
});

test('sign-out immediately withholds content and redirects to signing', async () => {
    reset(); const renderer = await renderLayout();
    act(() => mocks.listener('SIGNED_OUT'));
    assert.equal(outlets(renderer).length, 0);
    assert.equal(renderer.root.findByType('navigate-test').props.to, '/signing');
    await dispose(renderer);
});
