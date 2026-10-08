import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Layers, Loader2, LockKeyhole, Radio } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { clearPendingAuth, getAuthStorage, storePendingAuth } from '../lib/authReturn';
import { useTheme } from '../components/ThemeProvider';
import ThemeToggle from '../components/ThemeToggle';
import { resolvePurchasePlan } from '../lib/purchasePlans';

export default function Signing() {
    const navigate = useNavigate();
    const location = useLocation();
    const { resolvedTheme } = useTheme();
    const [authError, setAuthError] = useState(location.state?.authError || '');
    const [signingIn, setSigningIn] = useState(false);
    const purchasePlan = resolvePurchasePlan(location.state?.plan);

    useEffect(() => {
        let current = true;
        if (location.state?.authError) setAuthError(location.state.authError);
        supabase.auth.getSession().then(({ data, error }) => {
            if (!current) return;
            if (error) { setAuthError('Could not check your session. Please try signing in.'); return; }
            if (data?.session) {
                if (purchasePlan) navigate('/payment', { state: { plan: purchasePlan }, replace: true });
                else navigate('/dashboard', { replace: true });
            }
        }).catch(() => { if (current) setAuthError('Could not check your session. Please try signing in.'); });
        return () => { current = false; };
    }, [navigate, location.state, purchasePlan]);

    const signIn = async () => {
        if (signingIn) return;
        setSigningIn(true);
        setAuthError('');
        try {
            const nextPath = purchasePlan ? '/payment' : '/dashboard';
            storePendingAuth(getAuthStorage(), nextPath, purchasePlan);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                    queryParams: { access_type: 'offline', prompt: 'consent' },
                },
            });
            if (error) throw error;
        } catch (error) {
            clearPendingAuth(getAuthStorage());
            setAuthError(error.message || 'Could not sign in. Please try again.');
            setSigningIn(false);
        }
    };

    return <div className={`dashboard-theme ${resolvedTheme} member-signing`}>
        <div className="member-signing-inner">
            <div className="member-entry-top"><Link to="/" className="dash-inline-link member-back"><ArrowLeft size={14} />Back to home</Link><ThemeToggle /></div>
            <div className="member-signing-grid">
                <section className="member-signing-intro">
                    <p className="dash-eyebrow">SAV FX · Member workspace</p>
                    <h1>A sharper<br />perspective.</h1>
                    <p>A focused space to study market structure, refine your understanding and build your approach.</p>
                    <div className="member-signing-features">
                        <div><BookOpen size={17} /><span>Structured curriculum</span></div>
                        <div><Radio size={17} /><span>Session recordings</span></div>
                        <div><Layers size={17} /><span>Trading resources</span></div>
                    </div>
                </section>
                <section className="dash-panel member-signing-card">
                    <span className="member-signing-lock"><LockKeyhole size={21} /></span>
                    <p className="dash-eyebrow">Member access</p>
                    <h2>Welcome back.</h2>
                    <p>Sign in with the Google account linked to your membership to open your dashboard.</p>
                    {authError && <div className="dash-error" role="alert">{authError}</div>}
                    <button type="button" className="member-google" onClick={signIn} disabled={signingIn}>
                        {signingIn ? <Loader2 size={17} className="animate-spin" /> : <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.7 3-4.3 3-7.6Z" /><path fill="#34A853" d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.3-2.6c-.9.6-2.1 1-3.6 1-2.7 0-5-1.8-5.8-4.3H2.8v2.7A10.4 10.4 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.2 13.6a6.1 6.1 0 0 1 0-3.2V7.7H2.8a10 10 0 0 0 0 8.6l3.4-2.7Z" /><path fill="#EA4335" d="M12 6.1c1.6 0 3 .6 4.1 1.6l3.1-3.1A10 10 0 0 0 12 2a10.4 10.4 0 0 0-9.2 5.7l3.4 2.7C7 7.9 9.3 6.1 12 6.1Z" /></svg>}
                        {signingIn ? 'Connecting to Google…' : 'Continue with Google'}{!signingIn && <ArrowRight size={15} />}
                    </button>
                    <div className="member-signing-help"><p>New to SAV FX?</p><Link to="/pricing" className="dash-inline-link">Explore memberships<ArrowRight size={12} /></Link></div>
                </section>
            </div>
        </div>
    </div>;
}
