import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppSidebar } from './AppSidebar';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const DashboardLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    navigate('/signing');
                    return;
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('subscription_status, subscription_end_date, subscription_type')
                    .eq('id', user.id)
                    .single();

                // Check subscription status
                if (profile?.subscription_status !== 'active') {
                    navigate('/subscription-expired');
                    return;
                }

                // Check subscription end date (if present, null = lifetime)
                if (profile?.subscription_end_date) {
                    const endDate = new Date(profile.subscription_end_date);
                    if (endDate < new Date()) {
                        navigate('/subscription-expired');
                        return;
                    }
                }

                // Handle indicators-only users
                if (profile?.subscription_type === 'indicators_only') {
                    // Indicators-only users can only access /indicators page
                    if (location.pathname !== '/indicators') {
                        navigate('/indicators');
                    }
                }
            } catch (error) {
                console.error('Access check failed:', error);
                navigate('/signing');
            } finally {
                setIsLoading(false);
            }
        };

        checkAccess();
    }, [navigate, location.pathname]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-premium-gold" />
            </div>
        );
    }
    return (
        <AppSidebar>
            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="h-full w-full"
                >
                    <Outlet />
                </motion.div>
            </AnimatePresence>
        </AppSidebar>
    );
};

export default DashboardLayout;
