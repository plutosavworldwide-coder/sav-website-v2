import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Calendar, Zap, Lock, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from "@/lib/utils";

const DashboardFolderView = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Trader');
    const [loading, setLoading] = useState(true);
    // Real stats could be fetched here
    const completionRate = 12; // Placeholder

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();
                if (profile?.full_name) {
                    setUserName(profile.full_name.split(' ')[0]);
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const folders = [
        {
            title: "Time Price Energy",
            subtitle: "Foundation Course",
            description: "Master the core mechanics of market movements.",
            path: "/dashboard/time-price-energy-intro",
            icon: <Play className="w-6 h-6 text-white" />,
            locked: false,
            progress: 35,
            duration: "4h 20m"
        },
        {
            title: "Weekly Livestreams",
            subtitle: "Market Analysis",
            description: "Deep dive analysis of current market conditions.",
            path: "/dashboard/weekly-livestreams",
            icon: <Calendar className="w-6 h-6 text-white" />,
            locked: false,
            progress: 12,
            duration: "Ongoing"
        },
        {
            title: "The Gordian Paradox",
            subtitle: "Advanced Concepts",
            description: "Future projections and advanced frameworks.",
            path: "/dashboard/gordian-paradox",
            icon: <Zap className="w-6 h-6 text-white" />,
            locked: false,
            progress: 0,
            duration: "2h 15m"
        }
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="flex flex-col h-full w-full p-6 md:p-8 overflow-y-auto custom-scrollbar relative z-10 bg-black text-white selection:bg-white/20 font-sans">

            {/* 1. Welcome Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 max-w-7xl mx-auto w-full">
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-zinc-500 text-sm font-semibold mb-2 uppercase tracking-wide"
                    >
                        <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-semibold tracking-tighter text-white"
                    >
                        {getGreeting()}, <span className="text-zinc-500">{userName}.</span>
                    </motion.h1>
                </div>

                {/* Quick Stats Bento */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center justify-between gap-8 bg-[#101010] border border-white/[0.05] py-5 px-8 rounded-[2rem]"
                >
                    <div className="flex flex-col items-start pr-6 border-r border-white/10">
                        <div className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">Modules</div>
                        <div className="text-3xl font-semibold tracking-tight text-white flex items-baseline gap-1">
                            3<span className="text-lg font-medium text-zinc-600">/5</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-start pl-2">
                        <div className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">Progress</div>
                        <div className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
                            {completionRate}%
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-zinc-400" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* 2. Main Content Grid */}
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">

                {/* Left Column: Courses (2/3 width) */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold tracking-tight text-white">Your Subscriptions.</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {folders.map((folder, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + (idx * 0.1), ease: [0.16, 1, 0.3, 1] }}
                                onClick={() => !folder.locked && navigate(folder.path)}
                                className={cn(
                                    "group relative bg-[#101010] border border-white/[0.05] rounded-[2.5rem] p-8 overflow-hidden transition-all duration-500",
                                    !folder.locked
                                        ? "hover:border-white/10 hover:bg-[#121212] cursor-pointer"
                                        : "opacity-60 cursor-not-allowed"
                                )}
                            >
                                {/* Gradient Hover Effect behind */}
                                {!folder.locked && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                )}

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 relative z-10">

                                    {/* Minimal Icon Box */}
                                    <div className={cn(
                                        "w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 border border-white/[0.08] transition-all duration-500",
                                        "bg-black group-hover:bg-white/[0.03]"
                                    )}>
                                        {folder.locked ? <Lock className="w-7 h-7 text-zinc-600" /> : folder.icon}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                                                {folder.subtitle}
                                            </span>
                                            {folder.locked && (
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-800 text-zinc-400">LOCKED</span>
                                            )}
                                        </div>
                                        <h3 className="text-3xl font-semibold tracking-tight text-white mb-2 group-hover:text-zinc-200 transition-colors duration-300">
                                            {folder.title}
                                        </h3>
                                        <p className="text-base text-zinc-400 font-medium">
                                            {folder.description}
                                        </p>
                                    </div>

                                    {/* Action items isolated */}
                                    <div className="flex flex-col items-end gap-6 sm:min-w-[140px]">
                                        <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium bg-black px-4 py-2 rounded-full border border-white/[0.05]">
                                            <Clock className="w-4 h-4" />
                                            {folder.duration}
                                        </div>

                                        {/* Extremely crisp progress bar */}
                                        <div className="w-full flex flex-col gap-2">
                                            <div className="flex justify-between text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                                                <span>Progress</span>
                                                <span>{folder.progress}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/[0.05]">
                                                <div
                                                    className={cn("h-full rounded-full transition-all duration-1000",
                                                        folder.progress > 0 ? "bg-white" : "bg-black"
                                                    )}
                                                    style={{ width: `${folder.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Community & secondary (1/3 width) */}
                <div className="flex flex-col gap-8 pt-1">
                    <h2 className="text-2xl font-semibold tracking-tight text-white mb-[-0.5rem]">Resources.</h2>
                    
                    {/* Minimal Bento Links */}
                    <div className="flex flex-col gap-5">
                        <a
                            href="https://t.me/+Dzugyis4oABkYTU0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between p-6 rounded-[2rem] bg-[#101010] border border-white/[0.05] hover:border-white/10 hover:bg-[#121212] transition-all"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-full bg-black border border-white/5 flex items-center justify-center text-white">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold tracking-tight text-white mb-1">Telegram</h3>
                                    <p className="text-sm font-medium text-zinc-500">Member Group</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                <ArrowRight className="w-5 h-5 text-white" />
                            </div>
                        </a>

                        <a
                            href="https://discord.com/invite/BHkUtCUxzE"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between p-6 rounded-[2rem] bg-[#101010] border border-white/[0.05] hover:border-white/10 hover:bg-[#121212] transition-all"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-full bg-black border border-white/5 flex items-center justify-center text-white">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.5382-9.674-2.357-13.664a.074.074 0 00-.0312-.028zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" /></svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold tracking-tight text-white mb-1">Discord</h3>
                                    <p className="text-sm font-medium text-zinc-500">Live Analysis Server</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                <ArrowRight className="w-5 h-5 text-white" />
                            </div>
                        </a>
                    </div>

                    {/* Upsell Bento (Apple Style) */}
                    <div className="relative rounded-[2.5rem] p-8 overflow-hidden bg-[#101010] border border-white/[0.05] group">
                        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <h3 className="text-2xl font-semibold tracking-tight text-white mb-3">Lifetime Edition.</h3>
                        <p className="text-zinc-400 font-medium mb-8 leading-relaxed max-w-[200px]">
                            Ascend to our elite tier. Exclusive mentoring, tools, and updates forever.
                        </p>
                        <button
                            onClick={() => navigate('/choose-plan')}
                            className="w-full py-4 bg-white text-black font-semibold rounded-full hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            View Upgrades
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DashboardFolderView;
