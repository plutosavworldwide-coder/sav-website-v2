import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, LogOut, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MembershipPlanCards from '../components/MembershipPlanCards';
import { useTheme } from '../components/ThemeProvider';

export default function ChoosePlan() {
    const navigate = useNavigate();
    const { resolvedTheme } = useTheme();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession());
            if (session?.user) setUser(session.user);
        };
        checkUser();
    }, []);

    const selectPlan = async plan => {
        const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession());
        if (session) navigate('/payment', { state: { plan } });
        else navigate('/signing', { state: { plan } });
    };

    return <div className={`dashboard-theme ${resolvedTheme} min-h-[calc(100dvh-80px)] px-6 py-8 md:px-10 md:py-10`}>
        <div className="mx-auto w-full max-w-[1200px]">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
                <button type="button" onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-xs font-medium text-[var(--dash-muted)] transition-colors hover:text-[var(--dash-text)]"><ArrowLeft size={14} />Back</button>
                {user && <div className="flex min-w-0 items-center gap-3 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-panel)] px-3 py-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--dash-panel-raised)] text-xs font-medium text-[var(--dash-text)]">{user.email.charAt(0).toUpperCase()}</span><span className="max-w-[190px] truncate text-xs text-[var(--dash-muted)] sm:max-w-none">{user.email}</span><button type="button" onClick={async () => { const { supabase } = await import('../lib/supabase'); await supabase.auth.signOut(); setUser(null); navigate('/'); }} className="inline-flex shrink-0 items-center gap-1.5 border-l border-[var(--dash-border)] pl-3 text-xs text-[var(--dash-muted)] transition-colors hover:text-[var(--dash-text)]"><LogOut size={12} />Sign out</button></div>}
            </div>
            <header className="mb-8"><p className="dash-eyebrow mb-2">Membership selection</p><h1 className="text-[28px] font-semibold leading-tight tracking-[-0.035em] text-[var(--dash-text)] md:text-[32px]">Select your access</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--dash-muted)]">Choose monthly, extended, or lifetime mentorship access.</p></header>
            <MembershipPlanCards onSelect={selectPlan} />
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs leading-relaxed text-[var(--dash-subtle)]"><span className="inline-flex items-center gap-2"><ShieldCheck size={14} />Payment handled by PayPal</span><Link to="/pricing" className="inline-flex items-center gap-1.5 text-[var(--dash-muted)] transition-colors hover:text-[var(--dash-text)]">Compare memberships<ArrowRight size={12} /></Link></div>
        </div>
    </div>;
}
