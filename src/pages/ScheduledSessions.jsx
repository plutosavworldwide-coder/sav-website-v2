import React from 'react';
import { Calendar, Clock, Video, ArrowRight, ExternalLink, Users, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

const ScheduledSessions = () => {
    const navigate = useNavigate();

    const sessions = [
        {
            id: 1,
            title: "Market Outlook & Weekly Prep",
            dayShort: "SUN",
            dayNum: "18",
            time: "3:00 PM EST",
            type: "Live Analysis",
            description: "Deep dive into the upcoming week's market structure, key levels, and potential setups across major indices.",
            status: "next"
        },
        {
            id: 2,
            title: "Advanced Order Flow Tactics",
            dayShort: "WED",
            dayNum: "21",
            time: "2:00 PM EST",
            type: "Masterclass",
            description: "Understanding DOM behavior at structure extremes and interpreting aggressive vs passive market participation.",
            status: "upcoming"
        },
        {
            id: 3,
            title: "Friday Market Recap",
            dayShort: "FRI",
            dayNum: "23",
            time: "4:00 PM EST",
            type: "Review",
            description: "A comprehensive review of the week's price action, our trade executions, and lessons learned.",
            status: "upcoming"
        }
    ];

    const typeColors = {
        "Live Analysis": "bg-red-50 text-red-700 border-red-200",
        "Masterclass": "bg-blue-50 text-blue-700 border-blue-200",
        "Review": "bg-violet-50 text-violet-700 border-violet-200",
    };

    return (
        <div className="flex flex-col h-full bg-white text-[#37352f] font-sans overflow-hidden selection:bg-[#2383e2]/20">
            <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-7xl mx-auto flex flex-col gap-8 px-6 md:px-10 py-8 pb-20"
                >

                    {/* Header */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm text-[#787774] mb-3">
                            <button onClick={() => navigate('/dashboard')} className="hover:text-[#37352f] transition-colors font-medium">Dashboard</button>
                            <span>/</span>
                            <span className="text-[#37352f] font-medium">Live Sessions</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter text-[#37352f]">Live Sessions.</h1>
                                <p className="text-[#787774] text-base font-medium mt-1">Real-time market analysis, workshops, and community Q&A.</p>
                            </div>
                            <button className="self-start md:self-auto flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#e9e9e7] bg-white hover:bg-[#F7F7F5] hover:border-[#d0d0ce] text-[#37352f] font-semibold text-sm transition-all shadow-sm">
                                <Bell size={15} />
                                <span>Get Notifications</span>
                            </button>
                        </div>
                    </div>

                    {/* Next Session — slim flat banner with left blue accent */}
                    {sessions.length > 0 && (
                        <div className="border border-[#e9e9e7] border-l-4 border-l-[#2383e2] rounded-xl bg-white shadow-sm overflow-hidden">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 px-6 py-5">
                                <div className="flex-1 min-w-0 flex flex-col gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-[10px] font-bold uppercase tracking-widest text-red-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                            Next Session
                                        </div>
                                        <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border", typeColors[sessions[0].type] || "bg-[#F7F7F5] text-[#787774] border-[#e9e9e7]")}>
                                            {sessions[0].type}
                                        </span>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-semibold text-[#37352f] tracking-tight leading-snug">
                                        {sessions[0].title}
                                    </h2>
                                    <p className="text-[#787774] text-sm font-medium leading-relaxed max-w-2xl">{sessions[0].description}</p>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#787774] font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={13} />
                                            {sessions[0].dayShort}, Feb {sessions[0].dayNum}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-[#e9e9e7]" />
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={13} />
                                            {sessions[0].time}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-[#e9e9e7]" />
                                        <span className="flex items-center gap-1.5">
                                            <Users size={13} />
                                            Active Community
                                        </span>
                                    </div>
                                </div>
                                <a
                                    href="https://discord.gg/your-invite-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-lg bg-[#37352f] hover:bg-black text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md"
                                >
                                    <Video size={15} className="fill-white" />
                                    <span>Join Session</span>
                                    <ArrowRight size={15} />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Upcoming section header */}
                    <div className="flex items-center gap-4 pt-2">
                        <span className="text-xs font-bold text-[#787774] uppercase tracking-widest">Upcoming</span>
                        <div className="flex-1 h-px bg-[#e9e9e7]" />
                    </div>

                    {/* Upcoming: 3-column compact calendar cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sessions.slice(1).map((session, idx) => (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 + idx * 0.08 }}
                                className="group flex flex-col bg-white border border-[#e9e9e7] rounded-2xl overflow-hidden hover:border-[#d0d0ce] hover:shadow-md transition-all duration-300 cursor-pointer"
                            >
                                {/* Calendar date header */}
                                <div className="bg-[#37352f] px-5 py-4 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{session.dayShort}</span>
                                        <span className="text-white text-3xl font-bold leading-none">{session.dayNum}</span>
                                    </div>
                                    <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border", typeColors[session.type] || "bg-white/10 text-white border-white/20")}>
                                        {session.type}
                                    </span>
                                </div>

                                {/* Card content */}
                                <div className="flex flex-col gap-3 p-5 flex-1">
                                    <h4 className="text-sm font-semibold text-[#37352f] tracking-tight leading-snug group-hover:text-black transition-colors">
                                        {session.title}
                                    </h4>
                                    <p className="text-xs text-[#787774] font-medium leading-relaxed line-clamp-2">
                                        {session.description}
                                    </p>
                                    <div className="mt-auto pt-3 border-t border-[#e9e9e7] flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] text-[#787774] font-semibold">
                                            <Clock size={11} />
                                            <span>{session.time}</span>
                                        </div>
                                        <div className="w-7 h-7 rounded-full bg-[#F7F7F5] border border-[#e9e9e7] flex items-center justify-center group-hover:bg-[#37352f] group-hover:border-transparent transition-all">
                                            <ExternalLink size={12} className="text-[#787774] group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </motion.div>
            </div>
        </div>
    );
};

export default ScheduledSessions;
