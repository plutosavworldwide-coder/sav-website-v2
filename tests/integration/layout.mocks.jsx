import React, { useEffect } from 'react';
import { useDashboard } from '../../src/components/DashboardContext.jsx';

export const mocks = {
    user: null, pathname: '/dashboard', profiles: {}, profileQueue: [], profileError: null,
    overrideError: null, listener: null, dashboard: null, mounts: 0, unmounts: 0,
};

export const supabase = {
    auth: {
        async getSession() { return { data: { session: mocks.user ? { user: mocks.user } : null }, error: null }; },
        async getUser() { return { data: { user: mocks.user }, error: null }; },
        onAuthStateChange(listener) {
            mocks.listener = listener;
            return { data: { subscription: { unsubscribe() { mocks.listener = null; } } } };
        },
    },
    from(table) {
        let id;
        const query = {
            select() { return query; },
            eq(column, value) {
                id = value;
                if (table === 'access_overrides') return Promise.resolve({ data: [], error: mocks.overrideError });
                return query;
            },
            async maybeSingle() {
                if (mocks.profileQueue.length) return mocks.profileQueue.shift();
                return { data: mocks.profiles[id], error: mocks.profileError };
            },
        };
        return query;
    },
};

export function AppSidebar({ children }) {
    const dashboard = useDashboard();
    mocks.dashboard = dashboard;
    return React.createElement('workspace-user', { id: dashboard.user.id }, children);
}
export const useLocation = () => ({ pathname: mocks.pathname });
export const useTheme = () => ({ resolvedTheme: mocks.theme || 'dark' });
export const Navigate = ({ to }) => React.createElement('navigate-test', { to });
export function Outlet() {
    useEffect(() => { ++mocks.mounts; return () => { ++mocks.unmounts; }; }, []);
    return React.createElement('protected-outlet');
}
export const motion = {
    div: ({ children }) => React.createElement('motion-test', null, children),
};
