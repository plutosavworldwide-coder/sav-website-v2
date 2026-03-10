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

    const allVideos = curriculumData.flatMap(week => week.videos);
    const activeVideo = allVideos.find(v => v.videoId === activeVideoId) || firstVideo;

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email);
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('subscription_type')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setUserSubscriptionType(profile.subscription_type);
                }

                const map = await getUserAccessMap(user);
                setAccessMap(map);
                setAccessLoading(false);

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

    if (userSubscriptionType === 'indicators_only') {
        return (
            <div className="flex flex-col h-screen font-sans items-center justify-center p-6 text-center bg-white selection:bg-[#2383e2]/20">
                <div className="max-w-[420px] w-full bg-[#F7F7F5] border border-[#e9e9e7] rounded-[2.5rem] p-10 flex flex-col items-center shadow-lg">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-8 shadow-sm border border-[#e9e9e7]">
                        <Lock size={32} className="text-[#37352f]" />
                    </div>
                    <h2 className="text-3xl font-semibold text-[#37352f] tracking-tight mb-4">Restricted Access.</h2>
                    <p className="text-[#787774] mb-10 text-sm font-medium leading-relaxed max-w-xs">
                        The Masterclass Curriculum is exclusive to Standard and Lifetime members.
                    </p>
                    <div className="flex flex-col gap-4 w-full">
                        <button
                            onClick={() => navigate('/choose-plan')}
                            className="w-full py-4 bg-[#37352f] text-white font-semibold rounded-full hover:scale-105 active:scale-95 transition-transform duration-300 shadow-md text-base"
                        >
                            Upgrade to Full Access
                        </button>
                        <button
                            onClick={() => navigate('/indicators')}
                            className="w-full py-4 bg-transparent hover:bg-white text-[#787774] hover:text-[#37352f] font-medium rounded-full transition-all border border-[#e9e9e7] shadow-sm text-base"
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
                            Time Price Energy.
                        </h1>
                        <p className="text-[#787774] text-lg font-medium tracking-tight">
                            The definitive guide to institutional execution.
                        </p>
                    </div>

                    {/* Content Container */}
                    <div className="flex flex-col gap-6">
                        {/* Player Wrapper */}
                        <div className="relative group/player rounded-[3rem] overflow-hidden bg-white border border-[#e9e9e7] shrink-0 shadow-sm">
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
                                                    className="w-full h-full object-cover opacity-30 blur-md grayscale mix-blend-multiply"
                                                />
                                            )}
                                        </div>
                                        <motion.button
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            onClick={handlePlayAll}
                                            className="relative z-10 w-20 h-20 rounded-[1.5rem] bg-[#37352f] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform duration-500 ease-[0.16,1,0.3,1]"
                                        >
                                            <Play size={28} className="fill-white ml-1.5" />
                                        </motion.button>
                                    </div>
                                )}
                            </div>

                            {/* Controls & Meta */}
                            <div className="h-auto md:h-24 bg-white border-t border-[#e9e9e7] p-6 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shrink-0">
                                <div className="space-y-2 flex-1 min-w-0">
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#F7F7F5] border border-[#e9e9e7] text-[10px] font-bold uppercase tracking-widest text-[#787774] mb-1">
                                        Active Module
                                    </div>
                                    <h2 className="text-xl md:text-3xl font-semibold tracking-tight text-[#37352f] line-clamp-1">{activeVideo?.title}</h2>
                                    <p className="text-[#787774] text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                                        <span className="flex items-center gap-1.5"><Clock size={12} strokeWidth={2.5}/> {activeVideo?.duration}</span>
                                        <span className="w-1 h-1 bg-[#e9e9e7] rounded-full" />
                                        <span>Module {currModuleNum}</span>
                                    </p>
                                </div>

                                <button
                                    onClick={handleCompleteAndContinue}
                                    disabled={markingComplete}
                                    className={cn(
                                        "w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold transition-all duration-300 text-sm shadow-sm",
                                        isCurrentCompleted
                                            ? "bg-[#F7F7F5] text-[#787774] border border-[#e9e9e7]"
                                            : "bg-[#37352f] hover:bg-black text-white hover:scale-[1.02] active:scale-95 shadow-md"
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
            <div className="w-full lg:w-[450px] xl:w-[500px] shrink-0 h-[400px] lg:h-full border-t lg:border-t-0 lg:border-l border-[#e9e9e7] flex flex-col z-20 bg-[#F7F7F5]">
                <div className="p-6 lg:p-10 border-b border-[#e9e9e7] bg-[#F7F7F5] sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-3xl font-semibold tracking-tight text-[#37352f]">Curriculum.</h2>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-[#787774]">Masterclass</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-[#787774] font-mono tracking-tight">{Math.round((completedVideos.size / allVideos.length) * 100)}% Complete</span>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-[#e9e9e7] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#2383e2] rounded-full transition-all duration-1000 ease-[0.16,1,0.3,1] shadow-sm"
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
                                        ? "bg-white border-[#e9e9e7] shadow-sm"
                                        : "bg-transparent border-transparent hover:bg-white hover:border-[#e9e9e7] hover:shadow-sm"
                                )}>
                                    <button
                                        onClick={() => toggleWeek(week.id)}
                                        className="w-full flex items-center justify-between p-6 text-left group"
                                    >
                                        <div className="flex items-center gap-5">
                                            {isWeekLocked ? (
                                                <div className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center bg-white border border-[#e9e9e7] shadow-sm shrink-0">
                                                    <Lock size={18} className="text-[#787774]" />
                                                </div>
                                            ) : (
                                                <div className={cn(
                                                    "w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-xl font-semibold transition-colors duration-500 shrink-0 shadow-sm",
                                                    isOpen ? "bg-[#37352f] text-white" : "bg-white border border-[#e9e9e7] text-[#787774] group-hover:bg-[#F7F7F5] group-hover:text-[#37352f]"
                                                )}>
                                                    {week.id.split(' ')[1] || week.id}
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-1 pr-4">
                                                <span className={cn(
                                                    "text-lg font-semibold tracking-tight transition-colors leading-snug",
                                                    isWeekLocked ? "text-[#787774]" : isOpen ? "text-[#37352f]" : "text-[#787774] group-hover:text-[#37352f]"
                                                )}>
                                                    {week.title}
                                                </span>
                                                <span className="text-[10px] text-[#787774] font-bold uppercase tracking-widest mt-1">
                                                    {week.videos.length} Modules
                                                </span>
                                            </div>
                                        </div>
                                        {!isWeekLocked && (
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0",
                                                isOpen ? "bg-[#F7F7F5] text-[#37352f]" : "text-[#787774] group-hover:bg-white border border-transparent group-hover:border-[#e9e9e7] group-hover:text-[#37352f] shadow-sm"
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
                                                <div className="flex flex-col gap-2 p-3 pb-6 border-t border-[#e9e9e7]">
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
                                                                        ? "bg-[#F7F7F5] border-[#e9e9e7] shadow-sm"
                                                                        : isLocked
                                                                            ? "opacity-40 cursor-not-allowed border-transparent"
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
                                                                    ) : isLocked ? (
                                                                        <div className="w-12 h-12 rounded-[1.25rem] border border-[#e9e9e7] bg-[#F7F7F5] flex items-center justify-center text-[#787774] shadow-sm">
                                                                            <Lock size={14} />
                                                                        </div>
                                                                    ) : (
                                                                         <div className="w-12 h-12 rounded-[1.25rem] border border-[#e9e9e7] bg-[#F7F7F5] flex items-center justify-center text-[#787774] font-semibold group-hover:bg-white group-hover:text-[#37352f] shadow-sm transition-all">
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
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default TimePriceEnergyIntroduction;
