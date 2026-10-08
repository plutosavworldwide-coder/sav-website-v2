import { useEffect, useRef, useState } from 'react';
import { dailyReviewsData } from '../data/dailyReviews';
import { LibraryArchive, LibraryHeading, LibraryPlayer } from '../components/DashboardLibrary';
import { useDashboard } from '../components/DashboardContext.jsx';
import { useVideoCompletion } from '../components/hooks/use-video-completion';
import { getCompletedVideoIds } from '../lib/videoProgress';
import { supabase } from '../lib/supabase';

const allVideos = dailyReviewsData.flatMap(month => month.videos);
const knownVideoIds = new Set(allVideos.map(video => video.videoId));

export default function DailyReviews() {
    const { user } = useDashboard();
    const [activeVideoId, setActiveVideoId] = useState(allVideos[0]?.videoId || null);
    const activeVideoRef = useRef(activeVideoId);
    activeVideoRef.current = activeVideoId;
    const [openMonthIds, setOpenMonthIds] = useState([dailyReviewsData[0]?.id]);
    const [completedVideos, setCompletedVideos] = useState(new Set());
    const [loadingProgress, setLoadingProgress] = useState(true);
    const [savingVideoIds, setSavingVideoIds] = useState(new Set());
    const [progressError, setProgressError] = useState('');
    const [saveError, setSaveError] = useState(null);
    const { eligibleVideos, onWatchStatus, beginSave, finishSave } = useVideoCompletion();
    const activeVideo = allVideos.find(video => video.videoId === activeVideoId);

    useEffect(() => {
        let cancelled = false;
        setLoadingProgress(true);
        setCompletedVideos(new Set());
        const fetchProgress = async () => {
            try {
                if (!user?.id) return;
                const { data, error } = await supabase.from('video_progress').select('video_id').eq('user_id', user.id);
                if (error) throw error;
                if (!cancelled) {
                    setCompletedVideos(getCompletedVideoIds(data || [], allVideos));
                    setProgressError('');
                }
            } catch {
                if (!cancelled) setProgressError('Saved progress could not be loaded. You can still watch and save a completed session.');
            } finally {
                if (!cancelled) setLoadingProgress(false);
            }
        };
        fetchProgress();
        return () => { cancelled = true; };
    }, [user?.id]);

    const handleMarkComplete = async (videoId) => {
        if (videoId !== activeVideoRef.current || !knownVideoIds.has(videoId) || completedVideos.has(videoId) || !beginSave(videoId)) return;
        setSavingVideoIds(previous => new Set(previous).add(videoId));
        setSaveError(null);
        try {
            const { data: { user: authenticatedUser }, error: authError } = await supabase.auth.getUser();
            if (authError || !authenticatedUser || authenticatedUser.id !== user?.id) throw new Error('Sign in again to save your progress.');
            const { error } = await supabase.from('video_progress').upsert({ user_id: authenticatedUser.id, video_id: videoId }, { onConflict: 'user_id, video_id' });
            if (error) throw error;
            setCompletedVideos(previous => new Set(previous).add(videoId));
        } catch {
            setSaveError({ videoId, message: 'Progress could not be saved. Select “Save as watched” to try again.' });
        } finally {
            finishSave(videoId);
            setSavingVideoIds(previous => { const next = new Set(previous); next.delete(videoId); return next; });
        }
    };

    return <div className="dash-page custom-scrollbar h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-[1440px]">
            <LibraryHeading eyebrow="Market analysis" title="Daily market reviews" description="Daily insights and trade breakdowns, with your viewing progress saved to your account." />
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                <LibraryPlayer activeVideo={activeVideo} userEmail={user?.email} onWatchStatus={onWatchStatus} onComplete={handleMarkComplete} onSave={() => handleMarkComplete(activeVideoId)} completed={completedVideos.has(activeVideoId)} eligible={eligibleVideos.has(activeVideoId)} saving={savingVideoIds.has(activeVideoId)} progressLoading={loadingProgress} error={saveError?.videoId === activeVideoId ? saveError.message : progressError} />
                <LibraryArchive title="Review archive" subtitle="Daily sessions" groups={dailyReviewsData} activeVideoId={activeVideoId} openGroupIds={openMonthIds} onToggle={id => setOpenMonthIds(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id])} onSelect={video => setActiveVideoId(video.videoId)} completedVideos={completedVideos} loading={loadingProgress} />
            </div>
        </div>
    </div>;
}
