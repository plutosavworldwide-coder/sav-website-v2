import React from 'react';
import { Calendar, Clock, Video, ArrowRight, ExternalLink, Users, Bell, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

const ScheduledSessions = () => {
    const navigate = useNavigate();

    // Mock Data for display purposes
    const sessions = [
        {
            id: 1,
            title: "Market Outlook & Weekly Prep",
            date: "Sunday, Feb 18",
            time: "3:00 PM EST",
            type: "Live Analysis",
            description: "Deep dive into the upcoming week's market structure, key levels, and potential setups across major indices.",
            status: "upcoming"
        },
        {
            id: 2,
            title: "Advanced Order Flow Tactics",
            date: "Wednesday, Feb 21",
            time: "2:00 PM EST",
            type: "Masterclass",
            description: "Understanding DOM behavior at structure extremes and interpreting aggressive vs passive market participation.",
            status: "upcoming"
        },
        {
            id: 3,
            title: "Friday Market Recap",
            date: "Friday, Feb 23",
            time: "4:00 PM EST",
            type: "Review",
            description: "A comprehensive review of the week's price action, our trade executions, and lessons learned.",
            status: "upcoming"
        }
    ];

    return (
        <div className="flex flex-col h-full bg-black text-white font-sans overflow-hidden selection:bg-white/20">
            <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
                
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-7xl mx-auto flex flex-col gap-6 p-6 md:p-10 pb-20"
                >

                    {/* Header */}
                    <div className="flex flex-col gap-1 mb-6">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-zinc-500 hover:text-white mb-4 transition-colors w-fit font-semibold text-sm tracking-tight"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back to Dashboard</span>
                        </button>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-white">
                                    Live Sessions.
                                </h1>
                                <p className="text-zinc-500 text-lg font-medium tracking-tight mt-1 max-w-xl">
                                    Join us live for real-time market analysis, educational workshops, and community Q&A.
                                </p>
                            </div>
                            <button className="px-6 py-4 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold transition-all flex items-center gap-2 group shrink-0 active:scale-95 shadow-xl text-sm">
                                <Bell size={18} />
                                <span>Get Notifications</span>
                            </button>
                        </div>
                    </div>

                    {/* Featured / Next Session */}
                    {sessions.length > 0 && (
                        <div className="relative group overflow-hidden border border-white/[0.05] rounded-[3rem] bg-[#101010] shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                            <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-start justify-between p-8 md:p-12 lg:p-14">
                                
                                <div className="space-y-8 flex-1 min-w-0">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest shadow-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                        Next Session
                                    </div>
                                    
                                    <div className="space-y-4 max-w-2xl">
                                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-none">
                                            {sessions[0].title}
                                        </h2>
                                        <p className="text-zinc-400 text-base md:text-lg leading-relaxed font-medium">
                                            {sessions[0].description}
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest pt-6 border-t border-white/[0.05]">
                                        <div className="flex items-center gap-2 bg-black px-4 py-3 rounded-[1.25rem] border border-white/5">
                                            <Calendar size={16} className="text-zinc-300" />
                                            {sessions[0].date}
                                        </div>
                                        <div className="flex items-center gap-2 bg-black px-4 py-3 rounded-[1.25rem] border border-white/5">
                                            <Clock size={16} className="text-zinc-300" />
                                            {sessions[0].time}
                                        </div>
                                        <div className="flex items-center gap-2 bg-black px-4 py-3 rounded-[1.25rem] border border-white/5">
                                            <Users size={16} className="text-zinc-300" />
                                            Active Community
                                        </div>
                                    </div>
                                </div>

                                <div className="shrink-0 w-full lg:w-auto flex items-end lg:h-full lg:mt-auto">
                                    <a
                                        href="https://discord.gg/your-invite-link" // Replace with actual link
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 px-10 py-5 w-full lg:w-auto rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-base transition-all active:scale-95 shadow-xl hover:-translate-y-1 group"
                                    >
                                        <Video size={18} className="fill-black" />
                                        <span>Join Session</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upcoming List */}
                    {sessions.length > 1 && (
                        <div className="space-y-8 mt-12">
                            <h3 className="text-3xl font-semibold text-white tracking-tight flex items-center gap-4 px-2">
                                <span className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Calendar size={20} className="text-white" />
                                </span>
                                Upcoming Schedule.
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sessions.slice(1).map((session, idx) => (
                                    <motion.div
                                        key={session.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + idx * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        <div className="h-full bg-[#101010] border border-white/[0.05] rounded-[2.5rem] p-8 lg:p-10 hover:bg-[#121212] hover:border-white/20 transition-all duration-300 group flex flex-col justify-between gap-8 cursor-pointer shadow-lg">
                                            <div className="space-y-5">
                                                <div className="flex items-start justify-between">
                                                    <span className="px-3 py-1 rounded-full border border-white/10 bg-black text-zinc-400 text-[10px] font-bold uppercase tracking-widest shadow-inner">
                                                        {session.type}
                                                    </span>
                                                    <div className="w-10 h-10 rounded-full bg-black border border-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors shadow-sm">
                                                        <ExternalLink size={16} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-2xl lg:text-3xl font-semibold text-white mb-3 tracking-tight group-hover:text-zinc-200 transition-colors">{session.title}</h4>
                                                    <p className="text-zinc-500 text-sm font-medium leading-relaxed line-clamp-3">
                                                        {session.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-white/[0.02] flex flex-wrap items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest gap-2">
                                                <span className="flex items-center gap-2">
                                                    <Calendar size={14} strokeWidth={2.5} className="text-zinc-400" /> {session.date}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <Clock size={14} strokeWidth={2.5} className="text-zinc-400" /> {session.time}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                </motion.div>
            </div>
        </div>
    );
};

export default ScheduledSessions;
