import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Calendar, Clock, ChevronDown, CheckCircle, ArrowRight, Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dailyReviewsData } from "../data/dailyReviews";
import { cn } from "@/lib/utils";
import SecureVideoPlayer from '../components/SecureVideoPlayer';
import { supabase } from '../lib/supabase';

const DailyReviews = () => {
    const navigate = useNavigate();

    // Flatten all videos
    const allVideos = dailyReviewsData.flatMap(month => month.videos);
    // Default to the first video of the first month (newest typically)
    const firstMonth = dailyReviewsData[0];
    const firstVideo = firstMonth?.videos[0];

    const [activeVideoId, setActiveVideoId] = useState(firstVideo?.videoId || null);
    const [userEmail, setUserEmail] = useState(null);
    const [openMonthIds, setOpenMonthIds] = useState([firstMonth?.id]);
    const [completedVideos, setCompletedVideos] = useState(new Set());
    const [loadingProgress, setLoadingProgress] = useState(true);

    const activeVideo = allVideos.find(v => v.videoId === activeVideoId) || firstVideo;

    // Fetch User & Progress
    useEffect(() => {
        const fetchUserAndProgress = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email);

                // Fetch progress (optional for Daily Reviews but good for consistency)
                const { data: progressData } = await supabase
                    .from('video_progress')
                    .select('video_id')
                    .eq('user_id', user.id);

                if (progressData) {
                    setCompletedVideos(new Set(progressData.map(p => p.video_id)));
                } else {
                    setCompletedVideos(new Set());
                }
            }
            setLoadingProgress(false);
        };
        fetchUserAndProgress();
    }, []);

    const toggleMonth = (monthId) => {
        setOpenMonthIds(current =>
            current.includes(monthId)
                ? current.filter(id => id !== monthId)
                : [...current, monthId]
        );
    };

    const handleVideoSelect = (video, monthId) => {
        setActiveVideoId(video.videoId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleMarkComplete = async () => {
        if (!activeVideoId) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('video_progress')
                    .upsert({ user_id: user.id, video_id: activeVideoId }, { onConflict: 'user_id, video_id' });

                setCompletedVideos(prev => new Set(prev).add(activeVideoId));
            }
        } catch (err) {
            console.error("Error marking complete:", err);
        }
    };

    const isCurrentCompleted = completedVideos.has(activeVideoId);

    return (
        <div className="flex flex-col lg:flex-row h-screen font-sans overflow-hidden bg-black text-white selection:bg-white/20">

            {/* Left Panel: Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar relative z-10 w-full min-w-0">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-7xl mx-auto flex flex-col gap-6 px-6 pt-6 pb-20"
                >
                    {/* Header */}
                    <div className="flex flex-col gap-1 mt-1 mb-2">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-zinc-500 hover:text-white mb-4 transition-colors w-fit font-medium"
                        >
                            <ArrowRight className="w-5 h-5 rotate-180" />
                            <span>Back to Dashboard</span>
                        </button>
                        <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter text-white">
                            Daily Market Reviews.
                        </h1>
                        <p className="text-zinc-500 text-lg font-medium flex items-center gap-2 tracking-tight">
                            <span>Current Session:</span>
                            <span className="text-white font-medium">
                                {activeVideo?.title || "Select a video"}
                            </span>
                        </p>
                    </div>

                    {/* Cinematic Player Apple Style */}
                    <div className="relative w-full rounded-[2.5rem] bg-[#101010] border border-white/[0.05] flex flex-col overflow-hidden group/player shrink-0">

                        {/* Video Area */}
                        <div className="relative w-full aspect-video bg-black">
                            {activeVideoId ? (
                                <SecureVideoPlayer
                                    key={activeVideoId}
                                    videoId={activeVideoId}
                                    title={activeVideo?.title}
                                    watermarkText={userEmail}
                                    onComplete={handleMarkComplete}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                    <p className="relative z-10 text-zinc-500 font-medium">Select a session to watch</p>
                                </div>
                            )}
                        </div>

                        {/* Meta Bar */}
                        <div className="h-auto md:h-24 bg-[#101010] border-t border-white/[0.05] p-5 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white line-clamp-1">
                                        {activeVideo?.title}
                                    </h2>
                                    <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                                        {activeVideo && (
                                            <>
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={12} />
                                                    {activeVideo.date}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={12} />
                                                    {activeVideo.duration}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Complete Button */}
                            <button
                                onClick={handleMarkComplete}
                                className={cn(
                                    "w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all duration-300",
                                    isCurrentCompleted
                                        ? "bg-white/5 text-zinc-400 border border-white/5"
                                        : "bg-white hover:bg-zinc-200 text-black hover:scale-[1.02] active:scale-95"
                                )}
                            >
                                {isCurrentCompleted ? (
                                    <>
                                        <CheckCircle size={18} />
                                        <span>Viewed</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Mark as Viewed</span>
                                        <CheckCircle size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Panel: Sidebar List */}
            <div className="w-full lg:w-[450px] xl:w-[500px] shrink-0 h-[400px] lg:h-full border-t lg:border-t-0 lg:border-l border-white/[0.05] flex flex-col z-20 bg-[#0a0a0a]">
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-6 lg:p-8">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between mb-8 px-1">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-semibold tracking-tight text-white">Archive.</h2>
                            <p className="text-xs uppercase tracking-widest font-semibold text-zinc-500">Daily Sessions</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-500 bg-[#101010] border border-white/10 px-4 py-2 rounded-full font-medium">
                            <span className="text-white font-semibold">{allVideos.length}</span> Total
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <AnimatePresence initial={false}>
                            {dailyReviewsData.map((month) => {
                                const isOpen = openMonthIds.includes(month.id);
                                return (
                                    <motion.div
                                        key={month.id}
                                        className={cn(
                                            "rounded-[2rem] overflow-hidden border transition-all duration-500",
                                            isOpen
                                                ? "bg-[#101010] border-white/10"
                                                : "bg-[#0a0a0a] border-white/[0.02] hover:bg-[#101010] hover:border-white/[0.05]"
                                        )}
                                    >
                                        <button
                                            onClick={() => toggleMonth(month.id)}
                                            className="w-full flex items-center justify-between p-6 text-left group"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-[1.25rem] flex items-center justify-center border shrink-0 transition-colors duration-500",
                                                    isOpen
                                                        ? "bg-white text-black border-white"
                                                        : "bg-black border-white/10 text-white group-hover:bg-white/5"
                                                )}>
                                                    <Calendar size={18} className={isOpen ? "stroke-black" : ""} />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className={cn(
                                                        "text-lg font-semibold tracking-tight transition-colors",
                                                        isOpen ? "text-white" : "text-zinc-400 group-hover:text-white"
                                                    )}>
                                                        {month.title}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest">
                                                        {month.videos.length} Sessions
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-500",
                                                isOpen ? "rotate-180 text-white" : "text-zinc-600 group-hover:text-white"
                                            )}>
                                                <ChevronDown size={20} strokeWidth={1.5} />
                                            </div>
                                        </button>

                                        <motion.div
                                            initial={false}
                                            animate={{ height: isOpen ? "auto" : 0 }}
                                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="flex flex-col gap-2 p-3 pb-6 border-t border-white/[0.02]">
                                                {month.videos.map((video, idx) => {
                                                    const isActive = activeVideoId === video.videoId;
                                                    const isCompleted = completedVideos.has(video.videoId);

                                                    return (
                                                        <div
                                                            key={idx}
                                                            onClick={() => handleVideoSelect(video, month.id)}
                                                            className={cn(
                                                                "group relative flex items-center gap-5 p-3 mx-2 rounded-2xl transition-all duration-300 cursor-pointer border",
                                                                isActive
                                                                    ? "bg-white/5 border-white/10"
                                                                    : "bg-transparent border-transparent hover:bg-white/[0.03]"
                                                            )}
                                                        >
                                                            <div className="shrink-0">
                                                                {isActive ? (
                                                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                                                                        <Play size={14} className="text-black fill-black ml-0.5" />
                                                                    </div>
                                                                ) : isCompleted ? (
                                                                    <div className="w-10 h-10 rounded-full bg-black border border-white/20 flex items-center justify-center text-zinc-400">
                                                                        <CheckCircle size={16} />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-full border border-white/5 bg-black flex items-center justify-center text-zinc-500 font-medium group-hover:text-white group-hover:border-white/20 transition-all">
                                                                        {video.number || idx + 1}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                                                                <p className={cn(
                                                                    "text-sm font-semibold transition-colors line-clamp-2 leading-snug",
                                                                    isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                                                                )}>
                                                                    {video.title}
                                                                </p>
                                                                <div className="flex items-center gap-3">
                                                                    <span className={cn(
                                                                        "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest",
                                                                        isActive ? "text-zinc-500" : "text-zinc-600"
                                                                    )}>
                                                                        <Clock size={10} />
                                                                        {video.duration}
                                                                    </span>
                                                                    <span className={cn(
                                                                        "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest",
                                                                        isActive ? "text-zinc-500" : "text-zinc-600"
                                                                    )}>
                                                                        <Calendar size={10} />
                                                                        {video.date}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyReviews;
