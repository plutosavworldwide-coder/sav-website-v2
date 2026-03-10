import { useState, useEffect, useRef } from 'react';
import {
    Play, Clock, Calendar, ChevronDown, Folder, Lock, CheckCircle,
    ArrowRight, Video, AlertCircle, Zap, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { livestreamsData } from '../data/livestreams';
import { supabase } from '../lib/supabase';
import { cn } from "@/lib/utils";
import SecureVideoPlayer from '../components/SecureVideoPlayer';

const WeeklyLivestreams = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('folders'); // 'folders' | 'list'
    const [selectedYear, setSelectedYear] = useState(null);
    const hasManuallySelectedYear = useRef(false);

    // Initial State for List View
    const [activeVideoId, setActiveVideoId] = useState(null);
    const [openMonthIds, setOpenMonthIds] = useState([]);
    const [completedVideos, setCompletedVideos] = useState(new Set());
    const [userEmail, setUserEmail] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserEmail(user.email);
        };
        fetchUser();
    }, []);

    const allVideos = livestreamsData.flatMap(m => m.videos);
    const filteredMonths = livestreamsData.filter(m => m.year === selectedYear);

    // Initial Data Fetch & Resume Logic
    useEffect(() => {
        const fetchProgress = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: progressData } = await supabase
                    .from('video_progress')
                    .select('video_id')
                    .eq('user_id', user.id);

                let completedSet = new Set();
                if (progressData) {
                    completedSet = new Set(progressData.map(p => p.video_id));
                    setCompletedVideos(completedSet);
                }

                const nextUnwatched = allVideos.find(v => !completedSet.has(v.videoId));
                const targetVideo = nextUnwatched || allVideos[allVideos.length - 1];

                if (targetVideo && !hasManuallySelectedYear.current) {
                    const month = livestreamsData.find(m => m.videos.some(v => v.videoId === targetVideo.videoId));
                    if (month) {
                        setSelectedYear(month.year);
                        setView('list');
                        setActiveVideoId(targetVideo.videoId);
                        setOpenMonthIds(prev => [...new Set([...prev, month.id])]);

                        setTimeout(() => {
                            const element = document.getElementById(`video-${targetVideo.videoId}`);
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }, 800);
                    }
                }
            }
        };
        fetchProgress();
    }, []);

    // Update active state when year changes
    useEffect(() => {
        if (selectedYear && filteredMonths.length > 0 && !activeVideoId) {
            const initialOpenMonth = filteredMonths.find(m => !m.locked && m.videos.length > 0) || filteredMonths[0];
            const initialVideo = initialOpenMonth?.videos[0];

            if (initialOpenMonth) setOpenMonthIds(prev => [...new Set([...prev, initialOpenMonth.id])]);
            if (initialVideo) setActiveVideoId(initialVideo.videoId);
        }
    }, [selectedYear]);

    const activeVideo = filteredMonths.flatMap(m => m.videos).find(v => v.videoId === activeVideoId);

    const toggleMonth = (monthId) => {
        setOpenMonthIds(current =>
            current.includes(monthId)
                ? current.filter(id => id !== monthId)
                : [...current, monthId]
        );
    };

    const handleVideoClick = (video) => {
        setActiveVideoId(video.videoId);
    };

    const handleYearSelect = (year) => {
        hasManuallySelectedYear.current = true;
        setSelectedYear(year);
        setView('list');
    };

    const yearFolders = [
        {
            year: 2024,
            title: "Archive 2024",
            description: "Foundation building blocks and initial market analysis sessions.",
            icon: "24",
            active: false
        },
        {
            year: 2025,
            title: "Archive 2025",
            description: "Advanced concepts and deep dives into market psychology.",
            icon: "25",
            active: false
        },
        {
            year: 2026,
            title: "Live Sessions 2026",
            description: "Current market cycle analysis and real-time forecasts.",
            icon: "26",
            active: true
        }
    ];

    // --- View: Folders (Year Selection) ---
    if (view === 'folders') {
        return (
            <div className="flex flex-col h-full w-full bg-white text-[#37352f] overflow-y-auto selection:bg-[#2383e2]/20 custom-scrollbar">
                <div className="max-w-7xl mx-auto w-full p-8 md:p-12">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-16 md:text-left text-center flex flex-col gap-2"
                    >
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="inline-flex items-center gap-2 text-[#787774] hover:text-[#37352f] mb-6 transition-colors font-semibold text-sm tracking-tight w-fit mx-auto md:mx-0"
                        >
                            <ArrowRight size={16} className="rotate-180" /> Back to Dashboard
                        </button>
                        <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-[#37352f] leading-none">
                            Livestreams.
                        </h1>
                        <p className="text-[#787774] font-medium text-lg max-w-xl leading-relaxed tracking-tight">
                            The complete archive of weekly market breakdowns.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {yearFolders.map((folder, idx) => {
                            const count = livestreamsData.filter(m => m.year === folder.year).reduce((acc, m) => acc + m.videos.length, 0);

                            return (
                                <motion.div
                                    key={folder.year}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                    onClick={() => handleYearSelect(folder.year)}
                                    className={cn(
                                        "group relative cursor-pointer rounded-[3rem] overflow-hidden transition-all duration-500 h-[450px] flex flex-col border",
                                        folder.active
                                            ? "bg-white border-[#e9e9e7] shadow-md hover:scale-[1.02]"
                                            : "bg-[#F7F7F5] border-[#e9e9e7] hover:bg-white hover:shadow-sm hover:scale-[1.02]"
                                    )}
                                >
                                    <div className="p-10 flex flex-col h-full relative z-10 justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className={cn(
                                                "w-24 h-24 rounded-[2rem] flex items-center justify-center text-4xl font-semibold tracking-tighter transition-colors duration-500 shrink-0",
                                                folder.active ? "bg-[#37352f] text-white shadow-sm" : "bg-white border border-[#e9e9e7] text-[#787774] group-hover:bg-[#F7F7F5] group-hover:text-[#37352f]"
                                            )}>
                                                {folder.icon}
                                            </div>
                                            {folder.active && (
                                                <div className="px-4 py-1.5 rounded-full bg-[#F7F7F5] text-[#787774] text-[10px] font-bold uppercase tracking-widest border border-[#e9e9e7] shadow-sm flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                                                    Current
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-3xl font-semibold text-[#37352f] tracking-tight leading-none">{folder.title}</h3>
                                            <p className="text-[#787774] text-sm font-medium leading-relaxed">
                                                {folder.description}
                                            </p>

                                            <div className="pt-6 mt-6 flex items-center justify-between border-t border-[#e9e9e7]">
                                                <span className="text-[10px] uppercase tracking-widest font-bold text-[#787774] group-hover:text-[#37352f] transition-colors">{count} Recordings</span>
                                                <div className={cn(
                                                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm",
                                                    folder.active ? "bg-[#37352f] text-white" : "border border-[#e9e9e7] bg-white text-[#787774] group-hover:bg-[#37352f] group-hover:text-white group-hover:border-transparent"
                                                )}>
                                                    <ArrowRight size={20} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // --- View: Player (List View) ---
    return (
        <div className="flex flex-col lg:flex-row h-screen bg-white text-[#37352f] font-sans overflow-hidden selection:bg-[#2383e2]/20">

            {/* Main Content: Player Area */}
            <div className="flex-1 flex flex-col h-full relative z-10 overflow-y-auto custom-scrollbar">

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-7xl mx-auto flex flex-col gap-6 px-6 pt-6 pb-20 relative"
                >
                    {/* Navigation Header */}
                    <div className="flex flex-col gap-1 mt-1 mb-2">
                        <button
                            onClick={() => setView('folders')}
                            className="flex items-center gap-2 text-[#787774] hover:text-black mb-4 transition-colors w-fit font-semibold text-sm tracking-tight"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            <span>All Archives</span>
                        </button>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-[#37352f]">
                            {selectedYear} Archive.
                        </h1>
                        <p className="text-[#787774] text-lg font-medium tracking-tight">
                            Live session recordings for {selectedYear}.
                        </p>
                    </div>

                    {/* Cinematic Player Container */}
                    <div className="relative group/player rounded-[3rem] overflow-hidden bg-white border border-[#e9e9e7] shrink-0 shadow-sm">
                        <div className="relative w-full aspect-video bg-black">
                            {activeVideo ? (
                                <SecureVideoPlayer
                                    key={activeVideo.videoId}
                                    videoId={activeVideo.videoId}
                                    title={activeVideo.title}
                                    watermarkText={userEmail}
                                    onComplete={async () => {
                                        if (!activeVideoId) return;
                                        const { data: { user } } = await supabase.auth.getUser();
                                        if (user) {
                                            const { error } = await supabase
                                                .from('video_progress')
                                                .upsert({ user_id: user.id, video_id: activeVideoId }, { onConflict: 'user_id, video_id' });
                                            if (!error) {
                                                setCompletedVideos(prev => new Set([...prev, activeVideoId]));
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-black">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                    <p className="relative z-10 text-white font-medium">Select a session to begin watching</p>
                                </div>
                            )}
                        </div>

                        {/* Video Meta Data */}
                        <div className="h-auto md:h-24 bg-white border-t border-[#e9e9e7] p-6 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shrink-0">
                            <div className="space-y-2 flex-1 min-w-0">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#F7F7F5] border border-[#e9e9e7] text-[10px] font-bold uppercase tracking-widest text-[#787774] mb-1">
                                    Session Playback
                                </div>
                                <h2 className="text-xl md:text-3xl font-semibold tracking-tight text-[#37352f] line-clamp-1">{activeVideo?.title}</h2>
                                <div className="flex items-center gap-4 text-xs font-bold text-[#787774] uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Calendar size={12} strokeWidth={2.5}/> {activeVideo?.date}</span>
                                    <span className="w-1 h-1 bg-[#e9e9e7] rounded-full" />
                                    <span className="flex items-center gap-1.5"><Clock size={12} strokeWidth={2.5}/> {activeVideo?.duration}</span>
                                </div>
                            </div>

                            <button
                                onClick={async () => {
                                    if (!activeVideoId) return;
                                    const { data: { user } } = await supabase.auth.getUser();
                                    if (user) {
                                        const { error } = await supabase
                                            .from('video_progress')
                                            .upsert({ user_id: user.id, video_id: activeVideoId }, { onConflict: 'user_id, video_id' });

                                        if (!error) {
                                            setCompletedVideos(prev => new Set([...prev, activeVideoId]));
                                        }
                                    }
                                }}
                                disabled={completedVideos.has(activeVideoId)}
                                className={cn(
                                    "w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold transition-all duration-300 text-sm shadow-sm",
                                    completedVideos.has(activeVideoId)
                                        ? "bg-[#F7F7F5] text-[#787774] border border-[#e9e9e7] cursor-default"
                                        : "bg-[#37352f] hover:bg-black text-white hover:scale-[1.02] active:scale-95 shadow-md"
                                )}
                            >
                                {completedVideos.has(activeVideoId) ? (
                                    <>
                                        <CheckCircle size={18} />
                                        <span>Completed</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Mark as Watched</span>
                                        <CheckCircle size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Sidebar: Playlist */}
            <div className="w-full lg:w-[450px] xl:w-[500px] shrink-0 border-t lg:border-t-0 lg:border-l border-[#e9e9e7] flex flex-col h-[50vh] lg:h-full z-20 bg-[#F7F7F5]">
                <div className="p-6 lg:p-10 border-b border-[#e9e9e7] bg-[#F7F7F5] sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-3xl font-semibold tracking-tight text-[#37352f]">Playlist.</h2>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-[#787774]">Weekly Sessions</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-5">
                    <AnimatePresence initial={false}>
                        {filteredMonths.map((month) => {
                            const isOpen = openMonthIds.includes(month.id);
                            const hasActiveVideo = month.videos.some(v => v.videoId === activeVideoId);

                            return (
                                <div key={month.id} className={cn(
                                    "rounded-[2.5rem] overflow-hidden border transition-all duration-500 relative",
                                    isOpen && !month.locked
                                        ? "bg-white border-[#e9e9e7] shadow-sm"
                                        : "bg-transparent border-transparent hover:bg-white hover:border-[#e9e9e7] hover:shadow-sm"
                                )}>
                                    <button
                                        onClick={() => !month.locked && toggleMonth(month.id)}
                                        className="w-full flex items-center justify-between p-6 text-left group"
                                    >
                                        <div className="flex items-center gap-5">
                                            {month.locked ? (
                                                <div className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center bg-white border border-[#e9e9e7] shadow-sm shrink-0">
                                                    <Lock size={18} className="text-[#787774]" />
                                                </div>
                                            ) : (
                                                <div className={cn(
                                                    "w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-xl font-semibold transition-colors duration-500 shrink-0 shadow-sm",
                                                    isOpen ? "bg-[#37352f] text-white" : "bg-white border border-[#e9e9e7] text-[#787774] group-hover:bg-[#F7F7F5] group-hover:text-[#37352f]"
                                                )}>
                                                    <Calendar size={22} className={isOpen ? "stroke-white" : ""} strokeWidth={1.5} />
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-1 pr-4">
                                                <span className={cn(
                                                    "text-lg font-semibold tracking-tight transition-colors leading-snug",
                                                    month.locked ? "text-[#787774]" : isOpen || hasActiveVideo ? "text-[#37352f]" : "text-[#787774] group-hover:text-[#37352f]"
                                                )}>
                                                    {month.title}
                                                </span>
                                                <span className="text-[10px] text-[#787774] font-bold uppercase tracking-widest mt-1">
                                                    {month.videos.length} Videos
                                                </span>
                                            </div>
                                        </div>
                                        {!month.locked && (
                                             <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0",
                                                isOpen ? "bg-[#F7F7F5] text-[#37352f]" : "text-[#787774] group-hover:bg-white border border-transparent group-hover:border-[#e9e9e7] group-hover:text-[#37352f] shadow-sm"
                                            )}>
                                                <ChevronDown size={18} strokeWidth={2} className={cn("transition-transform duration-500", isOpen && "rotate-180")} />
                                            </div>
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {isOpen && !month.locked && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: "auto" }}
                                                exit={{ height: 0 }}
                                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                            >
                                                <div className="flex flex-col gap-2 p-3 pb-6 border-t border-[#e9e9e7]">
                                                    {month.videos.map((video, idx) => {
                                                        const isActive = activeVideoId === video.videoId;
                                                        const isCompleted = completedVideos.has(video.videoId);

                                                        return (
                                                            <button
                                                                key={video.videoId}
                                                                id={`video-${video.videoId}`}
                                                                onClick={() => handleVideoClick(video)}
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
                                                                    ) : isCompleted ? (
                                                                         <div className="w-12 h-12 rounded-[1.25rem] bg-white border border-[#e9e9e7] flex items-center justify-center text-green-600 shadow-sm">
                                                                            <CheckCircle size={20} />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-12 h-12 rounded-[1.25rem] border border-[#e9e9e7] bg-[#F7F7F5] flex items-center justify-center text-[#787774] font-semibold group-hover:bg-white group-hover:text-[#37352f] shadow-sm group-hover:shadow-md transition-all">
                                                                             {idx + 1}
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
                                                                    <p className="text-[10px] text-[#787774] group-hover:text-[#37352f] font-bold uppercase tracking-widest transition-colors">
                                                                        {video.duration}
                                                                    </p>
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
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default WeeklyLivestreams;
