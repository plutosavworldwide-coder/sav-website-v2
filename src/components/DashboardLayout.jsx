import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppSidebar } from './AppSidebar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { DashboardProvider } from './DashboardContext';
import { useTheme } from './ThemeProvider';
import { getUserAccessMap } from '../lib/accessEngine';
import { getDashboardRedirect, resolveMembership } from '../lib/membership';

const CHECKING = { phase: 'checking', user: null, profile: null, membership: null, accessMap: null };

const DashboardLayout = () => {
    const location = useLocation();
    const { resolvedTheme } = useTheme();
    const [dashboard, setDashboard] = useState(CHECKING);
    const requestId = useRef(0);

    const refresh = useCallback(async ({ preserveContent = false } = {}) => {
        const request = ++requestId.current;
        if (!preserveContent) setDashboard(CHECKING);
        const isCurrent = () => requestId.current === request;

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (!isCurrent()) return;
            if (sessionError) throw sessionError;
            if (!session) {
                setDashboard({ ...CHECKING, phase: 'signed-out' });
                return;
            }

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (!isCurrent()) return;
            if (userError) {
                if (userError.name === 'AuthSessionMissingError' || userError.status === 401) {
                    setDashboard({ ...CHECKING, phase: 'signed-out' });
                    return;
                }
                throw userError;
            }
            if (!user) {
                setDashboard({ ...CHECKING, phase: 'signed-out' });
                return;
            }

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();
            if (!isCurrent()) return;
            if (profileError) throw profileError;

            const now = Date.now();
            const membership = resolveMembership(profile, now);
            if (membership.status === 'invalid') throw new Error('Membership details could not be verified');
            const accessMap = membership.canEnterDashboard
                ? await getUserAccessMap(user, { profile, now })
                : {};
            if (!isCurrent()) return;
            setDashboard({ phase: 'ready', user, profile, membership, accessMap });
        } catch {
            // An unavailable lookup is retryable; it is not evidence of expiry.
            if (isCurrent()) setDashboard({ ...CHECKING, phase: 'error' });
        }
    }, []);

    useEffect(() => {
        let disposed = false;
        refresh();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                ++requestId.current;
                setDashboard({ ...CHECKING, phase: 'signed-out' });
            } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                // Hide the previous account and reject its pending requests immediately.
                ++requestId.current;
                setDashboard(CHECKING);
                // Leave the auth callback before invoking another Supabase auth method.
                setTimeout(() => { if (!disposed) refresh(); }, 0);
            }
        });
        return () => {
            disposed = true;
            ++requestId.current;
            subscription.unsubscribe();
        };
    }, [refresh]);

    useEffect(() => {
        const { profile, membership } = dashboard;
        if (dashboard.phase !== 'ready' || !membership?.canEnterDashboard || membership.isAdmin || membership.plan === 'lifetime' || !profile?.subscription_end_date) return;
        const delay = new Date(profile.subscription_end_date).getTime() - Date.now();
        if (!Number.isFinite(delay)) return;
        const timeout = setTimeout(refresh, Math.min(Math.max(0, delay) + 10, 2147483647));
        return () => clearTimeout(timeout);
    }, [dashboard, refresh]);

    if (dashboard.phase === 'checking' || dashboard.phase === 'error') {
        const failed = dashboard.phase === 'error';
        return (
            <main className={`dashboard-theme ${resolvedTheme} dash-page min-h-screen flex items-center justify-center px-6`}>
                <div className="dash-panel w-full max-w-md p-8 text-center" role={failed ? 'alert' : 'status'} aria-live="polite">
                    {failed
                        ? <AlertCircle className="dash-error mx-auto mb-4 h-7 w-7" />
                        : <Loader2 className="dash-muted mx-auto mb-4 h-7 w-7 animate-spin" />}
                    <p className="dash-eyebrow mb-2">Member workspace</p>
                    <h1 className="text-lg font-semibold">{failed ? 'Membership check unavailable' : 'Preparing your dashboard'}</h1>
                    <p className="dash-muted mt-2 text-sm">{failed ? 'We could not verify your access. Please try again.' : 'Verifying your account and course access.'}</p>
                    {failed && (
                        <button type="button" onClick={refresh} className="dash-primary mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold">
                            <RefreshCw className="h-4 w-4" /> Try again
                        </button>
                    )}
                </div>
            </main>
        );
    }

    if (dashboard.phase === 'signed-out') return <Navigate to="/signing" replace state={{ from: location.pathname }} />;

    // Re-evaluate dates on navigation even before the expiry timer refreshes.
    const membership = resolveMembership(dashboard.profile);
    const redirect = getDashboardRedirect(membership, location.pathname);
    if (redirect) return <Navigate to={redirect} replace />;

    return (
        <DashboardProvider key={dashboard.user.id} value={{ user: dashboard.user, profile: dashboard.profile, membership, accessMap: dashboard.accessMap, refresh: () => refresh({ preserveContent: true }) }}>
            <AppSidebar>
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="h-full w-full"
                >
                    <Outlet />
                </motion.div>
            </AppSidebar>
        </DashboardProvider>
    );
};

export default DashboardLayout;
