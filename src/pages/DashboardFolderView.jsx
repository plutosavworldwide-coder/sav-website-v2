import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Clock, Layers, MessageCircle, Play, Radio, RotateCcw, Send } from 'lucide-react';
import { useDashboard } from '../components/DashboardContext';
import { supabase } from '../lib/supabase';
import { curriculumData } from '../data/curriculum';
import { livestreamsData } from '../data/livestreams';
import { gordianParadoxData } from '../data/gordianParadox';
import { getCompletedVideoIds, getCourseProgress } from '../lib/videoProgress';
import { getCurriculumModules } from '../lib/curriculumNavigation';

const modules = getCurriculumModules(curriculumData);
const recordingCount = livestreamsData.flatMap(month => month.videos).length;
const advancedCount = gordianParadoxData.flatMap(section => section.videos).length;

function StudyArtwork() {
    return <svg viewBox="0 0 360 360" fill="none" className="dash-study-art" aria-hidden="true">
        <defs><linearGradient id="study-line" x1="40" y1="40" x2="300" y2="330" gradientUnits="userSpaceOnUse"><stop stopColor="var(--dash-accent)" stopOpacity=".6" /><stop offset="1" stopColor="var(--dash-accent)" stopOpacity=".03" /></linearGradient></defs>
        {[65, 100, 135, 170, 205, 240, 275].map((y, i) => <path key={y} d={`M30 ${y}L180 ${y - 62}L330 ${y}L180 ${y + 63}Z`} stroke={i === 3 ? 'url(#study-line)' : 'var(--dash-border)'} strokeWidth={i === 3 ? '1.5' : '.75'} />)}
        <path d="M30 65V275M180 3V338M330 65V275" stroke="var(--dash-border)" strokeDasharray="3 7" />
        <path d="M69 168L103 145L134 158L167 111L199 126L228 72L273 91" stroke="url(#study-line)" strokeWidth="2" />
        <circle cx="228" cy="72" r="4" fill="var(--dash-accent)" /><circle cx="228" cy="72" r="10" stroke="var(--dash-accent)" strokeOpacity=".18" />
    </svg>;
}

