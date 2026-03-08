import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, Eye, BarChart2, TrendingUp, TrendingDown, Circle, MoreVertical, Share2, Heart, ChevronDown, ChevronRight, Folder, Lock, CheckCircle, ArrowRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { curriculumData } from '../data/curriculum';
import { supabase } from '../lib/supabase';
import { getUserAccessMap } from '../lib/accessEngine';
import { cn } from "@/lib/utils";
import SecureVideoPlayer from '../components/SecureVideoPlayer';

const TimePriceEnergyIntroduction = () => {
    const navigate = useNavigate();
    // Determine the initially active video and its week to open that folder by default
    const firstWeek = curriculumData[0];
    const firstVideo = firstWeek.videos[0];

    const [userSubscriptionType, setUserSubscriptionType] = useState(null);
    const [userEmail, setUserEmail] = useState(null);

    const [activeVideoId, setActiveVideoId] = useState(null);
    const [openWeekIds, setOpenWeekIds] = useState([firstWeek.id]);
    const [accessMap, setAccessMap] = useState({});
    const [accessLoading, setAccessLoading] = useState(true);
    const [completedVideos, setCompletedVideos] = useState(new Set());
    const [loadingProgress, setLoadingProgress] = useState(true);
    const [markingComplete, setMarkingComplete] = useState(false);

    // Flattened list for sequential logic
    const allVideos = curriculumData.flatMap(week => week.videos);
    const activeVideo = allVideos.find(v => v.videoId === activeVideoId) || firstVideo;

    // Fetch user access and progress on mount
    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email);
                // Fetch Profile for Subscription Type
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('subscription_type')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setUserSubscriptionType(profile.subscription_type);
                }

                // 1. Fetch Access
                const map = await getUserAccessMap(user);
                setAccessMap(map);
                setAccessLoading(false);

                // 2. Fetch Video Progress
                const { data: progressData, error } = await supabase
                    .from('video_progress')
                    .select('video_id')
                    .eq('user_id', user.id);

                let completedSet = new Set();
                if (progressData) {
                    completedSet = new Set(progressData.map(p => p.video_id));
                    setCompletedVideos(completedSet);
                } else if (error) {
                    console.warn("Could not fetch progress (table might be missing):", error);
                }

                // --- RESUME LOGIC ---
                // Find the first video that is NOT completed
                const nextVideo = allVideos.find(v => !completedSet.has(v.videoId));
                const targetVideo = nextVideo || allVideos[allVideos.length - 1] || firstVideo;

                if (targetVideo) {
                    setActiveVideoId(targetVideo.videoId);

                    // Find which week this video belongs to and open it
                    const week = curriculumData.find(w => w.videos.some(v => v.videoId === targetVideo.videoId));
                    if (week) {
                        setOpenWeekIds(prev => [...new Set([...prev, week.id])]);
                    }

                    // Auto-scroll after a short delay
                    setTimeout(() => {
                        const element = document.getElementById(`video-${targetVideo.videoId}`);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 500);
                }

                setLoadingProgress(false);
            }
        };
        fetchData();
    }, []);

    // BLOCK ACCESS FOR INDICATORS ONLY SUBSCRIBERS
    if (userSubscriptionType === 'indicators_only') {
        return (
            <div className="flex flex-col h-screen font-sans items-center justify-center p-6 text-center bg-black selection:bg-white/20">
                <div className="max-w-[420px] w-full bg-[#101010] border border-white/[0.05] rounded-[2.5rem] p-10 flex flex-col items-center shadow-2xl">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-8 shadow-xl">
                        <Lock size={32} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-semibold text-white tracking-tight mb-4">Restricted Access.</h2>
                    <p className="text-zinc-500 mb-10 text-sm font-medium leading-relaxed max-w-xs">
                        The Masterclass Curriculum is exclusive to Standard and Lifetime members.
                    </p>
                    <div className="flex flex-col gap-4 w-full">
                        <button
                            onClick={() => navigate('/choose-plan')}
                            className="w-full py-4 bg-white text-black font-semibold rounded-full hover:scale-105 active:scale-95 transition-transform duration-300 shadow-xl text-base"
                        >
                            Upgrade to Full Access
                        </button>
                        <button
                            onClick={() => navigate('/indicators')}
                            className="w-full py-4 bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white font-medium rounded-full transition-all border border-white/10 text-base"
                        >
                            Go to Indicators
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isSequentialLocked = (videoId) => {
        if (loadingProgress) return false;
        const index = allVideos.findIndex(v => v.videoId === videoId);
        if (index <= 0) return false;
        const prevVideo = allVideos[index - 1];
        return !completedVideos.has(prevVideo.videoId);
    };

    const handlePlayAll = () => {
        if (firstVideo?.videoId) {
            setActiveVideoId(firstVideo.videoId);
        }
    };

    const handleVideoClick = (videoId, weekId) => {
        if (!accessMap[weekId]?.unlocked) return;
        if (isSequentialLocked(videoId)) return;
        if (videoId) setActiveVideoId(videoId);
    };

    const handleCompleteAndContinue = async () => {
        if (!activeVideoId) return;
        setMarkingComplete(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase
                    .from('video_progress')
                    .upsert({ user_id: user.id, video_id: activeVideoId }, { onConflict: 'user_id, video_id' });

                if (error) throw error;

                const newSet = new Set(completedVideos);
                newSet.add(activeVideoId);
                setCompletedVideos(newSet);

                const currentIndex = allVideos.findIndex(v => v.videoId === activeVideoId);
                const nextVideo = allVideos[currentIndex + 1];

                if (nextVideo) {
                    const nextWeek = curriculumData.find(w => w.videos.some(v => v.videoId === nextVideo.videoId));
                    if (nextWeek && accessMap[nextWeek.id]?.unlocked) {
                        if (!openWeekIds.includes(nextWeek.id)) {
                            setOpenWeekIds(prev => [...prev, nextWeek.id]);
                        }
                        setActiveVideoId(nextVideo.videoId);
                    } else {
                        alert("Great job! The next module is currently locked by your plan.");
                    }
                }
            }
        } catch (err) {
            console.error("Error marking complete:", err);
            alert("Failed to save progress. Please try again.");
        } finally {
            setMarkingComplete(false);
        }
    };

    const toggleWeek = (weekId) => {
        setOpenWeekIds(current =>
            current.includes(weekId)
                ? current.filter(id => id !== weekId)
                : [...current, weekId]
        );
    };

    const isCurrentCompleted = completedVideos.has(activeVideoId || firstVideo?.videoId);
    let currModuleNum = allVideos.findIndex(v => v.videoId === activeVideoId) + 1;

    return (
        <div className="flex flex-col lg:flex-row h-screen font-sans overflow-hidden bg-black text-white selection:bg-white/20">

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
                            className="flex items-center gap-2 text-zinc-500 hover:text-white mb-4 transition-colors w-fit font-semibold text-sm tracking-tight"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            <span>Back to Dashboard</span>
                        </button>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-white">
                            Time Price Energy.
                        </h1>
                        <p className="text-zinc-500 text-lg font-medium tracking-tight">
                            The definitive guide to institutional execution.
                        </p>
                    </div>

                    {/* Content Container */}
                    <div className="flex flex-col gap-6">
                        {/* Player Wrapper */}
                        <div className="relative group/player rounded-[3rem] overflow-hidden bg-[#101010] border border-white/[0.05] shrink-0 shadow-2xl">
                            <div className="relative w-full aspect-video bg-black">
                                {activeVideoId ? (
                                    <SecureVideoPlayer
                                        videoId={activeVideoId}
                                        title={activeVideo?.title}
                                        watermarkText={userEmail}
                                        onComplete={handleCompleteAndContinue}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="absolute inset-0">
                                            {firstVideo?.videoId && (
                                                <img
                                                    src={`https://img.youtube.com/vi/${firstVideo.videoId}/maxresdefault.jpg`}
                                                    alt="Cover"
                                                    className="w-full h-full object-cover opacity-20 blur-sm mix-blend-luminosity"
                                                />
                                            )}
                                        </div>
                                        <motion.button
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            onClick={handlePlayAll}
                                            className="relative z-10 w-20 h-20 rounded-[1.5rem] bg-white text-black flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform duration-500 ease-[0.16,1,0.3,1]"
                                        >
                                            <Play size={28} className="fill-black ml-1.5" />
                                        </motion.button>
                                    </div>
                                )}
                            </div>

                            {/* Controls & Meta */}
                            <div className="h-auto md:h-24 bg-[#101010] border-t border-white/[0.05] p-6 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shrink-0">
                                <div className="space-y-2 flex-1 min-w-0">
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                                        Active Session
                                    </div>
                                    <h2 className="text-xl md:text-3xl font-semibold tracking-tight text-white line-clamp-1">{activeVideo?.title}</h2>
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                                        <span className="flex items-center gap-1.5"><Clock size={12} strokeWidth={2.5}/> {activeVideo?.duration}</span>
                                        <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                                        <span>Module {currModuleNum}</span>
                                    </p>
                                </div>

                                <button
                                    onClick={handleCompleteAndContinue}
                                    disabled={markingComplete}
                                    className={cn(
                                        "w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold transition-all duration-300 text-sm",
                                        isCurrentCompleted
                                            ? "bg-[#1A1A1A] text-zinc-500 border border-white/5"
                                            : "bg-white hover:bg-zinc-200 text-black hover:scale-[1.02] active:scale-95 shadow-xl"
                                    )}
                                >
                                    {markingComplete ? "Saving..." : isCurrentCompleted ? (
                                        <>
                                            <CheckCircle size={18} />
                                            <span>Completed</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Complete & Continue</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Panel: Premium Sidebar */}
            <div className="w-full lg:w-[450px] xl:w-[500px] shrink-0 h-[400px] lg:h-full border-t lg:border-t-0 lg:border-l border-white/[0.05] flex flex-col z-20 bg-[#0a0a0a]">
                <div className="p-6 lg:p-10 border-b border-white/[0.05] bg-[#0a0a0a] sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-3xl font-semibold tracking-tight text-white">Curriculum.</h2>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Masterclass</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-zinc-400 font-mono tracking-tight">{Math.round((completedVideos.size / allVideos.length) * 100)}% Complete</span>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/[0.02]">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-1000 ease-[0.16,1,0.3,1] shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            style={{ width: `${(completedVideos.size / allVideos.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-5">
                    <AnimatePresence initial={false}>
                        {curriculumData.map((week) => {
                            const isOpen = openWeekIds.includes(week.id);
                            const isWeekLocked = !accessLoading && !accessMap[week.id]?.unlocked;

                            return (
                                <div key={week.id} className={cn(
                                    "rounded-[2.5rem] overflow-hidden border transition-all duration-500 relative",
                                    isOpen && !isWeekLocked
                                        ? "bg-[#101010] border-white/10 shadow-lg"
                                        : "bg-[#0a0a0a] border-white/[0.02] hover:bg-[#121212] hover:border-white/[0.05]"
                                )}>
                                    <button
                                        onClick={() => toggleWeek(week.id)}
                                        className="w-full flex items-center justify-between p-6 text-left group"
                                    >
                                        <div className="flex items-center gap-5">
                                            {isWeekLocked ? (
                                                <div className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center bg-black border border-white/5 shrink-0">
                                                    <Lock size={18} className="text-zinc-600" />
                                                </div>
                                            ) : (
                                                <div className={cn(
                                                    "w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-xl font-semibold transition-colors duration-500 shrink-0 shadow-inner",
                                                    isOpen ? "bg-white text-black" : "bg-black border border-white/5 text-zinc-400 group-hover:bg-white/5 group-hover:text-white"
                                                )}>
                                                    {week.id.split(' ')[1] || week.id}
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-1 pr-4">
                                                <span className={cn(
                                                    "text-lg font-semibold tracking-tight transition-colors leading-snug",
                                                    isWeekLocked ? "text-zinc-600" : isOpen ? "text-white" : "text-zinc-500 group-hover:text-white"
                                                )}>
                                                    {week.title}
                                                </span>
                                                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                                                    {week.videos.length} Modules
                                                </span>
                                            </div>
                                        </div>
                                        {!isWeekLocked && (
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0",
                                                isOpen ? "bg-white/10 text-white" : "text-zinc-600 group-hover:bg-white/5 group-hover:text-white"
                                            )}>
                                                <ChevronDown size={18} strokeWidth={2} className={cn("transition-transform duration-500", isOpen && "rotate-180")} />
                                            </div>
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {isOpen && !isWeekLocked && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: "auto" }}
                                                exit={{ height: 0 }}
                                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                            >
                                                <div className="flex flex-col gap-2 p-3 pb-6 border-t border-white/[0.02]">
                                                    {week.videos.map((video, idx) => {
                                                        const isActive = activeVideoId === video.videoId;
                                                        const isCompleted = completedVideos.has(video.videoId);
                                                        const isLocked = isSequentialLocked(video.videoId);

                                                        return (
                                                            <button
                                                                key={idx}
                                                                id={`video-${video.videoId}`}
                                                                onClick={() => !isLocked && handleVideoClick(video.videoId, week.id)}
                                                                disabled={isLocked}
                                                                className={cn(
                                                                    "w-full flex items-center gap-5 p-4 mx-1 rounded-3xl transition-all duration-300 text-left group relative border",
                                                                    isActive
                                                                        ? "bg-[#1A1A1A] border-white/10 shadow-inner"
                                                                        : isLocked
                                                                            ? "opacity-40 cursor-not-allowed border-transparent"
                                                                            : "bg-transparent border-transparent hover:bg-white/[0.02]"
                                                                )}
                                                            >
                                                                <div className="shrink-0">
                                                                    {isActive ? (
                                                                        <div className="w-12 h-12 rounded-[1.25rem] bg-white flex items-center justify-center shadow-lg transform scale-105 transition-transform">
                                                                            <Play size={16} className="text-black fill-black ml-1" />
                                                                        </div>
                                                                    ) : isCompleted ? (
                                                                        <div className="w-12 h-12 rounded-[1.25rem] bg-[#121212] border border-white/5 flex items-center justify-center text-green-500">
                                                                            <CheckCircle size={20} />
                                                                        </div>
                                                                    ) : isLocked ? (
                                                                        <div className="w-12 h-12 rounded-[1.25rem] border border-white/5 bg-black flex items-center justify-center text-zinc-600">
                                                                            <Lock size={14} />
                                                                        </div>
                                                                    ) : (
                                                                         <div className="w-12 h-12 rounded-[1.25rem] border border-white/5 bg-black flex items-center justify-center text-zinc-600 font-semibold group-hover:text-white group-hover:border-white/20 transition-all">
                                                                            {idx + 1}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                                                    <p className={cn(
                                                                        "text-sm font-semibold transition-colors line-clamp-2 leading-snug tracking-tight",
                                                                        isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-200"
                                                                    )}>
                                                                        {video.title}
                                                                    </p>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className={cn(
                                                                             "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest",
                                                                            isActive ? "text-zinc-400" : "text-zinc-700 group-hover:text-zinc-500 transition-colors"
                                                                        )}>
                                                                            <Clock size={10} strokeWidth={2.5} />
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
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default TimePriceEnergyIntroduction;
