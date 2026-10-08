import { useCallback, useRef, useState } from 'react';

export function useVideoCompletion() {
    const eligibleRef = useRef(new Set());
    const [eligibleVideos, setEligibleVideos] = useState(new Set());
    const savingVideos = useRef(new Set());

    const onWatchStatus = useCallback((videoId, eligible) => {
        if (eligibleRef.current.has(videoId) === eligible) return;
        if (eligible) eligibleRef.current.add(videoId);
        else eligibleRef.current.delete(videoId);
        setEligibleVideos(new Set(eligibleRef.current));
    }, []);

    const beginSave = (videoId) => {
        if (!eligibleRef.current.has(videoId) || savingVideos.current.has(videoId)) return false;
        savingVideos.current.add(videoId);
        return true;
    };

    return { eligibleVideos, onWatchStatus, beginSave, finishSave: videoId => savingVideos.current.delete(videoId) };
}
