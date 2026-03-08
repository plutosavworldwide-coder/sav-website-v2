import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';

// ... imports
import { Outlet } from 'react-router-dom';

const Layout = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-pageBg text-textMain relative overflow-hidden font-sans selection:bg-appleBlue selection:text-white">
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
