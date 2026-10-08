import test from 'node:test';
import assert from 'node:assert/strict';
import { createWatchTracker, getCompletedVideoIds, getCourseProgress } from '../src/lib/videoProgress.js';

test('watching 95% of a video makes it eligible', () => {
    const tracker = createWatchTracker();
    tracker.start(0, 0);
    assert.equal(tracker.sample(94, 100, 94000), false);
    assert.equal(tracker.sample(95, 100, 95000), true);
});

test('seeking to the end earns no watch time', () => {
    const tracker = createWatchTracker();
    tracker.start(0, 0);
    assert.equal(tracker.sample(99, 100, 1000), false);
    assert.equal(tracker.sample(100, 100, 2000), false);
});

test('replaying a short segment cannot complete a video', () => {
    const tracker = createWatchTracker();
    for (let i = 0; i < 10; i++) {
        tracker.start(0, i * 11000);
        assert.equal(tracker.sample(10, 100, i * 11000 + 10000), false);
        tracker.pause();
    }
});

test('overlapping segments credit only distinct video time', () => {
    const tracker = createWatchTracker();
    tracker.start(0, 0);
    assert.equal(tracker.sample(50, 100, 50000), false);
    tracker.start(25, 60000);
    assert.equal(tracker.sample(75, 100, 110000), false);
    tracker.start(70, 120000);
    assert.equal(tracker.sample(95, 100, 145000), true);
});

test('buffering and paused gaps do not count as watched content', () => {
    const tracker = createWatchTracker();
    tracker.start(0, 0);
    tracker.sample(10, 100, 10000);
    tracker.pause();
    assert.equal(tracker.sample(100, 100, 110000), false);
});

test('normal playback at 2x counts the content actually played', () => {
    const tracker = createWatchTracker();
    tracker.start(0, 0);
    assert.equal(tracker.sample(95, 100, 47500, 2), true);
});

test('a new playback session has no credit from the previous video', () => {
    const previous = createWatchTracker();
    previous.start(0, 0);
    assert.equal(previous.sample(100, 100, 100000), true);
    const next = createWatchTracker();
    next.start(0, 110000);
    assert.equal(next.sample(1, 100, 111000), false);
});

test('unknown or invalid durations never complete a video', () => {
    const tracker = createWatchTracker();
    tracker.start(0, 0);
    for (const duration of [0, -1, NaN, Infinity]) {
        assert.equal(tracker.sample(100, duration, 100000), false);
    }
});

test('completions from other sections do not affect course progress', () => {
    const videos = [{ videoId: 'course-a' }, { videoId: 'course-b' }];
    const completed = getCompletedVideoIds([{ video_id: 'live-session' }, { video_id: 'course-a' }], videos);
    assert.deepEqual([...completed], ['course-a']);
    assert.equal(getCourseProgress(videos, completed), 50);
});

test('all completed modules reach 100%, including shared source videos', () => {
    const videos = [{ videoId: 'a' }, { videoId: 'a' }, { videoId: 'b' }];
    assert.equal(getCourseProgress(videos, new Set(['a', 'b', 'unrelated'])), 100);
    assert.equal(getCourseProgress([], new Set(['a'])), 0);
});
