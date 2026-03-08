import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart2, CheckCircle, Lock, ArrowRight, Zap, Play, Search, User, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

// --- Main Page Component ---

const Indicators = () => {
    const navigate = useNavigate();
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tradingviewUsername, setTradingviewUsername] = useState('');
    const [inputUsername, setInputUsername] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [saving, setSaving] = useState(false);

    // Admin-only: Fetch all users with TradingView usernames
    const [allUsers, setAllUsers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedId, setCopiedId] = useState(null);

    const handleCopy = (text, id) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    useEffect(() => {
        const checkAccess = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('subscription_status, subscription_type, tradingview_username, role')
                    .eq('id', user.id)
                    .single();

                if (profile && (profile.subscription_status === 'active' || profile.role === 'admin')) {
                    setHasAccess(true);
                    setTradingviewUsername(profile.tradingview_username || '');

                    if (profile.role === 'admin' && user.email === 'savfxtrading@gmail.com') {
                        setIsAdmin(true);
                        const { data: users, error } = await supabase.rpc('get_admin_tv_users');

                        if (error) {
                            console.error('Error fetching users:', error);
                            setFetchError(error.message);
                        } else if (users) {
                            setAllUsers(users);
                        }
                    }
                }
            }
            setLoading(false);
        };
        checkAccess();
    }, []);

    const handleSubmitUsername = () => {
        if (!inputUsername.trim()) {
            alert('Please enter a TradingView username');
            return;
        }
        setShowConfirmation(true);
    };

    const handleConfirmUsername = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('profiles')
                .update({ tradingview_username: inputUsername.trim() })
                .eq('id', user.id);

            if (error) throw error;

            setTradingviewUsername(inputUsername.trim());
            setShowConfirmation(false);
            setInputUsername('');
        } catch (error) {
            console.error('Failed to save TradingView username:', error);
            alert('Failed to save username. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-black">
                <div className="h-6 w-6 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    // --- State: Locked ---
    if (!hasAccess) {
        return (
            <div className="flex flex-col h-full w-full items-center justify-center p-8 bg-black">
                <div className="max-w-[420px] w-full p-10 flex flex-col items-center text-center bg-[#101010] border border-white/[0.05] rounded-[2.5rem]">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-8 shadow-xl">
                        <Lock size={32} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-semibold text-white tracking-tight mb-4">Restricted Access.</h2>
                    <p className="text-zinc-500 mb-10 font-medium text-sm leading-relaxed max-w-sm">
                        The Indicator Suite is exclusive to active subscribers. Upgrade your plan to unlock these premium trading tools.
                    </p>
                    <button
                        onClick={() => navigate('/choose-plan')}
                        className="w-full py-4 bg-white text-black font-semibold rounded-full hover:scale-105 active:scale-95 transition-transform duration-300 shadow-xl"
                    >
                        View Plans
                    </button>
                </div>
            </div>
        );
    }

    // --- State: Input Username ---
    if (!tradingviewUsername && !showConfirmation) {
        return (
            <div className="flex flex-col h-full w-full items-center justify-center p-8 bg-black">
                <div className="max-w-[480px] w-full p-10 bg-[#101010] border border-white/[0.05] rounded-[2.5rem] shadow-2xl">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-semibold text-white tracking-tight mb-2">Connect TradingView.</h2>
                        <p className="text-zinc-500 font-medium text-sm">Enter your username to sync your access.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="group relative">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors h-6 w-6" />
                            <input
                                type="text"
                                value={inputUsername}
                                onChange={(e) => setInputUsername(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmitUsername()}
                                placeholder="TradingView Username"
                                className="w-full pl-16 pr-6 py-5 bg-black border border-white/10 rounded-full text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-all font-mono text-base shadow-inner"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={handleSubmitUsername}
                            className="w-full py-5 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 shadow-xl"
                        >
                            Continue <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- State: Confirm Username ---
    if (showConfirmation) {
        return (
            <div className="flex flex-col h-full w-full items-center justify-center p-8 bg-black">
                <div className="max-w-[480px] w-full p-10 text-center bg-[#101010] border border-white/[0.05] rounded-[2.5rem] shadow-2xl">
                    <div className="w-20 h-20 rounded-2xl bg-white text-black flex items-center justify-center mx-auto mb-8 shadow-xl">
                        <CheckCircle size={32} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-3xl font-semibold text-white tracking-tight mb-2">Confirm Username.</h3>
                    <p className="text-zinc-500 font-medium text-sm mb-10">Please ensure this is exactly correct.</p>

                    <div className="py-4 px-6 bg-black rounded-2xl border border-white/10 mb-10 inline-block select-all shadow-inner">
                        <span className="font-mono text-xl text-white tracking-wider">{inputUsername}</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleConfirmUsername}
                            disabled={saving}
                            className="w-full py-4 rounded-full bg-white text-black font-semibold hover:scale-105 active:scale-95 transition-all text-base disabled:opacity-50 shadow-xl"
                        >
                            {saving ? 'Saving...' : 'Confirm Connection'}
                        </button>
                        <button
                            onClick={() => { setShowConfirmation(false); setInputUsername(''); }}
                            disabled={saving}
                            className="w-full py-4 rounded-full border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 font-medium transition-all text-base"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- State: Dashboard (Main) ---
    return (
        <div className="flex flex-col h-full w-full overflow-y-auto custom-scrollbar bg-black text-white selection:bg-white/20">
            <div className="max-w-7xl mx-auto w-full p-6 md:p-10 space-y-10">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
                    <div className="space-y-2">
                        <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-white">Indicators.</h1>
                        <p className="text-zinc-500 text-lg font-medium max-w-lg tracking-tight">
                            Premium algorithms designed for precision execution.
                        </p>
                    </div>

                    {/* Connection Status Pill */}
                    <div className="flex items-center gap-4 bg-[#101010] border border-white/[0.05] pl-2 pr-6 py-2 rounded-full shadow-xl">
                        <div className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center shrink-0">
                            <Zap size={20} className="fill-black" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0 py-1">
                            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-0.5">Synced Account</span>
                            <span className="text-sm font-mono text-white font-semibold truncate leading-none">{tradingviewUsername}</span>
                        </div>
                    </div>
                </header>

                {/* Primary Feature Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 rounded-[3rem] bg-[#101010] border border-white/[0.05] overflow-hidden relative group">
                        <div className="space-y-6 max-w-2xl relative z-10 transition-transform duration-500 group-hover:translate-x-2">
                            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                                Systems Active
                            </div>
                            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight">Ready to deploy.</h2>
                            <p className="text-zinc-500 text-lg leading-relaxed font-medium">
                                Your TradingView ID <strong className="text-zinc-300 font-mono text-sm px-2 py-1 bg-white/5 rounded mx-1">{tradingviewUsername}</strong> is fully authorized.
                                You have instant access to our complete suite of premium scripts.
                            </p>
                            <div className="pt-6">
                                <a
                                    href="https://www.tradingview.com/u/TheRealSavFx/#published-scripts"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center text-sm font-semibold text-black bg-white px-8 py-4 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl group/btn"
                                >
                                    Launch Scripts on TradingView
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        </div>
                        <div className="hidden md:flex h-40 w-40 rounded-[2rem] border border-white/5 items-center justify-center relative bg-black shrink-0 transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-110 shadow-2xl">
                            <BarChart2 className="text-white" size={48} strokeWidth={1.5} />
                        </div>
                    </div>
                </motion.div>

                {/* Grid of Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { name: "Sav FX Dynamic Premium & Discount", image: "/dynamic-premium-discount.png", type: "Premium" },
                        { name: "Sav FX Gordian Paradox Cycles", image: "/gordian-paradox-cycles.png", type: "Premium" },
                        { name: "Sav Fx PDA Finder", image: "/pda-finder.png", type: "Premium" },
                        { name: "SAV FX Bias Check List", image: null, type: "Tool" }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + idx * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full flex flex-col group p-0 overflow-hidden bg-[#101010] border border-white/[0.05] rounded-[2.5rem] hover:border-white/10 hover:bg-[#121212] transition-colors"
                        >
                            {/* Image / Preview Area */}
                            <div className="aspect-video w-full bg-black border-b border-white/[0.05] relative overflow-hidden flex-shrink-0">
                                {item.image ? (
                                    <>
                                        <motion.img
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 mix-blend-luminosity"
                                        />
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
                                        <div className="w-20 h-20 rounded-[1.5rem] border border-white/5 flex items-center justify-center bg-white/[0.02]">
                                            <Zap className="text-zinc-600 h-8 w-8" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="p-8 flex flex-col flex-1 justify-between">
                                <h3 className="text-xl font-semibold tracking-tight text-white leading-snug mb-8 group-hover:text-zinc-200 transition-colors">
                                    {item.name}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-white/5 py-1 px-3 rounded-full border border-white/5">V2.0 Core</span>
                                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-black opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Admin Access Section */}
                {isAdmin && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pt-16 pb-8"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 px-2">
                            <div>
                                <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">Access Management.</h2>
                                <p className="text-zinc-500 font-medium text-sm">Monitor and oversee active sync configurations.</p>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#101010] border border-white/5 rounded-full pl-14 pr-6 py-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 transition-all font-medium shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="bg-[#101010] border border-white/[0.05] rounded-[2.5rem] overflow-hidden">
                            {fetchError ? (
                                <div className="p-12 text-center text-red-500 font-medium">{fetchError}</div>
                            ) : allUsers.length === 0 ? (
                                <div className="p-16 text-center text-zinc-500 font-medium text-lg">No records found matching your query.</div>
                            ) : (
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse min-w-[800px]">
                                        <thead>
                                            <tr className="border-b border-white/[0.05] text-[10px] uppercase tracking-widest text-zinc-500 font-bold bg-[#0a0a0a]">
                                                <th className="px-8 py-6">Customer</th>
                                                <th className="px-8 py-6">TradingView ID</th>
                                                <th className="px-8 py-6">Tier</th>
                                                <th className="px-8 py-6">Sync Status</th>
                                                <th className="px-8 py-6">Renewal Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {allUsers
                                                .filter(u =>
                                                    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    u.tradingview_username?.toLowerCase().includes(searchQuery.toLowerCase())
                                                )
                                                .map((user, i) => {
                                                    const isOverdue = user.subscription_end_date && new Date(user.subscription_end_date) < new Date() && user.subscription_type !== 'lifetime';

                                                    return (
                                                        <tr key={user.id} className="group hover:bg-[#121212] transition-colors border-b border-white/[0.02] last:border-0">
                                                            <td className="px-8 py-6 font-semibold text-white">
                                                                {user.full_name || 'Anonymous Entity'}
                                                            </td>
                                                            <td className="px-8 py-6 font-mono text-zinc-400 text-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <span>{user.tradingview_username || '—'}</span>
                                                                    {user.tradingview_username && (
                                                                        <button
                                                                            onClick={() => handleCopy(user.tradingview_username, user.id)}
                                                                            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white transition-colors"
                                                                            title="Copy Username"
                                                                        >
                                                                            {copiedId === user.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <span className={cn(
                                                                    "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                                                    user.subscription_type === 'lifetime' ? "bg-white text-black border-transparent shadow-md" : "bg-transparent text-zinc-300 border-white/10"
                                                                )}>
                                                                    {user.subscription_type || 'Standard'}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={cn("h-1.5 w-1.5 rounded-full", isOverdue ? "bg-red-500" : "bg-green-500")} />
                                                                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", isOverdue ? "text-red-500" : "text-green-500")}>
                                                                        {isOverdue ? 'Overdue' : 'Active'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6 text-zinc-500 font-mono text-sm tracking-tight">
                                                                {user.subscription_type === 'lifetime' ? 'PERMANENT' :
                                                                    user.subscription_end_date ? new Date(user.subscription_end_date).toLocaleDateString() : '—'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Indicators;
