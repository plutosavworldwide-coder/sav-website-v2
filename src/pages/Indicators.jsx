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
            <div className="h-full flex items-center justify-center bg-[#F7F7F5]">
                <div className="h-6 w-6 border-2 border-[#e9e9e7] border-t-zinc-400 rounded-full animate-spin" />
            </div>
        );
    }

    // --- State: Locked ---
    if (!hasAccess) {
        return (
            <div className="flex flex-col h-full w-full items-center justify-center p-8 bg-[#F7F7F5]">
                <div className="max-w-[420px] w-full p-10 flex flex-col items-center text-center bg-white border border-[#e9e9e7] rounded-[2.5rem] shadow-sm">
                    <div className="w-20 h-20 rounded-full bg-[#F7F7F5] flex items-center justify-center mb-8 shadow-sm">
                        <Lock size={32} className="text-[#37352f]" />
                    </div>
                    <h2 className="text-3xl font-semibold text-[#37352f] tracking-tight mb-4">Restricted Access.</h2>
                    <p className="text-[#787774] mb-10 font-medium text-sm leading-relaxed max-w-sm">
                        The Indicator Suite is exclusive to active subscribers. Upgrade your plan to unlock these premium trading tools.
                    </p>
                    <button
                        onClick={() => navigate('/choose-plan')}
                        className="w-full py-4 bg-[#37352f] text-white font-semibold rounded-full hover:scale-105 active:scale-95 transition-transform duration-300 shadow-xl"
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
            <div className="flex flex-col h-full w-full items-center justify-center p-8 bg-[#F7F7F5]">
                <div className="max-w-[480px] w-full p-10 bg-white border border-[#e9e9e7] rounded-[2.5rem] shadow-sm">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-semibold text-[#37352f] tracking-tight mb-2">Connect TradingView.</h2>
                        <p className="text-[#787774] font-medium text-sm">Enter your username to sync your access.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="group relative">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[#787774] group-focus-within:text-[#37352f] transition-colors h-6 w-6" />
                            <input
                                type="text"
                                value={inputUsername}
                                onChange={(e) => setInputUsername(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmitUsername()}
                                placeholder="TradingView Username"
                                className="w-full pl-16 pr-6 py-5 bg-[#F7F7F5] border border-[#e9e9e7] rounded-full text-[#37352f] placeholder-[#787774] focus:outline-none focus:border-zinc-300 focus:bg-white focus:shadow-sm transition-all font-mono text-base"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={handleSubmitUsername}
                            className="w-full py-5 bg-[#37352f] text-white font-semibold rounded-full hover:bg-black hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
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
            <div className="flex flex-col h-full w-full items-center justify-center p-8 bg-[#F7F7F5]">
                <div className="max-w-[480px] w-full p-10 text-center bg-white border border-[#e9e9e7] rounded-[2.5rem] shadow-sm">
                    <div className="w-20 h-20 rounded-2xl bg-[#37352f] text-white flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <CheckCircle size={32} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-3xl font-semibold text-[#37352f] tracking-tight mb-2">Confirm Username.</h3>
                    <p className="text-[#787774] font-medium text-sm mb-10">Please ensure this is exactly correct.</p>

                    <div className="py-4 px-6 bg-[#F7F7F5] rounded-2xl border border-[#e9e9e7] mb-10 inline-block select-all shadow-sm">
                        <span className="font-mono text-xl text-[#37352f] tracking-wider">{inputUsername}</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleConfirmUsername}
                            disabled={saving}
                            className="w-full py-4 rounded-full bg-[#37352f] text-white font-semibold hover:scale-105 active:scale-95 transition-all text-base disabled:opacity-50 shadow-sm"
                        >
                            {saving ? 'Saving...' : 'Confirm Connection'}
                        </button>
                        <button
                            onClick={() => { setShowConfirmation(false); setInputUsername(''); }}
                            disabled={saving}
                            className="w-full py-4 rounded-full border border-[#e9e9e7] text-[#787774] hover:text-[#37352f] hover:bg-[#F7F7F5] bg-white font-medium transition-all text-base shadow-sm"
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
        <div className="flex flex-col h-full w-full overflow-y-auto custom-scrollbar bg-white text-[#37352f] selection:bg-[#2383e2]/20">
            <div className="max-w-7xl mx-auto w-full px-6 md:px-10 py-8 flex flex-col gap-6">

                {/* Slim status topbar */}
                <div className="flex items-center justify-between py-2 px-4 bg-[#F7F7F5] border border-[#e9e9e7] rounded-xl">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs font-semibold text-[#37352f]">Systems Active</span>
                        <span className="text-xs text-[#787774] font-medium">Your TradingView ID <code className="font-mono font-bold text-[#37352f] mx-1">{tradingviewUsername}</code> is authorized</span>
                    </div>
                    <a
                        href="https://www.tradingview.com/u/TheRealSavFx/#published-scripts"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#2383e2] hover:underline"
                    >
                        Launch on TradingView <ArrowRight size={12} />
                    </a>
                </div>

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter text-[#37352f]">Indicators.</h1>
                        <p className="text-[#787774] text-base font-medium mt-1">Premium algorithms for precision execution.</p>
                    </div>
                </div>

                {/* Section divider */}
                <div className="flex items-center gap-4 pt-2">
                    <span className="text-xs font-bold text-[#787774] uppercase tracking-widest">Available Scripts</span>
                    <div className="flex-1 h-px bg-[#e9e9e7]" />
                </div>

                {/* Grid of Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                    {[
                        { name: "Sav FX Dynamic Premium & Discount", image: "/dynamic-premium-discount.png", type: "V2.0 Core" },
                        { name: "Sav FX Gordian Paradox Cycles", image: "/gordian-paradox-cycles.png", type: "V2.0 Core" },
                        { name: "Sav Fx PDA Finder", image: "/pda-finder.png", type: "V2.0 Core" },
                        { name: "SAV FX Bias Check List", image: null, type: "V2.0 Core" }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 + idx * 0.07 }}
                            className="flex flex-col group overflow-hidden bg-white border border-[#e9e9e7] rounded-2xl hover:border-[#d0d0ce] hover:shadow-md transition-all duration-300"
                        >
                            {/* Chart thumbnail */}
                            <div className="aspect-video w-full bg-[#F7F7F5] border-b border-[#e9e9e7] relative overflow-hidden flex-shrink-0">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-14 h-14 rounded-xl border border-[#e9e9e7] flex items-center justify-center bg-white shadow-sm">
                                            <Zap className="text-[#787774] h-6 w-6" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Card info */}
                            <div className="flex items-center justify-between px-4 py-3">
                                <h3 className="text-sm font-semibold text-[#37352f] leading-snug">{item.name}</h3>
                                <span className="shrink-0 ml-3 text-[10px] font-bold text-[#787774] bg-[#F7F7F5] border border-[#e9e9e7] rounded-full px-2 py-0.5 uppercase tracking-wide">{item.type}</span>
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
                                <h2 className="text-3xl font-semibold tracking-tight text-[#37352f] mb-2">Access Management.</h2>
                                <p className="text-[#787774] font-medium text-sm">Monitor and oversee active sync configurations.</p>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#787774] h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-[#e9e9e7] rounded-full pl-14 pr-6 py-4 text-sm text-[#37352f] placeholder-[#787774] focus:outline-none focus:border-zinc-300 focus:shadow-sm transition-all font-medium shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="bg-white border border-[#e9e9e7] shadow-sm rounded-[2.5rem] overflow-hidden">
                            {fetchError ? (
                                <div className="p-12 text-center text-red-500 font-medium">{fetchError}</div>
                            ) : allUsers.length === 0 ? (
                                <div className="p-16 text-center text-[#787774] font-medium text-lg">No records found matching your query.</div>
                            ) : (
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse min-w-[800px]">
                                        <thead>
                                            <tr className="border-b border-[#e9e9e7] text-[10px] uppercase tracking-widest text-[#787774] font-bold bg-[#F7F7F5]">
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
                                                        <tr key={user.id} className="group hover:bg-[#F7F7F5] transition-colors border-b border-[#e9e9e7] last:border-0">
                                                            <td className="px-8 py-6 font-semibold text-[#37352f]">
                                                                {user.full_name || 'Anonymous Entity'}
                                                            </td>
                                                            <td className="px-8 py-6 font-mono text-[#787774] text-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <span>{user.tradingview_username || '—'}</span>
                                                                    {user.tradingview_username && (
                                                                        <button
                                                                            onClick={() => handleCopy(user.tradingview_username, user.id)}
                                                                            className="p-1.5 rounded bg-black/5 hover:bg-black/10 text-[#37352f] transition-colors"
                                                                            title="Copy Username"
                                                                        >
                                                                            {copiedId === user.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <span className={cn(
                                                                    "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                                                    user.subscription_type === 'lifetime' ? "bg-[#37352f] text-white border-transparent shadow-sm" : "bg-[#F7F7F5] text-[#787774] border-[#e9e9e7]"
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
                                                            <td className="px-8 py-6 text-[#787774] font-mono text-sm tracking-tight">
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
