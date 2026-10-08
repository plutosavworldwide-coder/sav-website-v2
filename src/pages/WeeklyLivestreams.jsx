import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Folder, Video } from 'lucide-react';
import { livestreamsData } from '../data/livestreams';
import { LibraryArchive, LibraryHeading, LibraryPlayer } from '../components/DashboardLibrary';
import { useDashboard } from '../components/DashboardContext.jsx';
import { useVideoCompletion } from '../components/hooks/use-video-completion';
import { getCompletedVideoIds } from '../lib/videoProgress';
import { supabase } from '../lib/supabase';

const allVideos = livestreamsData.flatMap(month => month.videos);
const knownVideoIds = new Set(allVideos.map(video => video.videoId));
const years = [...new Set(livestreamsData.map(month => month.year))].sort((a, b) => b - a);

export default function WeeklyLivestreams() {
    const { user } = useDashboard();
    const [view, setView] = useState('folders');
    const [selectedYear, setSelectedYear] = useState(null);
    const hasManuallySelectedYear = useRef(false);
    const [activeVideoId, setActiveVideoId] = useState(null);
    const activeVideoRef = useRef(activeVideoId);
    activeVideoRef.current = activeVideoId;
    const [openMonthIds, setOpenMonthIds] = useState([]);
    const [completedVideos, setCompletedVideos] = useState(new Set());
    const [loadingProgress, setLoadingProgress] = useState(true);
    const [savingVideoIds, setSavingVideoIds] = useState(new Set());
    const [progressError, setProgressError] = useState('');
    const [saveError, setSaveError] = useState(null);
    const { eligibleVideos, onWatchStatus, beginSave, finishSave } = useVideoCompletion();
    const filteredMonths = livestreamsData.filter(month => month.year === selectedYear);
    const activeVideo = filteredMonths.flatMap(month => month.videos).find(video => video.videoId === activeVideoId);

    useEffect(() => {
        let cancelled = false;
        setLoadingProgress(true);
        setCompletedVideos(new Set());
        const fetchProgress = async () => {
            try {
                if (!user?.id) return;
                const { data, error } = await supabase.from('video_progress').select('video_id').eq('user_id', user.id);
                if (error) throw error;
                if (cancelled) return;
                const saved = getCompletedVideoIds(data || [], allVideos);
                setCompletedVideos(saved);
                setProgressError('');
                const targetVideo = allVideos.find(video => !saved.has(video.videoId)) || allVideos[allVideos.length - 1];
                if (targetVideo && !hasManuallySelectedYear.current) {
                    const month = livestreamsData.find(item => item.videos.some(video => video.videoId === targetVideo.videoId));
                    if (month) {
                        setSelectedYear(month.year);
                        setView('list');
                        setActiveVideoId(targetVideo.videoId);
                        setOpenMonthIds([month.id]);
                    }
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

    const handleYearSelect = (year) => {
        hasManuallySelectedYear.current = true;
        const months = livestreamsData.filter(month => month.year === year);
        const month = months.find(item => item.videos.length > 0) || months[0];
        setSelectedYear(year);
        setActiveVideoId(month?.videos[0]?.videoId || null);
        setOpenMonthIds(month ? [month.id] : []);
        setView('list');
    };

    const showArchives = () => {
        hasManuallySelectedYear.current = true;
        activeVideoRef.current = null;
        setActiveVideoId(null);
        setView('folders');
    };

    return <div className="dash-page custom-scrollbar h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-[1440px]">
            <LibraryHeading eyebrow="Weekly analysis" title={view === 'folders' ? 'Weekly livestreams' : `${selectedYear} livestream archive`} description={view === 'folders' ? 'Explore the complete archive of weekly market forecasts and live breakdowns.' : `Recorded market forecasts, lectures, and reviews from ${selectedYear}.`} onBack={view === 'list' ? showArchives : undefined} backLabel={view === 'list' ? 'All archives' : 'Dashboard'} />
            {view === 'folders' ? <>
                {loadingProgress && <p role="status" className="mb-5 text-xs text-[var(--dash-muted)]">Loading your saved progress…</p>}
                {progressError && <p role="alert" className="mb-5 text-xs text-[var(--dash-error)]">{progressError}</p>}
                <div className="grid gap-4 md:grid-cols-3">
                    {years.map(year => {
                        const videos = livestreamsData.filter(month => month.year === year).flatMap(month => month.videos);
                        const watched = videos.filter(video => completedVideos.has(video.videoId)).length;
                        return <button type="button" key={year} onClick={() => handleYearSelect(year)} className="dash-panel group flex min-h-[230px] flex-col rounded-2xl p-6 text-left transition-colors hover:border-[var(--dash-muted)]">
                            <div className="mb-9 flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel-raised)] text-[var(--dash-accent)]"><Folder size={20} strokeWidth={1.5} /></span><ArrowUpRight size={16} className="text-[var(--dash-subtle)] transition-colors group-hover:text-[var(--dash-accent)]" /></div>
                            <h2 className="text-xl font-semibold tracking-tight text-[var(--dash-text)]">{year} archive</h2>
                            <p className="mt-2 text-xs leading-relaxed text-[var(--dash-muted)]">Weekly forecasts and live market reviews.</p>
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--dash-border)] pt-4 text-xs text-[var(--dash-subtle)]"><span className="inline-flex items-center gap-1.5"><Video size={13} />{videos.length} recordings</span>{!loadingProgress && watched > 0 && <span className="text-[var(--dash-success)]">{watched} completed</span>}</div>
                        </button>;
                    })}
                </div>
            </> : <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                <LibraryPlayer activeVideo={activeVideo} userEmail={user?.email} onWatchStatus={onWatchStatus} onComplete={handleMarkComplete} onSave={() => handleMarkComplete(activeVideoId)} completed={completedVideos.has(activeVideoId)} eligible={eligibleVideos.has(activeVideoId)} saving={savingVideoIds.has(activeVideoId)} progressLoading={loadingProgress} error={saveError?.videoId === activeVideoId ? saveError.message : progressError} />
                <LibraryArchive title="Session playlist" subtitle={`${selectedYear} recordings`} groups={filteredMonths} activeVideoId={activeVideoId} openGroupIds={openMonthIds} onToggle={id => setOpenMonthIds(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id])} onSelect={video => setActiveVideoId(video.videoId)} completedVideos={completedVideos} loading={loadingProgress} />
            </div>}
        </div>
    </div>;
}
