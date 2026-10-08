import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Signing from './pages/Signing';
import AuthCallback from './pages/AuthCallback';
import ChoosePlan from './pages/ChoosePlan';
import Payment from './pages/Payment';
import Indicators from './pages/Indicators';
import AdminPage from './pages/AdminPage';
import DashboardFolderView from './pages/DashboardFolderView';
import TimePriceEnergyIntroduction from './pages/TimePriceEnergyIntroduction';
import WeeklyLivestreams from './pages/WeeklyLivestreams';
import DashboardLayout from './components/DashboardLayout';
import AboutUs from './pages/AboutUs';
import DailyReviews from './pages/DailyReviews';
import Product from './pages/Product';
import Pricing from './pages/Pricing';
import ScheduledSessions from './pages/ScheduledSessions';
import Profile from './pages/Profile';

import { ThemeProvider } from "./components/ThemeProvider";
import GordianParadox from './pages/GordianParadox';
import SubscriptionExpired from './pages/SubscriptionExpired';
import { getAuthStorage, shouldHandleDashboardReturn } from './lib/authReturn';

export function DashboardEntry() {
    const location = useLocation();
    // Supabase may consume the URL tokens before React renders; the short-lived
    // marker also sends that return through checkout recovery before plan checks.
    return shouldHandleDashboardReturn(location, getAuthStorage()) ? <AuthCallback /> : <DashboardLayout />;
}

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    {/* Public Routes with Top Nav */}
                    <Route element={<Layout />}>
                        <Route path="/" element={<Landing />} />
                        <Route path="/about-us" element={<AboutUs />} />
                        <Route path="/product" element={<Product />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="/choose-plan" element={<ChoosePlan />} />
                        <Route path="/payment" element={<Payment />} />
                        <Route path="/subscription-expired" element={<SubscriptionExpired />} />
                    </Route>
                    <Route path="/signing" element={<Signing />} />

                    {/* Dashboard Routes with Persistent Sidebar (No Top Nav) */}
                    <Route element={<DashboardEntry />}>

                        <Route path="/dashboard" element={<DashboardFolderView />} />
                        <Route path="/dashboard/profile" element={<Profile />} />
                        <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />

                        <Route path="/daily-reviews" element={<DailyReviews />} />
                        <Route path="/dashboard/weekly-livestreams" element={<WeeklyLivestreams />} />
                        <Route path="/dashboard/market-mastery" element={<Navigate to="/dashboard/time-price-energy-intro" replace />} />
                        <Route path="/dashboard/time-price-energy-intro" element={<TimePriceEnergyIntroduction />} />
                        <Route path="/dashboard/gordian-paradox" element={<GordianParadox />} />
                        <Route path="/indicators" element={<Indicators />} />
                        <Route path="/scheduled-sessions" element={<ScheduledSessions />} />
                        <Route path="/admin" element={<AdminPage />} />
                    </Route>
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
