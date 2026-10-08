// Track distinct playback intervals. Position jumps (seeks) earn no watch time.
export const REQUIRED_WATCH_FRACTION = 0.95;

export function createWatchTracker() {
    let previous = null;
    let ranges = [];

    return {
        start(position, now) {
            previous = { position, now };
        },
        pause() {
            previous = null;
        },
        sample(position, duration, now, playbackRate = 1) {
            if (!Number.isFinite(position) || !Number.isFinite(duration) || duration <= 0) {
                previous = null;
                return false;
            }

            if (previous) {
                const elapsed = (now - previous.now) / 1000;
                const delta = position - previous.position;
                // Small timing tolerance for the player API; never credit a seek.
                if (elapsed >= 0 && delta > 0 && delta <= elapsed * playbackRate + 0.25) {
                    const start = Math.max(0, previous.position);
                    const end = Math.min(duration, position);
                    if (end > start) {
                        const merged = [];
                        for (const range of [...ranges, [start, end]].sort((a, b) => a[0] - b[0])) {
                            const last = merged.at(-1);
                            if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
                            else merged.push([...range]);
                        }
                        ranges = merged;
                    }
                }
            }
            previous = { position, now };
            const watched = ranges.reduce((sum, [start, end]) => sum + Math.max(0, Math.min(end, duration) - start), 0);
            return watched / duration >= REQUIRED_WATCH_FRACTION;
        },
    };
}

export function getCompletedVideoIds(progressRows, videos) {
    const videoIds = new Set(videos.map(video => video.videoId));
    return new Set(progressRows.filter(row => videoIds.has(row.video_id)).map(row => row.video_id));
}

export function getCourseProgress(videos, completedVideoIds) {
    if (!videos.length) return 0;
    // Modules sharing one source video must use the same denominator as the UI.
    return Math.round(videos.filter(video => completedVideoIds.has(video.videoId)).length / videos.length * 100);
}
