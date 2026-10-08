import { createContext, useContext } from 'react';

const DashboardContext = createContext(null);

export const DashboardProvider = DashboardContext.Provider;

export function useDashboard() {
    const dashboard = useContext(DashboardContext);
    if (!dashboard) throw new Error('useDashboard must be used within DashboardProvider');
    return dashboard;
}
