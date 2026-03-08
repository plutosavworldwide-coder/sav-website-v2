import { useState, useEffect } from 'react';
import { Play, Clock, ChevronDown, Folder, Lock, CheckCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { curriculumData } from '../data/curriculum';
import { supabase } from '../lib/supabase';
import { getUserAccessMap } from '../lib/accessEngine';
import { cn } from "@/lib/utils";
import VerificationModal from '../components/VerificationModal';

const Dashboard = () => {
    // Determine the initially active video and its week to open that folder by default
    const firstWeek = curriculumData[0];
    const firstVideo = firstWeek.videos[0];

    const [userSubscriptionType, setUserSubscriptionType] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState(null); 
    const [userId, setUserId] = useState(null);

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
                setUserId(user.id);
                // Fetch Profile for Subscription Type
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('subscription_type, verification_status')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setUserSubscriptionType(profile.subscription_type);
                    setVerificationStatus(profile.verification_status || 'none');
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
                    console.warn("Could not fetch progress:", error);
                }

                // --- RESUME LOGIC ---
                const nextVideo = allVideos.find(v => !completedSet.has(v.videoId));
                const targetVideo = nextVideo || allVideos[allVideos.length - 1] || firstVideo;

                if (targetVideo) {
                    setActiveVideoId(targetVideo.videoId);

                    const week = curriculumData.find(w => w.videos.some(v => v.videoId === targetVideo.videoId));
                    if (week) {
                        setOpenWeekIds(prev => [...new Set([...prev, week.id])]);
                    }

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
            <div className="flex flex-col h-screen bg-black text-white font-sans items-center justify-center p-6 text-center selection:bg-white/20">
                <div className="max-w-md w-full bg-[#101010] border border-white/[0.05] rounded-[2.5rem] p-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <Lock size={32} className="text-zinc-400" />
                    </div>
                    <h2 className="text-3xl font-semibold tracking-tight text-white mb-4">Access restricted.</h2>
                    <p className="text-zinc-500 font-medium mb-10 leading-relaxed">
                        You're on the <strong>Indicators Only</strong> plan. 
                        The Learning Dashboard is available on Standard, Extended, and Lifetime subscriptions.
                    </p>
                    <div className="flex flex-col gap-4 w-full">
                        <button
                            onClick={() => window.location.href = '/choose-plan'}
                            className="w-full py-4 bg-white text-black font-semibold rounded-full transition-transform hover:scale-[1.02] active:scale-95"
                        >
                            Upgrade Plan
                        </button>
                        <button
                            onClick={() => window.location.href = '/indicators'}
                            className="w-full py-4 bg-[#1a1a1a] text-white font-medium rounded-full transition-transform hover:scale-[1.02] active:scale-95 hover:bg-[#202020]"
                        >
                            Go to Indicators
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (verificationStatus === 'none' || verificationStatus === 'pending') {
        if (verificationStatus === 'none') {
            return (
                <div className="flex flex-col h-screen bg-black text-white font-sans items-center justify-center p-6 text-center">
                    <VerificationModal
                        userId={userId}
                        onSubmitted={() => setVerificationStatus('pending')}
                    />
                </div>
            );
        }

        if (verificationStatus === 'pending') {
            return (
                <div className="flex flex-col h-screen bg-black text-white font-sans items-center justify-center p-6 text-center selection:bg-white/20">
                    <div className="max-w-md w-full bg-[#101010] border border-white/[0.05] rounded-[2.5rem] p-10 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                            <Clock size={32} className="text-zinc-400" />
                        </div>
                        <h2 className="text-3xl font-semibold tracking-tight text-white mb-4">Verification Pending.</h2>
                        <p className="text-zinc-500 font-medium mb-8 leading-relaxed">
                            We're verifying your details. This usually takes less than 24 hours. Full access will be granted automatically.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-white bg-white/5 hover:bg-white/10 px-6 py-2 rounded-full text-sm font-medium transition-colors"
                        >
                            Check Status Again
                        </button>
                    </div>
                </div>
            );
        }
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
                } else {
                    alert("Congratulations! You have completed the entire curriculum.");
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

    return (
        <div className="flex flex-col h-screen font-sans overflow-hidden bg-black text-white selection:bg-white/20">
            {/* Top Video Player Section */}
            <div className="flex flex-col shrink-0 z-10 bg-black pb-8 pt-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-5xl mx-auto px-6 h-full flex flex-col"
                >
                    {/* Header */}
                    <div className="flex flex-col gap-1 mb-8">
                        <h1 className="text-4xl font-semibold tracking-tighter text-white">
                            Time Price Energy.
                        </h1>
                        <p className="text-zinc-500 font-medium tracking-tight">
                            Module: <span className="text-white">{activeVideo?.title}</span>
                        </p>
                    </div>

                    {/* Apple Bento Style Player Card */}
                    <div className="relative w-full rounded-[2.5rem] bg-[#101010] border border-white/[0.05] overflow-hidden flex flex-col group/player shrink-0">

                        {/* Video Area */}
                        <div className="relative w-full aspect-video bg-black">
                            {activeVideoId ? (
                                <iframe
                                    className="absolute inset-0 w-full h-full z-20"
                                    src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&modestbranding=1&rel=0&controls=1`}
                                    title="Lecture Player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="absolute inset-0">
                                        {firstVideo?.videoId && (
                                            <img
                                                src={`https://img.youtube.com/vi/${firstVideo.videoId}/maxresdefault.jpg`}
                                                alt="Cover"
                                                className="w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105 transition-transform duration-[10s] ease-linear group-hover/player:scale-110"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
                                    </div>
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="relative z-10 text-center space-y-6"
                                    >
                                        <button
                                            onClick={handlePlayAll}
                                            className="group relative inline-flex items-center justify-center"
                                        >
                                            <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] flex items-center justify-center group-hover:scale-105 transition-transform duration-500 ease-[0.16,1,0.3,1] group-hover:bg-white/20">
                                                <Play size={28} className="text-white ml-1.5 fill-white" />
                                            </div>
                                        </button>
                                        <div>
                                            <h2 className="text-3xl font-semibold text-white tracking-tight">Begin Course</h2>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </div>

                        {/* Player Bottom Control Strip */}
                        <div className="h-20 bg-[#101010] border-t border-white/[0.05] px-8 flex items-center justify-between shrink-0">
                            <span className="text-lg font-medium tracking-tight text-white line-clamp-1">{activeVideo?.title}</span>

                            {/* Crisp B&W Button */}
                            <button
                                onClick={handleCompleteAndContinue}
                                disabled={markingComplete}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300",
                                    isCurrentCompleted
                                        ? "bg-white/5 text-zinc-400 border border-white/5"
                                        : "bg-white text-black hover:scale-[1.02] active:scale-95"
                                )}
                            >
                                {markingComplete ? (
                                    <span className="animate-pulse">Saving...</span>
                                ) : isCurrentCompleted ? (
                                    <>
                                        <CheckCircle size={18} />
                                        <span>Completed</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Mark as Complete</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Scrollable Curriculum List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 overflow-y-auto custom-scrollbar w-full max-w-5xl mx-auto px-6 pb-20 pt-4"
            >
                {/* Stats Bar */}
                <div className="flex items-center justify-between mb-8 bg-[#101010] border border-white/[0.05] p-6 rounded-[2rem]">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-semibold tracking-tight text-white">Curriculum.</h2>
                        <span className="text-xs uppercase tracking-widest font-semibold text-zinc-500">Course Progress</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-semibold tracking-tighter text-white">
                            {allVideos.length > 0 ? Math.round((completedVideos.size / allVideos.length) * 100) : 0}%
                        </span>
                        <div className="w-40 h-2 bg-black rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-1000 ease-[0.16,1,0.3,1]"
                                style={{ width: `${allVideos.length > 0 ? Math.round((completedVideos.size / allVideos.length) * 100) : 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Modules */}
                <div className="flex flex-col gap-4">
                    <AnimatePresence initial={false}>
                        {curriculumData.map((week) => {
                            const isOpen = openWeekIds.includes(week.id);
                            const isWeekLocked = !accessLoading && !accessMap[week.id]?.unlocked;

                            return (
                                <motion.div
                                    key={week.id}
                                    className={cn(
                                        "rounded-[2rem] overflow-hidden border transition-all duration-500",
                                        isOpen
                                            ? "bg-[#101010] border-white/10"
                                            : "bg-[#0a0a0a] border-white/[0.02] hover:bg-[#101010] hover:border-white/[0.05]"
                                    )}
                                >
                                    <button
                                        onClick={() => toggleWeek(week.id)}
                                        className="w-full flex items-center justify-between p-6 text-left group"
                                    >
                                        <div className="flex items-center gap-6">
                                            {isWeekLocked ? (
                                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                                                    <Lock size={20} className="text-zinc-600" />
                                                </div>
                                            ) : (
                                                <div className={cn(
                                                    "w-14 h-14 rounded-[1.25rem] flex items-center justify-center border shrink-0 transition-colors duration-500",
                                                    isOpen
                                                        ? "bg-white text-black border-white"
                                                        : "bg-black border-white/10 text-white group-hover:bg-white/5"
                                                )}>
                                                    <Folder size={20} className={isOpen ? "fill-black" : ""} />
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-1">
                                                <span className={cn(
                                                    "text-xl font-semibold tracking-tight transition-colors",
                                                    isWeekLocked ? "text-zinc-600" : "text-zinc-400 group-hover:text-white",
                                                    isOpen && "text-white"
                                                )}>
                                                    {week.title}
                                                </span>
                                                <span className="text-xs uppercase tracking-widest font-semibold text-zinc-500">
                                                    {week.videos.length} Lectures
                                                </span>
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-500",
                                            isOpen ? "rotate-180 text-white" : "text-zinc-600 group-hover:text-white"
                                        )}>
                                            <ChevronDown size={24} strokeWidth={1.5} />
                                        </div>
                                    </button>

                                    <motion.div
                                        initial={false}
                                        animate={{ height: isOpen ? "auto" : 0 }}
                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex flex-col gap-2 p-2 pb-6">
                                            {isWeekLocked ? (
                                                <div className="p-10 text-center bg-black rounded-3xl border border-white/[0.02] m-4">
                                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                                                        <Lock className="w-6 h-6 text-zinc-400" />
                                                    </div>
                                                    <h3 className="text-xl font-semibold tracking-tight text-white mb-2">Module Locked</h3>
                                                    <p className="text-sm font-medium text-zinc-500 mb-8 max-w-xs mx-auto">
                                                        Upgrade your plan to access this specific content module.
                                                    </p>
                                                    <button
                                                        onClick={() => window.location.href = '/choose-plan'}
                                                        className="px-8 py-3 bg-white text-black text-sm font-semibold rounded-full hover:scale-105 transition-transform"
                                                    >
                                                        Upgrade Plan
                                                    </button>
                                                </div>
                                            ) : (
                                                week.videos.map((video, idx) => {
                                                    const isActive = activeVideoId === video.videoId;
                                                    const isCompleted = completedVideos.has(video.videoId);
                                                    const isLocked = isSequentialLocked(video.videoId);

                                                    return (
                                                        <div
                                                            key={idx}
                                                            id={`video-${video.videoId}`}
                                                            onClick={() => !isLocked && handleVideoClick(video.videoId, week.id)}
                                                            className={cn(
                                                                "group relative flex items-center gap-6 p-4 mx-4 rounded-2xl transition-all duration-300",
                                                                isActive
                                                                    ? "bg-white/5 border border-white/10 cursor-default"
                                                                    : isLocked
                                                                        ? "bg-transparent opacity-40 cursor-not-allowed"
                                                                        : "bg-transparent border border-transparent hover:bg-white/[0.03] cursor-pointer"
                                                            )}
                                                        >
                                                            <div className="shrink-0">
                                                                {isActive ? (
                                                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                                                                        <Play size={18} className="text-black fill-black ml-0.5" />
                                                                    </div>
                                                                ) : isCompleted ? (
                                                                    <div className="w-12 h-12 rounded-full border-2 border-zinc-700 flex items-center justify-center text-zinc-400 bg-black">
                                                                        <CheckCircle size={18} />
                                                                    </div>
                                                                ) : isLocked ? (
                                                                    <div className="w-12 h-12 rounded-full border border-white/5 bg-black flex items-center justify-center text-zinc-700">
                                                                        <Lock size={16} />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-12 h-12 rounded-full border border-white/10 bg-black flex items-center justify-center text-zinc-500 font-semibold group-hover:text-white group-hover:border-white/30 transition-all">
                                                                        {idx + 1}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                                                                <p className={cn(
                                                                    "text-base font-medium transition-colors",
                                                                    isActive ? "text-white font-semibold" : isLocked ? "text-zinc-600" : "text-zinc-400 group-hover:text-zinc-200"
                                                                )}>
                                                                    {video.title}
                                                                </p>
                                                                <div className="flex items-center gap-3">
                                                                    <span className={cn(
                                                                        "flex items-center gap-1.5 text-xs font-medium tracking-wide",
                                                                        isActive ? "text-zinc-400" : "text-zinc-600"
                                                                    )}>
                                                                        <Clock size={12} />
                                                                        {video.duration}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {!isLocked && !isActive && (
                                                                <div className="opacity-0 group-hover:opacity-100 pr-4 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                                                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white bg-white/5">
                                                                        <Play size={16} className="ml-0.5" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
export default Dashboard;
