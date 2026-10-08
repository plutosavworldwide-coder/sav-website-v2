import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { SecureVideoPlayer, Course, mocks } from './subject.mjs';

Object.defineProperty(globalThis, 'performance', { configurable: true, value: { now: () => mocks.now } });
globalThis.document = { addEventListener() {}, removeEventListener() {}, getElementById() { return null; } };

function reset() {
    const user = { id: 'test-user', email: 'test@example.invalid' };
    Object.assign(mocks, {
        now: 0, players: new Map(), rows: [], saves: [], failNextSave: false, pendingSave: null,
        resolveSave: null, progressError: null, pendingProgress: false, resolveProgress: null,
        authUser: user, authError: null, progressLoads: 0, focusedIds: [],
        dashboard: { user, membership: { canWatchCourses: true }, accessMap: { 'week-1': { unlocked: true }, 'week-2': { unlocked: true } } },
    });
}
function text(node) { return typeof node === 'string' || typeof node === 'number' ? String(node) : (node.children || []).map(text).join(''); }
function button(renderer, label) { return renderer.root.findAllByType('button').find(node => text(node).includes(label)); }
function percent(renderer) { return renderer.root.findAll(node => node.props.role === 'progressbar')[0]?.props['aria-valuenow']; }
function event(renderer, state) {
    const props = renderer.root.findByType('youtube-test').props;
    props.onStateChange({ data: state, target: mocks.players.get(props.videoId) });
}
async function eligible(renderer) {
    await act(async () => {
        event(renderer, 1);
        mocks.players.get(renderer.root.findByType('youtube-test').props.videoId).position = 95;
        mocks.now += 95000;
        event(renderer, 2);
    });
}
async function renderCourse() { let renderer; await act(async () => { renderer = TestRenderer.create(React.createElement(Course), { createNodeMock: element => element.type === 'button' ? { focus: () => mocks.focusedIds.push(element.props.id) } : null }); }); return renderer; }
async function dispose(renderer) { await act(async () => renderer.unmount()); }

test('unwatched manual completion and seek-to-end are rejected', async () => {
    reset(); const renderer = await renderCourse();
    const completeButton = button(renderer, 'Watch to complete');
    assert.equal(completeButton.props.disabled, true);
    await act(async () => {
        completeButton.props.onClick(); event(renderer, 1);
        mocks.now = 1000; mocks.players.get('lesson-a').position = 100; event(renderer, 0);
    });
    assert.equal(mocks.saves.length, 0);
    assert.equal(percent(renderer), 0);
    await dispose(renderer);
});

test('watched completion saves once and next video starts at zero', async () => {
    reset(); const renderer = await renderCourse(); await eligible(renderer);
    assert.equal(button(renderer, 'Complete & continue').props.disabled, false);
    const oldProps = renderer.root.findByType('youtube-test').props;
    const oldPlayer = mocks.players.get('lesson-a');
    await act(async () => { oldPlayer.position = 100; mocks.now = 100000; event(renderer, 0); });
    assert.deepEqual(mocks.saves, [{ user_id: 'test-user', video_id: 'lesson-a' }]);
    assert.equal(percent(renderer), 25);
    assert.equal(renderer.root.findByType('youtube-test').props.videoId, 'lesson-b');
    assert.deepEqual(mocks.players.get('lesson-b').seekCalls, []);
    assert.equal(button(renderer, 'Watch to complete').props.disabled, true);
    await act(async () => oldProps.onStateChange({ data: 0, target: oldPlayer }));
    assert.equal(mocks.saves.length, 1);
    await dispose(renderer);
});

test('failed saves remain uncompleted, deduplicate repeated clicks, and allow retry', async () => {
    reset(); const renderer = await renderCourse(); await eligible(renderer); mocks.failNextSave = true;
    const completeButton = button(renderer, 'Complete & continue');
    await act(async () => { completeButton.props.onClick(); completeButton.props.onClick(); });
    assert.equal(mocks.saves.length, 1);
    assert.match(text(renderer.root.find(node => node.props.role === 'alert')), /could not be saved/);
    assert.equal(percent(renderer), 0);
    assert.equal(renderer.root.findByType('youtube-test').props.videoId, 'lesson-a');
    assert.equal(button(renderer, 'Retry saving').props.disabled, false);
    await act(async () => button(renderer, 'Retry saving').props.onClick());
    assert.equal(mocks.saves.length, 2);
    assert.equal(percent(renderer), 25);
    assert.equal(renderer.root.findAll(node => node.props.role === 'alert').length, 0);
    await dispose(renderer);
});

