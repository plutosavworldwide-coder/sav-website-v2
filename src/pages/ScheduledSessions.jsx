import { ArrowUpRight, CalendarDays, MessageCircle, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LibraryHeading } from '../components/DashboardLibrary';

const sessionFormats = [
    { title: 'Market outlook & weekly prep', type: 'Live analysis', description: 'Review market structure, key levels, and potential setups across major indices.' },
    { title: 'Advanced order flow tactics', type: 'Masterclass', description: 'Study order flow at structure extremes and aggressive versus passive market participation.' },
    { title: 'Market recap', type: 'Review', description: 'Revisit price action, trade execution, and the lessons from recent market sessions.' }
];

export default function ScheduledSessions() {
    return <div className="dash-page custom-scrollbar h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-[1200px]">
            <LibraryHeading eyebrow="Community & events" title="Live sessions" description="Market analysis, workshops, and community discussions." />
            <section className="dash-panel overflow-hidden rounded-2xl">
                <div className="border-b border-[var(--dash-border)] px-6 py-4"><h2 className="text-sm font-semibold text-[var(--dash-text)]">Session schedule</h2></div>
                <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-8">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel-raised)] text-[var(--dash-accent)]"><CalendarDays size={23} strokeWidth={1.5} /></div>
                    <div className="flex-1"><h3 className="text-lg font-semibold tracking-tight text-[var(--dash-text)]">No confirmed sessions published</h3><p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--dash-muted)]">Visit the community for the latest session announcements and joining details. Previous sessions are available in the livestream archive.</p></div>
                </div>
                <div className="flex flex-wrap gap-3 border-t border-[var(--dash-border)] px-6 py-4">
                    <a href="https://discord.com/invite/BHkUtCUxzE" target="_blank" rel="noopener noreferrer" className="dash-primary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold"><MessageCircle size={15} />Open community<ArrowUpRight size={14} /></a>
                    <Link to="/dashboard/weekly-livestreams" className="dash-secondary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium"><Video size={15} />Watch recordings</Link>
                </div>
            </section>
            <div className="mb-4 mt-8"><h2 className="text-sm font-semibold text-[var(--dash-text)]">Session formats</h2><p className="mt-1 text-xs text-[var(--dash-subtle)]">What you can explore with the community.</p></div>
            <div className="grid gap-4 md:grid-cols-3">
                {sessionFormats.map(session => <article key={session.title} className="dash-panel rounded-2xl p-5"><p className="dash-eyebrow mb-4">{session.type}</p><h3 className="text-sm font-semibold leading-relaxed text-[var(--dash-text)]">{session.title}</h3><p className="mt-2 text-xs leading-relaxed text-[var(--dash-muted)]">{session.description}</p></article>)}
            </div>
        </div>
    </div>;
}
