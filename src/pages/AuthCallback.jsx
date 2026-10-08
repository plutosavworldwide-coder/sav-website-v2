import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { clearPendingAuth, getAuthStorage, PENDING_PLAN_KEY, readOAuthError, readPendingAuth, resolveAuthDestination } from '../lib/authReturn';

const getUrlParams = (locationSearch, locationHash) => ({
    query: new URLSearchParams(locationSearch),
    hash: new URLSearchParams((locationHash || '').replace(/^#/, ''))
});

const confirmReturnedSession = async (locationSearch, locationHash) => {
    // The default Supabase client initializes its session from any return URL.
    // Reuse that session before attempting to exchange an already-consumed code.
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (session) return session;

    const { query, hash } = getUrlParams(locationSearch, locationHash);
    const authCode = query.get('code');
    const accessToken = hash.get('access_token');
    const refreshToken = hash.get('refresh_token');

    if (authCode) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);
        if (error) {
            throw error;
        }
        if (data?.session) {
            return data.session;
        }
    }

    if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
        });
        if (error) {
            throw error;
        }
        if (data?.session) {
            return data.session;
        }
    }

    return waitForSession();
};

const waitForSession = async () => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            return session;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
    }
    return null;
};

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const didRun = useRef(false);
    const [status, setStatus] = useState('Completing secure sign in...');

    useEffect(() => {
        if (didRun.current) return;
        didRun.current = true;

        const finishSignIn = async () => {
            const storage = getAuthStorage();
            const pending = readPendingAuth(storage);
            const authError = readOAuthError(location.search, location.hash);
            if (authError) {
                clearPendingAuth(storage);
                navigate('/signing', {
                    replace: true,
                    state: { authError }
                });
                return;
            }

            const queryParams = new URLSearchParams(location.search);
            const destination = resolveAuthDestination(queryParams.get('next'), pending);
            let session = null;

            try {
                session = await confirmReturnedSession(location.search, location.hash);
            } catch (error) {
                clearPendingAuth(storage);
                navigate('/signing', {
                    replace: true,
                    state: { authError: error.message || 'We could not complete Google sign in. Please try again.' }
                });
                return;
            }

            if (!session) {
                clearPendingAuth(storage);
                navigate('/signing', {
                    replace: true,
                    state: { authError: 'We could not confirm your Google session. Please try signing in again.' }
                });
                return;
            }

            clearPendingAuth(storage);
            setStatus(destination.path === '/payment' ? 'Returning to your selected membership...' : 'Taking you to your dashboard...');
            navigate(destination.path, { replace: true, ...(destination.state ? { state: destination.state } : {}) });
        };

        finishSignIn();
    }, [location.search, location.hash, navigate]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 font-sans">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            <p className="text-sm font-medium text-zinc-500">{status}</p>
        </div>
    );
};

export { PENDING_PLAN_KEY };
export default AuthCallback;
