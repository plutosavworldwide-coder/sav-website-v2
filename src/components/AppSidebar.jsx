import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    BarChart2,
    LogOut,
    Menu,
    XCircle,
    Loader2,
    Shield,
    CreditCard,
    Sun,
    Moon,
    Video,
    Calendar,
    Settings,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";
import { supabase } from '../lib/supabase';

export function AppSidebar({ children }) {
    const [open, setOpen] = useState(false);

    const [isAdmin, setIsAdmin] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userAvatar, setUserAvatar] = useState('');
    const [userName, setUserName] = useState('');
    const [subscriptionType, setSubscriptionType] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch user data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setUserEmail(user.email || '');
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role, full_name, avatar_url, subscription_type')
                        .eq('id', user.id)
                        .single();
                    if (profile) {
                        setIsAdmin(profile.role === 'admin');
                        setUserName(profile.full_name || '');
                        setUserAvatar(profile.avatar_url || '');
                        setSubscriptionType(profile.subscription_type || '');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };
        fetchUserData();
    }, []);

    const links = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: (
                <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Daily Reviews",
            href: "/daily-reviews",
            icon: (
                <Video className="h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Tools",
            href: "/indicators",
            icon: (
                <BarChart2 className="h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Scheduled Sessions",
            href: "/scheduled-sessions",
            icon: (
                <Calendar className="h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Economic Calendar",
            href: "/dashboard/calendar",
            icon: (
                <Video className="h-5 w-5 flex-shrink-0" />
            ),
        },
        ...(isAdmin ? [{
            label: "Admin",
            href: "/admin",
            icon: (
                <Shield className="text-white h-5 w-5 flex-shrink-0" />
            ),
        }] : [])
    ];

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/');
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    };

    const handleCancelSubscription = async () => {
        setIsCancelling(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Please sign in again');
                return;
            }

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ reason: 'User requested cancellation from dashboard' })
                }
            );

            const result = await response.json();

            if (result.success) {
                alert('Your subscription has been cancelled successfully.');
                setShowCancelConfirm(false);
                window.location.reload();
            } else {
                alert(result.error || 'Failed to cancel subscription.');
            }
        } catch (error) {
            console.error('Cancellation failed:', error);
            alert('Failed to cancel subscription.');
        } finally {
            setIsCancelling(false);
        }
    };

    // Get initials for avatar fallback
    const getInitials = () => {
        if (userName) return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        if (userEmail) return userEmail[0].toUpperCase();
        return 'U';
    };

    return (
        <div className={cn(
            "flex flex-col md:flex-row w-full flex-1 overflow-hidden",
            "h-screen bg-black text-white font-sans selection:bg-white/20"
        )}>
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10 border-r border-white/[0.05] bg-black">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => {
                                const isActive = location.pathname.startsWith(link.href) && (link.href !== "/dashboard" || location.pathname === "/dashboard" || location.pathname === "/dashboard/time-price-energy-intro" || location.pathname === "/dashboard/weekly-livestreams" || location.pathname === "/dashboard/gordian-paradox");
                                return (
                                    <SidebarLink
                                        key={idx}
                                        link={{
                                            ...link,
                                            icon: React.cloneElement(link.icon, {
                                                className: cn(
                                                    "h-5 w-5 flex-shrink-0 transition-colors duration-300",
                                                    isActive ? "text-white" : "text-zinc-500 group-hover:text-white"
                                                )
                                            })
                                        }}
                                        className={cn(
                                            "transition-colors duration-200 rounded-2xl px-3 py-2.5 group",
                                            isActive
                                                ? "bg-white/10 text-white font-medium shadow-sm"
                                                : "text-zinc-500 hover:text-white hover:bg-white/5 font-medium"
                                        )}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar Footer */}
                    <div className="flex flex-col gap-3 border-t border-white/[0.05] pt-4">
                        {/* Short Footer (Icon Only) - When Closed */}
                        {!open && (
                            <div className="flex flex-col items-center gap-4">
                                <button
                                    onClick={handleSignOut}
                                    title="Sign Out"
                                    className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-colors"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white shadow-sm font-semibold">
                                    {getInitials()}
                                </div>
                            </div>
                        )}

                        {/* Full Footer - When Open */}
                        {open && (
                            <div className="flex items-center justify-between px-2">
                                <div className="flex flex-1 items-center gap-3 w-full pr-2">
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white font-semibold shrink-0 shadow-sm">
                                        {getInitials()}
                                    </div>
                                    <div className="flex flex-col overflow-hidden min-w-0 pr-2">
                                        <span className="text-sm font-semibold text-white truncate max-w-[120px]">
                                            {userName || 'User'}
                                        </span>
                                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest truncate">
                                            {subscriptionType || 'Free Plan'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="p-2.5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors shrink-0"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </SidebarBody>
            </Sidebar>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col h-full overflow-hidden relative bg-black">
                {/* Content */}
                <div className="relative z-10 w-full h-full flex flex-col">
                    {children}
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[150] flex items-center justify-center p-4">
                    <div className="bg-[#101010] border border-white/[0.05] rounded-[2rem] p-8 max-w-sm w-full shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-white tracking-tight">Cancel Sub?</h3>
                        </div>
                        <p className="text-zinc-400 font-medium text-sm mb-8 leading-relaxed">
                            Are you sure? This action cannot be undone. You will lose access to premium features immediately.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleCancelSubscription}
                                disabled={isCancelling}
                                className="w-full px-4 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                            >
                                {isCancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Cancel'}
                            </button>
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="w-full px-4 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all font-semibold"
                            >
                                Keep Subscription
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// User Text Component (Animated)
const UserText = ({ name, email }) => {
    const { open, animate } = useSidebar();
    return (
        <motion.div
            animate={{
                display: animate ? (open ? "flex" : "none") : "flex",
                opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className="flex flex-col items-start ml-1 overflow-hidden"
        >
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate max-w-[150px]">
                {name}
            </span>
        </motion.div>
    );
};

export const Logo = () => {
    return (
        <Link
            to="/dashboard"
            className="font-normal flex space-x-3 items-center text-sm py-1 relative z-20 pl-2"
        >
            <div className="w-8 h-8 rounded-full bg-white text-black flex flex-col items-center justify-center font-bold text-xs tracking-tighter leading-none shrink-0 shadow-sm">
                <span>TP</span>
                <span>E/</span>
            </div>
            <span className="font-semibold text-lg text-white whitespace-nowrap tracking-tight">
                Time Price Energy
            </span>
        </Link>
    );
};

export const LogoIcon = () => {
    return (
        <Link
            to="/dashboard"
            className="font-normal flex items-center justify-center text-sm py-1 relative z-20"
        >
            <div className="w-8 h-8 rounded-full bg-white text-black flex flex-col items-center justify-center font-bold text-xs tracking-tighter leading-none shrink-0 shadow-sm">
                <span>TP</span>
                <span>E/</span>
            </div>
        </Link>
    );
};
