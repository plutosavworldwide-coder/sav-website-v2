import React, { useState, useEffect } from "react";
import {
    LayoutDashboard,
    BarChart2,
    LogOut,
    XCircle,
    Loader2,
    Shield,
    Video,
    Calendar,
    ChevronRight,
    Zap,
    Menu,
    X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from '../lib/supabase';

export function AppSidebar({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [subscriptionType, setSubscriptionType] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setUserEmail(user.email || '');
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role, full_name, subscription_type')
                        .eq('id', user.id)
                        .single();
                    if (profile) {
                        setIsAdmin(profile.role === 'admin');
                        setUserName(profile.full_name || '');
                        setSubscriptionType(profile.subscription_type || '');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };
        fetchUserData();
    }, []);

    const navItems = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Daily Reviews", href: "/daily-reviews", icon: Video },
        { label: "Tools", href: "/indicators", icon: BarChart2 },
        { label: "Live Sessions", href: "/scheduled-sessions", icon: Calendar }
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
            if (!session) { alert('Please sign in again'); return; }
            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`,
                {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason: 'User requested cancellation from dashboard' })
                }
            );
            const result = await response.json();
            if (result.success) {
                alert('Subscription cancelled.');
                setShowCancelConfirm(false);
                window.location.reload();
            } else {
                alert(result.error || 'Failed to cancel subscription.');
            }
        } catch (error) {
            alert('Failed to cancel subscription.');
        } finally {
            setIsCancelling(false);
        }
    };

    const getInitials = () => {
        if (userName) return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        if (userEmail) return userEmail[0].toUpperCase();
        return 'U';
    };

    const isActive = (href) => {
        if (href === "/dashboard") {
            return location.pathname === "/dashboard" || location.pathname.startsWith("/dashboard/");
        }
        return location.pathname.startsWith(href);
    };

    const tierLabel = subscriptionType
        ? subscriptionType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : 'Free Plan';

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#18181b] text-white">

            {/* Logo / Brand */}
            <div className="px-5 py-5 border-b border-[#27272a]">
                <Link to="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 text-white flex flex-col items-center justify-center font-bold text-[9px] tracking-tighter leading-none shrink-0 border border-zinc-700">
                        <span>TP</span>
                        <span>E/</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[14px] font-semibold text-zinc-100 tracking-tight leading-none">Time Price Energy</span>
                        <span className="text-[11px] text-zinc-400 font-medium mt-1">Trading Education</span>
                    </div>
                </Link>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5 custom-scrollbar">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-3 mt-1">Navigation</p>
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group my-0.5",
                                active
                                    ? "bg-zinc-800 text-white shadow-sm"
                                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                            )}
                        >
                            {/* Active left accent */}
                            {active && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#2383e2] rounded-r-full shadow-[0_0_8px_rgba(35,131,226,0.6)]" />
                            )}
                            <Icon
                                size={18}
                                strokeWidth={active ? 2.5 : 2}
                                className={cn(
                                    "shrink-0 transition-colors",
                                    active ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                                )}
                            />
                            <span className="truncate tracking-wide">{item.label}</span>
                            {active && (
                                <ChevronRight size={14} strokeWidth={3} className="ml-auto shrink-0 text-zinc-500" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User card at bottom */}
            <div className="border-t border-[#27272a] px-3 py-3">
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-zinc-800/80 transition-colors group cursor-pointer">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-inner">
                        {getInitials()}
                    </div>
                    {/* User info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-zinc-100 truncate leading-none">
                            {userName || userEmail?.split('@')[0] || 'User'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <Zap size={10} className="text-amber-400 shrink-0" fill="currentColor" />
                            <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase truncate">{tierLabel}</span>
                        </div>
                    </div>
                    {/* Sign out */}
                    <button
                        onClick={handleSignOut}
                        title="Sign Out"
                        className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors shrink-0 group-hover:opacity-100 opacity-60"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row w-full flex-1 overflow-hidden h-screen bg-white text-[#37352f] font-sans selection:bg-[#2383e2]/20">

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-[250px] shrink-0 h-full bg-[#18181b] border-r border-[#27272a] shadow-xl z-20">
                <SidebarContent />
            </aside>

            {/* Mobile top bar */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#27272a] bg-[#18181b] shrink-0 z-50">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 text-white flex flex-col items-center justify-center font-bold text-[9px] tracking-tighter leading-none">
                        <span>TP</span>
                        <span>E/</span>
                    </div>
                    <span className="text-sm font-semibold text-white tracking-tight">Time Price Energy</span>
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 260 }}
                            className="md:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-[#18181b] border-r border-[#27272a] shadow-2xl z-50"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex flex-1 flex-col h-full overflow-hidden relative bg-white">
                <div className="relative z-10 w-full h-full flex flex-col">
                    {children}
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelConfirm && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
                    <div className="bg-white border border-[#e9e9e7] rounded-2xl p-8 max-w-sm w-full shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-[#37352f] tracking-tight">Cancel Sub?</h3>
                        </div>
                        <p className="text-[#787774] font-medium text-sm mb-8 leading-relaxed">
                            Are you sure? This action cannot be undone and you'll lose access to premium features immediately.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleCancelSubscription}
                                disabled={isCancelling}
                                className="w-full px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Cancel'}
                            </button>
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="w-full px-4 py-2.5 rounded-lg bg-[#F7F7F5] hover:bg-[#efefed] text-[#37352f] transition-all font-medium border border-[#e9e9e7]"
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

export const Logo = () => (
    <Link to="/dashboard" className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-[#37352f] text-white flex flex-col items-center justify-center font-bold text-[10px] tracking-tighter leading-none shrink-0">
            <span>TP</span>
            <span>E/</span>
        </div>
        <span className="font-semibold text-[14px] text-[#37352f] tracking-tight">Time Price Energy</span>
    </Link>
);

export const LogoIcon = () => (
    <Link to="/dashboard" className="flex items-center justify-center">
        <div className="w-6 h-6 rounded bg-[#37352f] text-white flex flex-col items-center justify-center font-bold text-[10px] tracking-tighter leading-none shrink-0">
            <span>TP</span>
            <span>E/</span>
        </div>
    </Link>
);
