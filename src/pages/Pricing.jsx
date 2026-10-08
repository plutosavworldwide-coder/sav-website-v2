import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MembershipPlanCards from '../components/MembershipPlanCards';
import { useTheme } from '../components/ThemeProvider';

export default function Pricing() {
    const navigate = useNavigate();
    const { resolvedTheme } = useTheme();

    return <div className={`dashboard-theme ${resolvedTheme} min-h-[calc(100dvh-80px)] px-6 py-8 md:px-10 md:py-10`}>
        <div className="mx-auto w-full max-w-[1200px]">
            <button type="button" onClick={() => navigate('/')} className="mb-7 inline-flex items-center gap-2 text-xs font-medium text-[var(--dash-muted)] transition-colors hover:text-[var(--dash-text)]"><ArrowLeft size={14} />Back to home</button>
            <header className="mb-8">
                <p className="dash-eyebrow mb-2">SAV FX memberships</p>
                <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.035em] text-[var(--dash-text)] md:text-[32px]">Choose your membership</h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--dash-muted)]">Monthly, extended, or lifetime mentorship access. Find the duration that works for you.</p>
            </header>
            <MembershipPlanCards onSelect={plan => navigate('/signing', { state: { plan } })} />
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs leading-relaxed text-[var(--dash-subtle)]"><ShieldCheck size={14} /><span>Payment handled by PayPal. Review your selected membership at checkout.</span></div>
        </div>
    </div>;
}
