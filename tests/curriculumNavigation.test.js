import test from 'node:test';
import assert from 'node:assert/strict';
import { getCurriculumModules, getNextCurriculumModule, getResumeCurriculumModule, isCurrentCurriculumEvent, saveCurriculumCompletion } from '../src/lib/curriculumNavigation.js';

const weeks = [
    { id: 'week-1', videos: [{ videoId: 'intro', title: 'Introduction' }, { videoId: 'shared', title: 'Time cycles' }, { videoId: 'shared', title: 'Lookback awareness' }] },
    { id: 'week-2', videos: [{ videoId: 'range', title: 'Ranges' }] },
    { id: 'week-3', videos: [{ videoId: 'shared', title: 'Reinforcement' }, { videoId: 'final', title: 'Final lesson' }] },
];
const modules = getCurriculumModules(weeks);

test('shared sources retain distinct selection identities and correct titles', () => {
    assert.equal(new Set(modules.map(module => module.moduleId)).size, modules.length);
    const selected = modules.find(module => module.moduleId === 'week-1:2');
    assert.equal(selected.title, 'Lookback awareness');
    assert.equal(selected.videoId, 'shared');
    assert.equal(modules.find(module => module.moduleId === 'week-3:0').title, 'Reinforcement');
});

test('continuing from a duplicate advances by its position without looping backward', () => {
    assert.equal(getNextCurriculumModule(modules, 'week-1:1').moduleId, 'week-1:2');
    assert.equal(getNextCurriculumModule(modules, 'week-1:2').moduleId, 'week-2:0');
    assert.equal(getNextCurriculumModule(modules, 'week-3:0').moduleId, 'week-3:1');
    assert.equal(getNextCurriculumModule(modules, 'week-3:1'), null);
    assert.equal(getNextCurriculumModule(modules, 'missing'), null);
});

test('resume selects the first available uncompleted source and skips explicit week restrictions', () => {
    const canAccess = module => module.weekId !== 'week-2';
    assert.equal(getResumeCurriculumModule(modules, new Set(['intro', 'shared']), canAccess).moduleId, 'week-3:1');
    assert.equal(getResumeCurriculumModule(modules, new Set(['intro', 'shared'])).moduleId, 'week-2:0');
    assert.equal(getNextCurriculumModule(modules, 'week-1:2', canAccess).moduleId, 'week-3:0');
    assert.equal(getResumeCurriculumModule(modules, new Set(), () => false), null);
});

test('a fully completed curriculum resumes its last available module', () => {
    assert.equal(getResumeCurriculumModule(modules, new Set(['intro', 'shared', 'range', 'final'])).moduleId, 'week-3:1');
    assert.equal(getResumeCurriculumModule([], new Set()), null);
});

test('late player callbacks cannot complete a different module, even with the same source', () => {
    assert.equal(isCurrentCurriculumEvent(modules[1], 'week-1:1', 'shared'), true);
    assert.equal(isCurrentCurriculumEvent(modules[1], 'week-1:2', 'shared'), false);
    assert.equal(isCurrentCurriculumEvent(modules[1], 'week-1:1', 'intro'), false);
    assert.equal(isCurrentCurriculumEvent(null, 'week-1:1', 'shared'), false);
});

function fakeClient({ authUserId = 'member', authError = null, saveError = null } = {}) {
    const writes = [];
    return {
        writes,
        auth: { getUser: async () => ({ data: { user: authUserId ? { id: authUserId } : null }, error: authError }) },
        from(table) {
            assert.equal(table, 'video_progress');
            return {
                upsert: async (row, options) => {
                    writes.push({ row, options });
                    return { error: saveError };
                },
            };
        },
    };
}

test('saving progress requires the same signed-in account before any write', async () => {
    for (const client of [fakeClient({ authUserId: null }), fakeClient({ authUserId: 'different-member' }), fakeClient({ authError: new Error('expired') })]) {
        await assert.rejects(saveCurriculumCompletion(client, 'member', 'shared'), /Sign in again/);
        assert.equal(client.writes.length, 0);
    }
    const client = fakeClient();
    await assert.rejects(saveCurriculumCompletion(client, null, 'shared'), /Sign in/);
    assert.equal(client.writes.length, 0);
});

test('failed persistence does not return a completion and the same source can be retried', async () => {
    const saveError = new Error('database unavailable');
    const failed = fakeClient({ saveError });
    await assert.rejects(saveCurriculumCompletion(failed, 'member', 'shared'), error => error === saveError);
    const retry = fakeClient();
    assert.equal(await saveCurriculumCompletion(retry, 'member', 'shared'), 'shared');
    assert.deepEqual(retry.writes, [{ row: { user_id: 'member', video_id: 'shared' }, options: { onConflict: 'user_id, video_id' } }]);
});
