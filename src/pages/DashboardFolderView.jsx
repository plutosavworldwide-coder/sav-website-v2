import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Calendar, Zap, ArrowRight, Clock, MessageCircle, Link as LinkIcon, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from "@/lib/utils";

const DashboardFolderView = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Trader');
    const [loading, setLoading] = useState(true);

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
            icon: <Play size={32} strokeWidth={1.5} />,
            locked: false,
            duration: "4h 20m",
            isLive: false,
            active: false
        },
        {
            title: "Livestreams",
            subtitle: "Market Analysis",
            description: "Deep dive analysis of current market conditions and live forecasting.",
            path: "/dashboard/weekly-livestreams",
            icon: <Calendar size={32} strokeWidth={1.5} />,
            locked: false,
            duration: "Ongoing",
            isLive: true,
            active: true
        },
        {
            title: "The Gordian Paradox",
            subtitle: "Advanced Concepts",
            description: "Future projections and advanced trading execution frameworks.",
            path: "/dashboard/gordian-paradox",
            icon: <Zap size={32} strokeWidth={1.5} />,
            locked: false,
            duration: "2h 15m",
            isLive: false,
            active: false
        }
    ];

    const resources = [
        {
            title: "Telegram Community",
            subtitle: "Member Group",
            description: "Join the private chat to discuss daily setups with other members.",
            url: "https://t.me/+Dzugyis4oABkYTU0",
            icon: (
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
            )
        },
        {
            title: "Live Discord",
            subtitle: "Live Analysis Server",
            description: "Live voice channels and real-time market updates.",
            url: "https://discord.com/invite/BHkUtCUxzE",
            icon: (
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.5382-9.674-2.357-13.664a.074.074 0 00-.0312-.028zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                </svg>
            )
        }
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="flex flex-col h-full w-full bg-white text-[#37352f] overflow-y-auto selection:bg-[#2383e2]/20 custom-scrollbar">
            <div className="max-w-7xl mx-auto w-full p-8 md:p-12 pb-24">

                {/* --- HEADER --- */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-16 md:text-left text-center flex flex-col gap-3"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F7F7F5] border border-[#e9e9e7] text-[#787774] text-[10px] font-bold uppercase tracking-widest shadow-sm mx-auto md:mx-0 w-fit mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                        Online & Active
                    </div>

                    <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-[#37352f] leading-none">
                        {getGreeting()}, <br className="hidden md:block" />
                        <span className="text-[#787774]">{userName}.</span>
                    </h1>
                    <p className="text-[#787774] font-medium text-lg max-w-xl leading-relaxed tracking-tight mt-2">
                        Welcome to the dashboard. Select a module or resource below to continue building your system.
                    </p>
                </motion.div>

                {/* --- CURRICULUM GRID --- */}
                <div className="mb-12">
                    <h2 className="text-sm font-semibold text-[#37352f] tracking-tight mb-6 px-1 border-b border-[#e9e9e7] pb-4">Core Curriculum</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {folders.map((folder, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                onClick={() => !folder.locked && navigate(folder.path)}
                                className={cn(
                                    "group relative rounded-[3rem] overflow-hidden transition-all duration-500 h-[450px] flex flex-col border",
                                    !folder.locked ? "cursor-pointer" : "cursor-not-allowed opacity-80",
                                    folder.active
                                        ? "bg-white border-[#e9e9e7] shadow-md hover:scale-[1.02]"
                                        : "bg-[#F7F7F5] border-[#e9e9e7] hover:bg-white hover:shadow-sm hover:scale-[1.02]"
                                )}
                            >
                                <div className="p-10 flex flex-col h-full relative z-10 justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className={cn(
                                            "w-24 h-24 rounded-[2rem] flex items-center justify-center transition-colors duration-500 shrink-0",
                                            folder.active
                                                ? "bg-[#37352f] text-white shadow-sm"
                                                : "bg-white border border-[#e9e9e7] text-[#787774] group-hover:bg-[#F7F7F5] group-hover:text-[#37352f]"
                                        )}>
                                            {folder.locked ? <Lock size={32} strokeWidth={1.5} /> : folder.icon}
                                        </div>
                                        {folder.isLive && (
                                            <div className="px-4 py-1.5 rounded-full bg-[#F7F7F5] text-[#787774] text-[10px] font-bold uppercase tracking-widest border border-[#e9e9e7] shadow-sm flex items-center gap-2 group-hover:bg-white transition-colors">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] group-hover:animate-pulse" />
                                                Live Weekly
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-widest font-bold text-[#787774]">{folder.subtitle}</p>
                                            <h3 className="text-3xl font-semibold text-[#37352f] tracking-tight leading-none">{folder.title}</h3>
                                        </div>
                                        <p className="text-[#787774] text-sm font-medium leading-relaxed">
                                            {folder.description}
                                        </p>

                                        <div className="pt-6 mt-6 flex items-center justify-between border-t border-[#e9e9e7]">
                                            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-[#787774] group-hover:text-[#37352f] transition-colors">
                                                <Clock size={12} strokeWidth={2.5}/> {folder.duration}
                                            </span>
                                            <div className={cn(
                                                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm",
                                                folder.active
                                                    ? "bg-[#37352f] text-white"
                                                    : "border border-[#e9e9e7] bg-white text-[#787774] group-hover:bg-[#37352f] group-hover:text-white group-hover:border-transparent"
                                            )}>
                                                <ArrowRight size={20} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* --- RESOURCES SECION --- */}
                <div>
                     <h2 className="text-sm font-semibold text-[#37352f] tracking-tight mb-6 px-1 border-b border-[#e9e9e7] pb-4">Community & Resources</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {resources.map((res, idx) => (
                            <motion.a
                                key={idx}
                                href={res.url}
                                target="_blank"
                                rel="noreferrer noopener"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + (idx * 0.1), duration: 0.4 }}
                                className="group flex flex-col sm:flex-row items-start sm:items-center gap-6 p-8 rounded-[2.5rem] bg-[#F7F7F5] border border-[#e9e9e7] hover:bg-white hover:border-[#d0d0ce] hover:shadow-md transition-all duration-300"
                            >
                                <div className="w-20 h-20 rounded-[1.5rem] bg-white border border-[#e9e9e7] flex items-center justify-center text-[#787774] group-hover:text-[#37352f] group-hover:bg-[#F7F7F5] transition-all shadow-sm shrink-0">
                                    {res.icon}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col gap-1">
                                    <h3 className="text-xl font-semibold text-[#37352f] tracking-tight">{res.title}</h3>
                                    <p className="text-[#787774] text-sm font-medium leading-relaxed">{res.description}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white border border-[#e9e9e7] shadow-sm flex items-center justify-center text-[#787774] group-hover:bg-[#37352f] group-hover:text-white group-hover:border-transparent transition-all shrink-0 sm:self-center mt-4 sm:mt-0">
                                    <LinkIcon size={18} strokeWidth={2} className="group-hover:-rotate-45 transition-transform duration-300" />
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardFolderView;
