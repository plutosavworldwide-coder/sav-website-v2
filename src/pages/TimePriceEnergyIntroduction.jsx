import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronDown, Circle, Clock, Loader2, Lock, Play, RotateCcw } from 'lucide-react';
import { curriculumData } from '../data/curriculum';
import { supabase } from '../lib/supabase';
import SecureVideoPlayer from '../components/SecureVideoPlayer';
import { useDashboard } from '../components/DashboardContext';
import { useVideoCompletion } from '../components/hooks/use-video-completion';
import { getCompletedVideoIds, getCourseProgress } from '../lib/videoProgress';
import { getCurriculumModules, getNextCurriculumModule, getResumeCurriculumModule, isCurrentCurriculumEvent, saveCurriculumCompletion } from '../lib/curriculumNavigation';
import './curriculum.css';

const modules = getCurriculumModules(curriculumData);
const firstModule = modules[0];

const TimePriceEnergyIntroduction = () => {
    const { user, membership, accessMap } = useDashboard();
    const canWatch = membership?.canWatchCourses === true;
    const userId = user?.id;
    const [activeModuleId, setActiveModuleId] = useState(firstModule.moduleId);
    const [openWeeks, setOpenWeeks] = useState(new Set([firstModule.weekId]));
    const [progressState, setProgressState] = useState({ status: 'loading', completed: new Set(), userId: null });
    const [progressAttempt, setProgressAttempt] = useState(0);
    const [savingVideoId, setSavingVideoId] = useState(null);
    const [saveError, setSaveError] = useState(null);
    const { eligibleVideos, onWatchStatus, beginSave, finishSave } = useVideoCompletion();
    const activeModuleRef = useRef(activeModuleId);
    const currentUserRef = useRef(userId);
    const weekButtonRefs = useRef([]);
    activeModuleRef.current = activeModuleId;
    currentUserRef.current = userId;

    // Never show a previous account's progress during an account change.
    const progressReady = progressState.status === 'ready' && progressState.userId === userId;
    const progressFailed = progressState.status === 'error' && progressState.userId === userId;
    const completedVideos = progressReady ? progressState.completed : new Set();
    const canAccessModule = module => accessMap?.[module.weekId]?.unlocked !== false;
    const courseProgress = progressReady ? getCourseProgress(modules, completedVideos) : null;
    const completedCount = progressReady ? modules.filter(module => completedVideos.has(module.videoId)).length : null;
    const activeModule = modules.find(module => module.moduleId === activeModuleId) || firstModule;
    const activeNumber = modules.findIndex(module => module.moduleId === activeModule.moduleId) + 1;
    const nextModule = getNextCurriculumModule(modules, activeModule.moduleId, canAccessModule);
    const activeCompleted = progressReady && completedVideos.has(activeModule.videoId);
    const activeEligible = eligibleVideos.has(activeModule.videoId);
    const savingActive = savingVideoId === activeModule.videoId;
    const activeSaveError = saveError?.moduleId === activeModule.moduleId;
    const activeAccessible = canAccessModule(activeModule);
    const allModulesAccessible = modules.every(canAccessModule);

    useEffect(() => {
        if (!canWatch || !userId) return;
        let cancelled = false;
        setProgressState({ status: 'loading', completed: new Set(), userId });
        setSaveError(null);

        const loadProgress = async () => {
            try {
                const { data, error } = await supabase
                    .from('video_progress')
                    .select('video_id')
                    .eq('user_id', userId);
                if (error) throw error;
                if (!Array.isArray(data)) throw new Error('Lesson progress could not be loaded.');
                if (cancelled) return;
                const completed = getCompletedVideoIds(data, modules);
                const resumeModule = getResumeCurriculumModule(modules, completed, module => accessMap?.[module.weekId]?.unlocked !== false);
                setProgressState({ status: 'ready', completed, userId });
                if (resumeModule) {
                    setActiveModuleId(resumeModule.moduleId);
                    setOpenWeeks(new Set([resumeModule.weekId]));
                }
            } catch {
                if (!cancelled) setProgressState({ status: 'error', completed: new Set(), userId });
            }
        };

        loadProgress();
        return () => { cancelled = true; };
    }, [canWatch, userId, progressAttempt, accessMap]);

    const selectModule = (module) => {
        if (!canAccessModule(module)) return;
        activeModuleRef.current = module.moduleId;
        setActiveModuleId(module.moduleId);
        setOpenWeeks(previous => new Set(previous).add(module.weekId));
        setSaveError(null);
    };

    const handleWatchStatus = (module, sourceVideoId, eligible) => {
        if (!isCurrentCurriculumEvent(module, activeModuleRef.current, sourceVideoId)) return;
        onWatchStatus(sourceVideoId, eligible);
    };

    const completeAndContinue = async (module, sourceVideoId) => {
        if (!progressReady || !canWatch || !canAccessModule(module) || !isCurrentCurriculumEvent(module, activeModuleRef.current, sourceVideoId)) return;
        const savedForUser = userId;
        const alreadyCompleted = completedVideos.has(sourceVideoId);
        if (!alreadyCompleted && !beginSave(sourceVideoId)) return;

        setSaveError(null);
        if (!alreadyCompleted) setSavingVideoId(sourceVideoId);
        try {
            if (!alreadyCompleted) {
                await saveCurriculumCompletion(supabase, savedForUser, sourceVideoId);
                if (currentUserRef.current !== savedForUser) return;
                setProgressState(previous => previous.userId === savedForUser && previous.status === 'ready'
                    ? { ...previous, completed: new Set(previous.completed).add(sourceVideoId) }
                    : previous);
            }
            // A slow save or event from an earlier module must never advance a new selection.
            if (currentUserRef.current !== savedForUser || activeModuleRef.current !== module.moduleId) return;
            const next = getNextCurriculumModule(modules, module.moduleId, canAccessModule);
            if (next) selectModule(next);
        } catch {
            if (currentUserRef.current === savedForUser) {
                setSaveError({ moduleId: module.moduleId, message: 'Your progress could not be saved. Please try again.' });
            }
        } finally {
            if (!alreadyCompleted) finishSave(sourceVideoId);
            setSavingVideoId(previous => previous === sourceVideoId ? null : previous);
        }
    };

    const toggleWeek = (weekId) => setOpenWeeks(previous => {
        const next = new Set(previous);
        if (next.has(weekId)) next.delete(weekId);
        else next.add(weekId);
        return next;
    });

    const handleWeekKey = (event, index) => {
        let target;
        if (event.key === 'ArrowDown') target = (index + 1) % curriculumData.length;
        if (event.key === 'ArrowUp') target = (index + curriculumData.length - 1) % curriculumData.length;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = curriculumData.length - 1;
        if (target === undefined) return;
        event.preventDefault();
        weekButtonRefs.current[target]?.focus();
    };

    if (!canWatch) {
        return (
            <div className="dash-page curriculum-page">
                <Link to="/dashboard" className="curriculum-back"><ArrowLeft size={15} /> Dashboard</Link>
                <section className="dash-panel curriculum-access">
                    <BookOpen size={26} className="curriculum-accent" />
                    <h1>Explore the full curriculum</h1>
                    <p>Your current plan includes indicators. Choose a course membership to access Time, Price &amp; Energy.</p>
                    <Link to="/choose-plan" className="dash-primary">View course plans <ArrowRight size={16} /></Link>
                </section>
            </div>
        );
    }

    return (
        <div className="dash-page curriculum-page">
            <div className="dash-page-inner">
            <header className="curriculum-heading">
                <Link to="/dashboard" className="curriculum-back"><ArrowLeft size={15} /> Dashboard</Link>
                <div className="curriculum-heading-row">
                    <div>
                        <p className="dash-eyebrow">THE MASTERCLASS</p>
                        <h1>Time, Price &amp; Energy</h1>
                        <p className="curriculum-description">A complete framework for time-based market execution.</p>
                    </div>
                    <div className="curriculum-summary"><BookOpen size={16} /><span>{curriculumData.length} weeks</span><span className="curriculum-dot" /><span>{modules.length} modules</span></div>
                </div>
            </header>

            <div className="curriculum-grid">
                <section className="curriculum-main" aria-label="Current lesson">
                    <section className="dash-panel curriculum-player-panel">
                        <div className="curriculum-video">
                            {progressReady && activeAccessible ? (
                                <SecureVideoPlayer
                                    key={`${userId}:${activeModule.moduleId}`}
                                    videoId={activeModule.videoId}
                                    title={activeModule.title}
                                    watermarkText={user?.email}
                                    className="!rounded-none"
                                    onWatchStatus={(sourceVideoId, eligible) => handleWatchStatus(activeModule, sourceVideoId, eligible)}
                                    onComplete={(sourceVideoId) => completeAndContinue(activeModule, sourceVideoId)}
                                />
                            ) : (
                                <div className="curriculum-video-state" role="status">
                                    {progressFailed ? <RotateCcw size={25} /> : progressReady && !activeAccessible ? <Lock size={25} /> : <Loader2 size={25} className="animate-spin" />}
                                    <p>{progressFailed ? 'Your lesson progress is unavailable.' : progressReady && !activeAccessible ? accessMap?.[activeModule.weekId]?.reason || 'This week is restricted by your administrator.' : 'Loading your lesson…'}</p>
                                    {progressFailed && <button type="button" className="dash-secondary" onClick={() => setProgressAttempt(previous => previous + 1)}>Retry loading</button>}
                                </div>
                            )}
                        </div>
                        <div className="curriculum-lesson-meta">
                            <div className="curriculum-lesson-kicker"><span>WEEK {activeModule.weekNumber}</span><span className="curriculum-dot" /><span>MODULE {activeNumber} OF {modules.length}</span></div>
                            <h2>{activeModule.title}</h2>
                            <div className="curriculum-lesson-details">
                                <span><Clock size={14} /> {activeModule.duration}</span>
                                {progressReady && <span className={activeCompleted ? 'curriculum-completed' : ''}>{activeCompleted ? <CheckCircle2 size={14} /> : <Play size={13} />}{activeCompleted ? 'Completed' : 'Video lesson'}</span>}
                            </div>
                            <div className="curriculum-completion-row">
                                <p className="curriculum-completion-hint" id="curriculum-watch-hint">
                                    {!activeAccessible && progressReady ? 'Contact your administrator about lesson access.' : progressFailed ? 'Retry loading to continue learning.' : !progressReady ? 'Retrieving your saved progress.' : activeCompleted ? 'This lesson is saved to your progress.' : activeEligible ? 'Lesson watched. You can save your progress.' : 'Watch at least 95% of the lesson to complete it.'}
                                </p>
                                <button
                                    type="button"
                                    className={activeCompleted ? 'dash-secondary curriculum-complete-button' : 'dash-primary curriculum-complete-button'}
                                    onClick={() => completeAndContinue(activeModule, activeModule.videoId)}
                                    disabled={!progressReady || !activeAccessible || savingActive || (!activeCompleted && !activeEligible) || (activeCompleted && !nextModule)}
                                    aria-describedby="curriculum-watch-hint"
                                >
                                    {savingActive ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : activeCompleted ? <>{nextModule ? 'Next lesson' : courseProgress === 100 ? 'Course complete' : 'Lesson completed'} <Check size={16} /></> : activeSaveError ? <>Retry saving <RotateCcw size={16} /></> : <>{activeEligible ? (nextModule ? 'Complete & continue' : 'Complete lesson') : 'Watch to complete'} <ArrowRight size={16} /></>}
                                </button>
                            </div>
                            {activeSaveError && <p className="curriculum-save-error" role="alert">{saveError.message}</p>}
                        </div>
                    </section>

                    <section className="dash-panel curriculum-learning-note">
                        <span className="curriculum-note-icon"><BookOpen size={19} /></span>
                        <div><h3>Learn at your own pace</h3><p>{allModulesAccessible ? 'Every week is available with your membership.' : 'Choose from the lessons available with your membership.'} Choose any available lesson, or continue through the curriculum in order.</p></div>
                    </section>
                </section>

                <aside className="dash-panel curriculum-outline" aria-label="Course curriculum">
                    <div className="curriculum-outline-header">
                        <div className="curriculum-outline-title"><h2>Curriculum</h2><span>{modules.length} modules</span></div>
                        {progressReady ? (
                            <>
                                <div className="curriculum-progress-copy"><span>{completedCount} of {modules.length} completed</span><strong>{courseProgress}%</strong></div>
                                <div className="curriculum-progress-track" role="progressbar" aria-label="Course completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={courseProgress}><div style={{ width: `${courseProgress}%` }} /></div>
                            </>
                        ) : (
                            <div className="curriculum-progress-status" role="status">
                                {progressFailed ? <><span>Progress unavailable</span><button type="button" onClick={() => setProgressAttempt(previous => previous + 1)}><RotateCcw size={13} /> Retry</button></> : <><Loader2 size={13} className="animate-spin" /> Loading progress…</>}
                            </div>
                        )}
                    </div>
                    <div className="curriculum-weeks">
                        {curriculumData.map((week, weekIndex) => {
                            const isOpen = openWeeks.has(week.id);
                            const weekModules = modules.filter(module => module.weekId === week.id);
                            const weekCompletedCount = progressReady ? weekModules.filter(module => completedVideos.has(module.videoId)).length : null;
                            const weekCompleted = progressReady && weekCompletedCount === weekModules.length;
                            const weekLocked = accessMap?.[week.id]?.unlocked === false;
                            const lockReason = accessMap?.[week.id]?.reason || 'Restricted by administrator';
                            const panelId = `curriculum-${week.id}-lessons`;
                            const buttonId = `curriculum-${week.id}-toggle`;

                            return (
                                <section className={`curriculum-week ${isOpen ? 'is-open' : ''}`} key={week.id}>
                                    <h3>
                                        <button
                                            type="button"
                                            id={buttonId}
                                            ref={element => { weekButtonRefs.current[weekIndex] = element; }}
                                            className="curriculum-week-button"
                                            onClick={() => toggleWeek(week.id)}
                                            onKeyDown={event => handleWeekKey(event, weekIndex)}
                                            aria-expanded={isOpen}
                                            aria-controls={panelId}
                                        >
                                            <span className={`curriculum-week-number ${weekCompleted && !weekLocked ? 'is-completed' : ''}`}>{weekLocked ? <Lock size={13} /> : weekCompleted ? <Check size={15} /> : String(weekIndex + 1).padStart(2, '0')}</span>
                                            <span className="curriculum-week-copy"><span>{week.title.replace(/^Week \d+ — /, '')}</span><span>{weekLocked ? lockReason : progressReady ? `${weekCompletedCount}/${weekModules.length} completed` : `${weekModules.length} modules`}</span></span>
                                            <ChevronDown size={15} className="curriculum-chevron" />
                                        </button>
                                    </h3>
                                    <div className="curriculum-module-list" id={panelId} aria-labelledby={buttonId} hidden={!isOpen}>
                                        {weekModules.map(module => {
                                            const isActive = activeModule.moduleId === module.moduleId;
                                            const isCompleted = progressReady && completedVideos.has(module.videoId);
                                            return (
                                                <button
                                                    type="button"
                                                    key={module.moduleId}
                                                    className={`curriculum-module ${isActive ? 'is-active' : ''}`}
                                                    onClick={() => selectModule(module)}
                                                    disabled={!progressReady || weekLocked}
                                                    aria-current={isActive ? 'step' : undefined}
                                                >
                                                    <span className={`curriculum-module-status ${isCompleted && !weekLocked ? 'is-completed' : ''}`}>{weekLocked ? <Lock size={13} /> : isCompleted ? <CheckCircle2 size={15} /> : isActive ? <Play size={13} /> : <Circle size={13} />}</span>
                                                    <span className="curriculum-module-copy"><span>{module.title}</span><span>{module.duration}{isCompleted && !weekLocked ? ' · Completed' : ''}</span></span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </aside>
            </div>
            </div>
        </div>
    );
};

export default TimePriceEnergyIntroduction;
