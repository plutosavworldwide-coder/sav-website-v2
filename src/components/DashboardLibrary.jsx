import { ArrowLeft, Calendar, CheckCircle2, ChevronDown, Clock, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import SecureVideoPlayer from './SecureVideoPlayer';
import { cn } from '../lib/utils';

export function LibraryHeading({ eyebrow, title, description, backLabel = 'Dashboard', backTo = '/dashboard', onBack, children }) {
    const backClass = 'mb-5 inline-flex w-fit items-center gap-2 text-xs font-medium text-[var(--dash-muted)] transition-colors hover:text-[var(--dash-text)]';
    return (
        <header className="mb-6">
            {onBack ? <button type="button" onClick={onBack} className={backClass}><ArrowLeft size={14} />{backLabel}</button>
                : <Link to={backTo} className={backClass}><ArrowLeft size={14} />{backLabel}</Link>}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="dash-eyebrow mb-2">{eyebrow}</p>
                    <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.035em] text-[var(--dash-text)] md:text-[32px]">{title}</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--dash-muted)]">{description}</p>
                </div>
                {children}
            </div>
        </header>
    );
}

export function LibraryPlayer({ activeVideo, userEmail, onWatchStatus, onComplete, completed = false, eligible = false, saving = false, onSave, error, progressLoading = false }) {
    return (
        <section className="dash-panel overflow-hidden rounded-2xl">
            <div className="relative aspect-video w-full bg-black">
                {activeVideo ? (
                    <SecureVideoPlayer key={activeVideo.videoId} videoId={activeVideo.videoId} title={activeVideo.title} watermarkText={userEmail} onWatchStatus={onWatchStatus} onComplete={onComplete} />
                ) : <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--dash-muted)]">Choose a recording to begin.</div>}
            </div>
            <div className="border-t border-[var(--dash-border)] p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-5">
                    <div className="min-w-0 flex-1 basis-60">
                        <p className="dash-eyebrow mb-2">{onSave ? 'Session playback' : 'Course lesson'}</p>
                        <h2 className="text-lg font-semibold leading-snug tracking-tight text-[var(--dash-text)]">{activeVideo?.title || 'No recording selected'}</h2>
                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--dash-muted)]">
                            {activeVideo?.date && <span className="inline-flex items-center gap-1.5"><Calendar size={13} />{activeVideo.date}</span>}
                            {activeVideo?.duration && <span className="inline-flex items-center gap-1.5"><Clock size={13} />{activeVideo.duration}</span>}
                        </div>
                    </div>
                    {onSave && <button type="button" onClick={onSave} disabled={!activeVideo || saving || completed || !eligible || progressLoading} className={cn('inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60', completed ? 'border border-[var(--dash-border)] bg-[var(--dash-panel-raised)] text-[var(--dash-success)]' : 'dash-primary')}><CheckCircle2 size={15} />{completed ? 'Completed' : saving ? 'Saving progress…' : eligible ? 'Save as watched' : 'Watch to complete'}</button>}
                </div>
                {onSave && !completed && <p className="mt-4 text-xs leading-relaxed text-[var(--dash-subtle)]">Watch at least 95% of the session to save it as completed.</p>}
                {error && <p role="alert" className="mt-4 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs leading-relaxed text-[var(--dash-error)]">{error}</p>}
            </div>
        </section>
    );
}

export function LibraryArchive({ title, subtitle, groups, activeVideoId, openGroupIds, onToggle, onSelect, completedVideos = new Set(), loading = false }) {
    const total = groups.reduce((count, group) => count + group.videos.length, 0);
    return (
        <aside className="dash-panel flex min-w-0 flex-col overflow-hidden rounded-2xl xl:max-h-[calc(100vh-200px)]">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--dash-border)] px-5 py-4">
                <div><h2 className="text-sm font-semibold text-[var(--dash-text)]">{title}</h2><p className="mt-1 text-xs text-[var(--dash-subtle)]">{subtitle}</p></div>
                <span className="rounded-md border border-[var(--dash-border)] px-2 py-1 text-xs tabular-nums text-[var(--dash-muted)]">{total}</span>
            </div>
            <div className="custom-scrollbar overflow-y-auto p-2">
                {loading && <p role="status" className="px-3 py-2 text-xs text-[var(--dash-muted)]">Loading saved progress…</p>}
                {groups.map((group, index) => {
                    const isOpen = openGroupIds.includes(group.id);
                    return <div key={group.id} className="border-b border-[var(--dash-border)] last:border-0">
                        <button type="button" aria-expanded={isOpen} onClick={() => onToggle(group.id)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3.5 text-left transition-colors hover:bg-[var(--dash-panel-raised)]">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--dash-border)] text-xs tabular-nums text-[var(--dash-muted)]">{String(index + 1).padStart(2, '0')}</span>
                            <span className="min-w-0 flex-1"><span className="block text-xs font-semibold leading-snug text-[var(--dash-text)]">{group.title}</span><span className="mt-1 block text-[11px] text-[var(--dash-subtle)]">{group.videos.length} {group.videos.length === 1 ? 'recording' : 'recordings'}</span></span>
                            <ChevronDown size={14} className={cn('shrink-0 text-[var(--dash-subtle)] transition-transform', isOpen && 'rotate-180')} />
                        </button>
                        {isOpen && <div className="space-y-1 px-1 pb-2">
                            {group.videos.length === 0 && <p className="px-4 py-3 text-xs leading-relaxed text-[var(--dash-muted)]">No recordings have been added yet.</p>}
                            {group.videos.map((video, videoIndex) => {
                                const isActive = video.videoId === activeVideoId;
                                const isCompleted = completedVideos.has(video.videoId);
                                return <button type="button" key={video.videoId} id={`video-${video.videoId}`} aria-current={isActive ? 'true' : undefined} onClick={() => onSelect(video, group)} className={cn('flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors', isActive ? 'border-[var(--dash-border)] bg-[var(--dash-panel-raised)]' : 'border-transparent hover:bg-[var(--dash-panel-raised)]')}>
                                    <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px]', isActive ? 'bg-[#d4bd8b]/10 text-[var(--dash-accent)]' : isCompleted ? 'text-[var(--dash-success)]' : 'text-[var(--dash-subtle)]')}>{isActive ? <Play size={12} fill="currentColor" /> : isCompleted ? <CheckCircle2 size={15} /> : String(videoIndex + 1).padStart(2, '0')}</span>
                                    <span className="min-w-0 flex-1"><span className={cn('block text-xs leading-relaxed', isActive ? 'font-medium text-[var(--dash-text)]' : 'text-[var(--dash-muted)]')}>{video.title}</span><span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[var(--dash-subtle)]">{video.date && <span>{video.date}</span>}{video.duration && <span>{video.duration}</span>}{isCompleted && <span className="text-[var(--dash-success)]">Completed</span>}</span></span>
                                </button>;
                            })}
                        </div>}
                    </div>;
                })}
            </div>
        </aside>
    );
}
