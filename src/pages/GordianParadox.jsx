import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ArrowRight, Zap, CheckCircle, Lock, ChevronLeft, ChevronDown, Clock, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { gordianParadoxData } from '../data/gordianParadox';
import { supabase } from '../lib/supabase';
import { cn } from "@/lib/utils";
import SecureVideoPlayer from '../components/SecureVideoPlayer';

const GordianParadox = () => {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState(null);
    const [activeVideoId, setActiveVideoId] = useState(gordianParadoxData[0].videos[0]?.videoId);

    // Determine active video object
    const allVideos = gordianParadoxData.flatMap(m => m.videos);
    const activeVideo = allVideos.find(v => v.videoId === activeVideoId);

    // Module Expansion State
    const [openModuleIds, setOpenModuleIds] = useState(gordianParadoxData.map(m => m.id)); // Open all by default

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email);
            }
        };
        getUser();
    }, []);

    const toggleModule = (id) => {
        setOpenModuleIds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen font-sans overflow-hidden bg-white text-[#37352f] selection:bg-[#2383e2]/20">

            {/* Left Panel: Cinematic Video Player */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar relative z-10 w-full min-w-0">

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-7xl mx-auto flex flex-col gap-6 px-6 pt-6 pb-20 relative"
                >
                    {/* Header */}
                    <div className="flex flex-col gap-1 mt-1 mb-2">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-[#787774] hover:text-[#37352f] mb-4 transition-colors w-fit font-semibold text-sm tracking-tight"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            <span>Back to Dashboard</span>
                        </button>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-[#37352f]">
                            The Gordian Paradox.
                        </h1>
                        <p className="text-[#787774] text-lg font-medium tracking-tight">
                            Advanced strategy modules dictating order flow execution.
                        </p>
                    </div>

                    {/* Content Container */}
                    <div className="flex flex-col gap-6">
                        {/* Player Wrapper */}
                        <div className="relative group/player rounded-[3rem] overflow-hidden bg-white border border-[#e9e9e7] shrink-0 shadow-sm">
                            <div className="relative w-full aspect-video bg-black">
                                {activeVideoId ? (
                                    <SecureVideoPlayer
                                        key={activeVideoId}
                                        videoId={activeVideoId}
                                        title={activeVideo?.title}
                                        watermarkText={userEmail}
                                        onComplete={() => { }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                        <p className="relative z-10 text-white font-medium">Select a video to start learning</p>
                                    </div>
                                )}
                            </div>

                            {/* Controls & Meta */}
                            <div className="h-auto md:h-24 bg-white border-t border-[#e9e9e7] p-6 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shrink-0">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                     <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#F7F7F5] border border-[#e9e9e7] text-[10px] font-bold uppercase tracking-widest text-[#787774] mb-1">
                                        Active Session
                                    </div>
                                    <h2 className="text-xl md:text-3xl font-semibold tracking-tight text-[#37352f] line-clamp-1">
                                        {activeVideo?.title}
                                    </h2>
                                    <div className="flex items-center gap-4 text-xs font-bold text-[#787774] uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={12} strokeWidth={2.5} /> {activeVideo?.duration || "Duration N/A"}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    disabled={true}
                                    className="flex items-center gap-2 px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all bg-[#F7F7F5] text-[#787774] border border-[#e9e9e7] cursor-default shrink-0"
                                >
                                    <Zap size={14} className="text-[#37352f]" />
                                    <span className="text-[#37352f]">Core Module</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Panel: Premium Sidebar */}
            <div className="w-full lg:w-[450px] xl:w-[500px] shrink-0 h-[400px] lg:h-full border-t lg:border-t-0 lg:border-l border-[#e9e9e7] flex flex-col z-20 bg-[#F7F7F5]">
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-6 lg:p-10">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between mb-8 px-1">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-3xl font-semibold tracking-tight text-[#37352f]">Curriculum.</h2>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-[#787774]">Modules</p>
                        </div>
                        <div className="flex flex-col items-end">
                             <div className="text-2xl font-semibold text-[#37352f] tracking-tight">{allVideos.length}</div>
                             <div className="text-[10px] font-bold text-[#787774] uppercase tracking-widest">Lessons</div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-5">
                        {gordianParadoxData.map((module, idx) => {
                            const isOpen = openModuleIds.includes(module.id) || openModuleIds.includes(idx); // Handle both if id missing

                            return (
                                <div key={idx} className={cn(
                                    "rounded-[2.5rem] overflow-hidden border transition-all duration-500 relative",
                                    isOpen
                                        ? "bg-white border-[#e9e9e7] shadow-sm"
                                        : "bg-transparent border-transparent hover:bg-white hover:border-[#e9e9e7] hover:shadow-sm"
                                )}>
                                    <button
                                        onClick={() => toggleModule(module.id || idx)}
                                        className="w-full flex items-center justify-between p-6 text-left group"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                "w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-xl font-semibold transition-colors duration-500 shrink-0 shadow-sm",
                                                isOpen
                                                    ? "bg-[#37352f] text-white"
                                                    : "bg-white border border-[#e9e9e7] text-[#787774] group-hover:bg-[#F7F7F5] group-hover:text-[#37352f]"
                                            )}>
                                                {idx + 1}
                                            </div>
                                            <div className="flex flex-col gap-1 pr-4">
                                                <span className={cn(
                                                    "text-lg font-semibold tracking-tight transition-colors leading-snug",
                                                    isOpen ? "text-[#37352f]" : "text-[#787774] group-hover:text-[#37352f]"
                                                )}>
                                                    {module.title}
                                                </span>
                                                <span className="text-[10px] text-[#787774] font-bold uppercase tracking-widest mt-1">
                                                    {module.videos.length} Videos
                                                </span>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0",
                                            isOpen ? "bg-[#F7F7F5] text-[#37352f]" : "text-[#787774] group-hover:bg-white border border-transparent group-hover:border-[#e9e9e7] group-hover:text-[#37352f] shadow-sm"
                                        )}>
                                            <ChevronDown size={18} strokeWidth={2} className={cn("transition-transform duration-500", isOpen && "rotate-180")} />
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: "auto" }}
                                                exit={{ height: 0 }}
                                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                                className="overflow-hidden"
                                            >
                                                <div className="flex flex-col gap-2 p-3 pb-6 border-t border-[#e9e9e7]">
                                                    {module.videos.map((video, vIdx) => {
                                                        const isActive = activeVideoId === video.videoId;

                                                        return (
                                                            <button
                                                                key={vIdx}
                                                                onClick={() => setActiveVideoId(video.videoId)}
                                                                className={cn(
                                                                    "w-full flex items-center gap-5 p-4 mx-1 rounded-3xl transition-all duration-300 text-left group relative border",
                                                                    isActive
                                                                        ? "bg-[#F7F7F5] border-[#e9e9e7] shadow-sm"
                                                                        : "bg-transparent border-transparent hover:bg-[#F7F7F5] hover:border-[#e9e9e7]"
                                                                )}
                                                            >
                                                                <div className="shrink-0">
                                                                    {isActive ? (
                                                                        <div className="w-12 h-12 rounded-[1.25rem] bg-[#37352f] flex items-center justify-center shadow-sm transform scale-105 transition-transform">
                                                                            <Play size={16} className="text-white fill-white ml-1" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-12 h-12 rounded-[1.25rem] border border-[#e9e9e7] bg-[#F7F7F5] flex items-center justify-center text-[#787774] font-semibold group-hover:bg-white group-hover:text-[#37352f] shadow-sm transition-all">
                                                                            {vIdx + 1}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                                                    <p className={cn(
                                                                        "text-sm font-semibold transition-colors line-clamp-2 leading-snug tracking-tight",
                                                                        isActive ? "text-[#37352f]" : "text-[#787774] group-hover:text-[#37352f]"
                                                                    )}>
                                                                        {video.title}
                                                                    </p>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className={cn(
                                                                            "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors",
                                                                            isActive ? "text-[#787774]" : "text-[#9b9a97] group-hover:text-[#787774]"
                                                                        )}>
                                                                            <Clock size={10} strokeWidth={2.5}/>
                                                                            {video.duration}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GordianParadox;
