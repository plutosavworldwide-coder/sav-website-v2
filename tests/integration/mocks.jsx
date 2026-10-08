import React, { useEffect } from 'react';

export const mocks = { now: 0, players: new Map(), rows: [], saves: [], failNextSave: false, pendingSave: null, progressError: null, pendingProgress: false, dashboard: null, authUser: null, authError: null, progressLoads: 0 };

export function YouTube(props) {
    useEffect(() => {
        const player = { position: 0, seekCalls: [], getCurrentTime() { return this.position; }, getDuration() { return 100; }, getPlaybackRate() { return 1; }, getAvailableQualityLevels() { return []; }, seekTo(position) { this.seekCalls.push(position); this.position = position; }, playVideo() {}, pauseVideo() {} };
        mocks.players.set(props.videoId, player);
        props.onReady({ target: player });
    }, [props.videoId]);
    return React.createElement('youtube-test', props);
}

export const supabase = {
    auth: { getUser: async () => ({ data: { user: mocks.authUser }, error: mocks.authError }) },
    from() { return {
        select() { return { eq: async () => {
            mocks.progressLoads += 1;
            if (mocks.pendingProgress) return new Promise(resolve => { mocks.resolveProgress = resolve; });
            return { data: mocks.rows, error: mocks.progressError };
        } }; },
        async upsert(row) {
            mocks.saves.push(row);
            if (mocks.pendingSave) return new Promise(resolve => { mocks.resolveSave = resolve; });
            if (mocks.failNextSave) { mocks.failNextSave = false; return { error: new Error('Test save failure') }; }
            return { error: null };
        },
    }; },
};

export const curriculumData = [
    { id: 'week-1', title: 'Week 1 — Time Awareness', videos: [
        { videoId: 'lesson-a', title: 'First lesson', duration: '1:40', number: 1 },
        { videoId: 'lesson-b', title: 'Second lesson', duration: '1:40', number: 2 },
        { videoId: 'lesson-b', title: 'Shared source lesson', duration: '1:40', number: 3 },
    ] },
    { id: 'week-2', title: 'Week 2 — Time-Based Logic', videos: [{ videoId: 'lesson-c', title: 'Final lesson', duration: '1:40', number: 1 }] },
];
export const useDashboard = () => mocks.dashboard;
export const Link = ({ to, children, ...props }) => React.createElement('a', { href: to, ...props }, children);
export const useNavigate = () => () => {};
export const AnimatePresence = ({ children }) => React.createElement(React.Fragment, null, children);
export const motion = new Proxy({}, { get(target, type) { return target[type] ||= ({ children, ...props }) => React.createElement(type, props, children); } });