test('automatic end completion failures remain eligible for manual retry', async () => {
    reset(); const renderer = await renderCourse(); await eligible(renderer); mocks.failNextSave = true;
    await act(async () => { mocks.players.get('lesson-a').position = 100; mocks.now = 100000; event(renderer, 0); });
    assert.equal(percent(renderer), 0);
    assert.equal(button(renderer, 'Retry saving').props.disabled, false);
    await act(async () => button(renderer, 'Retry saving').props.onClick());
    assert.equal(percent(renderer), 25);
    await dispose(renderer);
});

test('late saves preserve a newly selected module and retain the original source ID', async () => {
    reset(); const renderer = await renderCourse(); await eligible(renderer); mocks.pendingSave = true;
    await act(async () => { button(renderer, 'Complete & continue').props.onClick(); });
    await act(async () => { button(renderer, 'Shared source lesson').props.onClick(); });
    await act(async () => mocks.resolveSave({ error: null }));
    assert.deepEqual(mocks.saves, [{ user_id: 'test-user', video_id: 'lesson-a' }]);
    assert.equal(renderer.root.findByType('youtube-test').props.videoId, 'lesson-b');
    assert.equal(rendererTitle(renderer), 'Shared source lesson');
    assert.equal(percent(renderer), 25);
    await dispose(renderer);
});

test('shared-source module selection and sequential continuation never jump backward', async () => {
    reset(); const renderer = await renderCourse();
    await act(async () => button(renderer, 'Second lesson').props.onClick());
    await eligible(renderer);
    const oldProps = renderer.root.findByType('youtube-test').props;
    const oldPlayer = mocks.players.get('lesson-b');
    await act(async () => button(renderer, 'Complete & continue').props.onClick());
    assert.equal(rendererTitle(renderer), 'Shared source lesson');
    assert.notEqual(mocks.players.get('lesson-b'), oldPlayer);
    assert.deepEqual(mocks.players.get('lesson-b').seekCalls, []);
    assert.equal(percent(renderer), 50);
    await act(async () => oldProps.onStateChange({ data: 0, target: oldPlayer }));
    assert.equal(mocks.saves.length, 1);
    assert.equal(rendererTitle(renderer), 'Shared source lesson');
    await act(async () => button(renderer, 'Next lesson').props.onClick());
    assert.equal(rendererTitle(renderer), 'Final lesson');
    assert.equal(mocks.saves.length, 1);
    await dispose(renderer);
});

test('other video sections cannot inflate course progress or alter resume', async () => {
    reset(); mocks.rows = [{ video_id: 'unrelated-livestream' }]; const renderer = await renderCourse();
    assert.equal(percent(renderer), 0);
    assert.equal(renderer.root.findByType('youtube-test').props.videoId, 'lesson-a');
    await dispose(renderer);
});

test('resume skips completed shared sources and selects the first available uncompleted module', async () => {
    reset(); mocks.rows = [{ video_id: 'lesson-a' }, { video_id: 'lesson-b' }, { video_id: 'unrelated' }];
    const renderer = await renderCourse();
    assert.equal(percent(renderer), 75);
    assert.equal(rendererTitle(renderer), 'Final lesson');
    assert.equal(button(renderer, 'Time-Based Logic').props['aria-expanded'], true);
    await dispose(renderer);
});

test('unknown progress displays loading without a false percentage', async () => {
    reset(); mocks.pendingProgress = true; const renderer = await renderCourse();
    assert.equal(percent(renderer), undefined);
    assert.equal(renderer.root.findAllByType('youtube-test').length, 0);
    assert.match(text(renderer.toJSON()), /Loading progress/);
    assert.equal(button(renderer, 'Watch to complete').props.disabled, true);
    await act(async () => mocks.resolveProgress({ data: [{ video_id: 'lesson-a' }], error: null }));
    assert.equal(percent(renderer), 25);
    assert.equal(renderer.root.findByType('youtube-test').props.videoId, 'lesson-b');
    await dispose(renderer);
});

test('progress-load errors show retry and only expose progress after a successful load', async () => {
    reset(); mocks.progressError = new Error('network unavailable'); const renderer = await renderCourse();
    assert.equal(percent(renderer), undefined);
    assert.match(text(renderer.toJSON()), /Progress unavailable/);
    assert.equal(renderer.root.findAllByType('youtube-test').length, 0);
    mocks.progressError = null; mocks.rows = [{ video_id: 'lesson-b' }];
    await act(async () => button(renderer, 'Retry loading').props.onClick());
    assert.equal(percent(renderer), 50);
    assert.equal(mocks.progressLoads, 2);
    await dispose(renderer);
});