export default function DashboardFolderView() {
    const { user, profile, membership, accessMap } = useDashboard();
    const [progress, setProgress] = useState({ status: 'loading', userId: null, completed: new Set() });
    const [attempt, setAttempt] = useState(0);
    const name = profile?.full_name?.trim().split(/\s+/)[0] || 'Member';
    const ready = progress.status === 'ready' && progress.userId === user.id;
    const failed = progress.status === 'error' && progress.userId === user.id;
    const completedCount = ready ? modules.filter(module => progress.completed.has(module.videoId)).length : null;
    const percentage = ready ? getCourseProgress(modules, progress.completed) : null;
    const accessibleWeeks = curriculumData.filter(week => accessMap?.[week.id]?.unlocked === true).length;
    const started = ready && completedCount > 0;

    useEffect(() => {
        let current = true;
        setProgress({ status: 'loading', userId: user.id, completed: new Set() });
        const load = async () => {
            try {
                const { data, error } = await supabase.from('video_progress').select('video_id').eq('user_id', user.id);
                if (error) throw error;
                if (current) setProgress({ status: 'ready', userId: user.id, completed: getCompletedVideoIds(data || [], modules) });
            } catch {
                if (current) setProgress({ status: 'error', userId: user.id, completed: new Set() });
            }
        };
        load();
        return () => { current = false; };
    }, [user.id, attempt]);

    return <div className="dash-page">
        <div className="dash-page-inner">
            <header className="dash-page-heading">
                <div><p className="dash-eyebrow">Your learning workspace</p><h1>Welcome back, {name}.</h1><p>A considered approach to time, price and energy. Pick up where you left off.</p></div>
                <Link to="/dashboard/profile" className="dash-secondary">{membership.label}<ArrowRight size={13} /></Link>
            </header>
            <section className="dash-stat-grid" aria-label="Course overview">
                <div className="dash-panel dash-stat"><span className="dash-stat-icon"><BookOpen size={18} /></span><div><p className="dash-eyebrow">Foundation curriculum</p><strong>{modules.length}<small>lessons · {curriculumData.length} weeks</small></strong></div></div>
                <div className="dash-panel dash-stat"><span className="dash-stat-icon"><CheckCircle2 size={18} /></span><div><p className="dash-eyebrow">Lessons completed</p><strong>{ready ? completedCount : '—'}<small>{ready ? `${percentage}% of curriculum` : failed ? 'Progress unavailable' : 'Loading progress…'}</small></strong></div></div>
                <div className="dash-panel dash-stat"><span className="dash-stat-icon"><Layers size={18} /></span><div><p className="dash-eyebrow">Curriculum access</p><strong>{accessibleWeeks}<small>of {curriculumData.length} weeks available</small></strong></div></div>
            </section>
            <div className="dash-section-heading"><h2>Your library</h2><span>Learn at your own pace</span></div>
            <section className="dash-feature-grid" aria-label="Learning library">
                <article className="dash-panel dash-course-feature">
                    <StudyArtwork />
                    <div className="dash-feature-copy"><p className="dash-eyebrow">The foundation · Masterclass</p><h2>Time. Price.<br />Energy.</h2><p>Build your understanding of market structure, timing and institutional execution.</p></div>
                    <div className="dash-feature-footer">
                        <Link to="/dashboard/time-price-energy-intro" className="dash-primary"><Play size={13} />{percentage === 100 ? 'Review curriculum' : started ? 'Continue learning' : 'Open curriculum'}<ArrowRight size={13} /></Link>
                        <div className="dash-progress-summary"><div><span>Your progress</span><span>{ready ? `${percentage}%` : '—'}</span></div><div className="dash-progress-track" role={ready ? 'progressbar' : undefined} aria-label="Foundation course completion" aria-valuenow={ready ? percentage : undefined} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percentage || 0}%` }} /></div></div>
                    </div>
                </article>
                <div className="dash-library-column">
                    <Link to="/dashboard/weekly-livestreams" className="dash-panel dash-library-card"><div className="dash-library-card-top"><Radio size={19} /><span className="dash-eyebrow">Session archive</span></div><div><h3>Weekly livestreams</h3><p>Revisit recorded analysis and develop your market perspective.</p></div><div className="dash-library-card-bottom"><span>{recordingCount} recordings</span><ArrowRight size={15} /></div></Link>
                    <Link to="/dashboard/gordian-paradox" className="dash-panel dash-library-card"><div className="dash-library-card-top"><Layers size={19} /><span className="dash-eyebrow">Advanced concepts</span></div><div><h3>The Gordian Paradox</h3><p>Explore the framework behind market projections and execution.</p></div><div className="dash-library-card-bottom"><span>{advancedCount} lessons</span><ArrowRight size={15} /></div></Link>
                </div>
            </section>
            {failed && <div className="dash-error mt-4 flex flex-wrap items-center justify-between gap-3" role="alert"><p>We could not load your progress. Your learning history has not changed.</p><button type="button" onClick={() => setAttempt(value => value + 1)} className="dash-inline-link"><RotateCcw size={12} />Try again</button></div>}
            <div className="dash-section-heading"><h2>Connected to your learning</h2><Link to="/daily-reviews" className="dash-inline-link">Daily reviews<ArrowRight size={12} /></Link></div>
            <section className="dash-resource-grid" aria-label="Community and sessions">
                <a href="https://discord.com/invite/BHkUtCUxzE" target="_blank" rel="noopener noreferrer" className="dash-panel dash-resource-link"><MessageCircle size={19} /><div><strong>Discord community</strong><small>Conversations and session updates</small></div><ArrowRight size={14} /></a>
                <a href="https://t.me/+Dzugyis4oABkYTU0" target="_blank" rel="noopener noreferrer" className="dash-panel dash-resource-link"><Send size={19} /><div><strong>Telegram community</strong><small>Connect with fellow members</small></div><ArrowRight size={14} /></a>
                <Link to="/scheduled-sessions" className="dash-panel dash-resource-link"><Clock size={19} /><div><strong>Live sessions</strong><small>Session formats and announcements</small></div><ArrowRight size={14} /></Link>
            </section>
            <p className="dash-footer-note">Your progress is saved to your account after you watch a lesson.</p>
        </div>
    </div>;
}
