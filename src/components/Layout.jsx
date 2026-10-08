import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';

// ... imports
import { Outlet } from 'react-router-dom';
import { useTheme } from './ThemeProvider';

const Layout = () => {
    const location = useLocation();
    const { resolvedTheme } = useTheme();
    const memberRoute = ['/pricing', '/choose-plan', '/payment', '/subscription-expired', '/auth/callback'].includes(location.pathname.toLowerCase());

    return (
        <div className={`min-h-screen relative overflow-hidden font-sans ${memberRoute ? `dashboard-theme ${resolvedTheme}` : 'bg-pageBg text-textMain selection:bg-appleBlue selection:text-white'}`}>
            {/* Clean Flat Background */}
            <Header />

            <AnimatePresence mode="wait">
                <motion.main
                    key={location.pathname}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="relative z-10 pt-20"
                >
                    <Outlet />
                </motion.main>
            </AnimatePresence>
        </div>
    );
};

export default Layout;