test('course membership opens every standard week while explicit admin restrictions remain disabled', async () => {
    reset(); const standard = await renderCourse();
    assert.equal(button(standard, 'Final lesson').props.disabled, false);
    await dispose(standard);
    reset(); mocks.dashboard.accessMap['week-1'] = { unlocked: false, reason: 'Restricted by administrator' };
    const restricted = await renderCourse();
    assert.equal(rendererTitle(restricted), 'Final lesson');
    assert.equal(button(restricted, 'First lesson').props.disabled, true);
    assert.match(text(button(restricted, 'Time Awareness')), /Restricted by administrator/);
    assert.equal(button(restricted, 'Final lesson').props.disabled, false);
    await dispose(restricted);
});

function rendererTitle(renderer) { return text(renderer.root.findAllByType('h2')[0]); }

test('indicator-only memberships never fetch progress or mount a course player', async () => {
    reset(); mocks.dashboard.membership.canWatchCourses = false; const renderer = await renderCourse();
    assert.equal(mocks.progressLoads, 0);
    assert.equal(renderer.root.findAllByType('youtube-test').length, 0);
    assert.match(text(renderer.toJSON()), /View course plans/);
    await dispose(renderer);
});

test('week accordions expose state and support arrow, Home, and End keyboard navigation', async () => {
    reset(); const renderer = await renderCourse();
    const first = button(renderer, 'Time Awareness');
    const second = button(renderer, 'Time-Based Logic');
    assert.equal(first.props['aria-expanded'], true);
    assert.equal(second.props['aria-expanded'], false);
    assert.equal(renderer.root.findByProps({ id: second.props['aria-controls'] }).props.hidden, true);
    await act(async () => second.props.onClick());
    assert.equal(second.props['aria-expanded'], true);
    assert.equal(renderer.root.findByProps({ id: second.props['aria-controls'] }).props.hidden, false);
    let prevented = 0;
    for (const [node, key] of [[first, 'ArrowDown'], [first, 'ArrowUp'], [second, 'Home'], [first, 'End']]) {
        node.props.onKeyDown({ key, preventDefault: () => prevented++ });
    }
    assert.deepEqual(mocks.focusedIds, [second.props.id, second.props.id, first.props.id, second.props.id]);
    assert.equal(prevented, 4);
    await dispose(renderer);
});

test('a save finishing after an account change never leaks the earlier account progress', async () => {
    reset(); const renderer = await renderCourse(); await eligible(renderer); mocks.pendingSave = true;
    await act(async () => { button(renderer, 'Complete & continue').props.onClick(); });
    const nextUser = { id: 'other-user', email: 'other@example.invalid' };
    mocks.authUser = nextUser;
    mocks.dashboard = { ...mocks.dashboard, user: nextUser };
    await act(async () => renderer.update(React.createElement(Course)));
    await act(async () => mocks.resolveSave({ error: null }));
    assert.deepEqual(mocks.saves, [{ user_id: 'test-user', video_id: 'lesson-a' }]);
    assert.equal(percent(renderer), 0);
    assert.equal(rendererTitle(renderer), 'First lesson');
    assert.equal(button(renderer, 'Watch to complete').props.disabled, true);
    await dispose(renderer);
});

test('an expired sign-in cannot write or advance progress', async () => {
    reset(); const renderer = await renderCourse(); await eligible(renderer); mocks.authUser = null;
    await act(async () => button(renderer, 'Complete & continue').props.onClick());
    assert.equal(mocks.saves.length, 0);
    assert.equal(percent(renderer), 0);
    assert.equal(rendererTitle(renderer), 'First lesson');
    assert.equal(button(renderer, 'Retry saving').props.disabled, false);
    await dispose(renderer);
});

test('player state resets even when the parent does not provide a React key', async () => {
    reset(); const completions = []; let renderer;
    await act(async () => { renderer = TestRenderer.create(React.createElement(SecureVideoPlayer, { videoId: 'a', onComplete: id => completions.push(id) })); });
    await eligible(renderer);
    await act(async () => renderer.update(React.createElement(SecureVideoPlayer, { videoId: 'b', onComplete: id => completions.push(id) })));
    assert.deepEqual(mocks.players.get('b').seekCalls, []);
    await act(async () => event(renderer, 0));
    assert.deepEqual(completions, []);
    await dispose(renderer);
});
