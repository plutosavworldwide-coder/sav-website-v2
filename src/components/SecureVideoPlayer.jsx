import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, Settings, Check, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

const SecureVideoPlayer = ({ videoId, onComplete, onProgress, title, poster, watermarkText, className }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);

    const [qualities, setQualities] = useState([]);
    const [currentQuality, setCurrentQuality] = useState('auto');
    const [showSettings, setShowSettings] = useState(false);
    const [settingsTab, setSettingsTab] = useState('quality'); // 'quality' | 'language'
    const [captionsEnabled, setCaptionsEnabled] = useState(false);
    const [captionLang, setCaptionLang] = useState('en');

    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const progressIntervalRef = useRef(null);

    // Format time (seconds -> MM:SS)
    const formatTime = (seconds) => {
        if (!seconds) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const updateQualities = () => {
        if (playerRef.current && playerRef.current.getAvailableQualityLevels) {
            setQualities(playerRef.current.getAvailableQualityLevels());
        }
    };

    const handleReady = (event) => {
        playerRef.current = event.target;
        setDuration(event.target.getDuration());
        setIsLoading(false);
        updateQualities();

        // Restore playback position and state if reloading (e.g., due to caption toggle)
        if (currentTime > 0) {
            event.target.seekTo(currentTime);
        }
        if (isPlaying) {
            event.target.playVideo();
        }
    };

    const handleStateChange = (event) => {
        // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
        if (event.data === 1) {
            setIsPlaying(true);
            setIsLoading(false);
            startProgressLoop();
            updateQualities();
        } else if (event.data === 2) {
            setIsPlaying(false);
            stopProgressLoop();
        } else if (event.data === 0) {
            setIsPlaying(false);
            stopProgressLoop();
            if (onComplete) onComplete();
        }
    };

    const handleQualityChange = (quality) => {
        if (playerRef.current && playerRef.current.setPlaybackQuality) {
            playerRef.current.setPlaybackQuality(quality);
            setCurrentQuality(quality);
            setShowSettings(false);
        }
    };

    const qualityLabels = {
        highres: '4K',
        hd2160: '4K',
        hd1440: '1440p',
        hd1080: '1080p',
        hd720: '720p',
        large: '480p',
        medium: '360p',
        small: '240p',
        tiny: '144p',
        auto: 'Auto'
    };

    const languageOptions = [
        { code: 'en', label: 'English' },
        { code: 'he', label: 'עברית' },
        { code: 'es', label: 'Español' },
        { code: 'fr', label: 'Français' },
        { code: 'de', label: 'Deutsch' },
        { code: 'ar', label: 'العربية' },
        { code: 'ru', label: 'Русский' },
        { code: 'pt', label: 'Português' },
        { code: 'ja', label: '日本語' },
    ];

    const handleLanguageChange = (langCode) => {
        setCaptionLang(langCode);
        setCaptionsEnabled(true);
        setShowSettings(false);
    };

    const startProgressLoop = () => {
        stopProgressLoop();
        progressIntervalRef.current = setInterval(() => {
            if (playerRef.current) {
                const curr = playerRef.current.getCurrentTime();
                const dur = playerRef.current.getDuration();
                setCurrentTime(curr);
                setDuration(dur);
                setProgress((curr / dur) * 100);
                if (onProgress) onProgress(curr);
            }
        }, 1000);
    };

    const stopProgressLoop = () => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }
    };

    const togglePlay = () => {
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
            setHasStarted(true);
        }
    };

    const handleSeek = (e) => {
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newTime = percentage * duration;

        if (playerRef.current) {
            playerRef.current.seekTo(newTime, true);
            setCurrentTime(newTime);
            setProgress(percentage * 100);
        }
    };

    const toggleMute = () => {
        if (!playerRef.current) return;
        if (isMuted) {
            playerRef.current.unMute();
            setIsMuted(false);
            setVolume(100);
        } else {
            playerRef.current.mute();
            setIsMuted(true);
            setVolume(0);
        }
    };

    const handleVolumeChange = (e) => {
        if (!playerRef.current) return;
        const newVolume = parseInt(e.target.value);
        playerRef.current.setVolume(newVolume);
        setVolume(newVolume);
        if (newVolume === 0) {
            setIsMuted(true);
        } else {
            setIsMuted(false);
        }
    };

    const toggleCaptions = () => {
        // Toggle state to trigger re-render with new playerVars
        setCaptionsEnabled(!captionsEnabled);
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            } else if (containerRef.current.webkitRequestFullscreen) {
                containerRef.current.webkitRequestFullscreen(); // Safari
            }
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            setIsFullscreen(false);
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    useEffect(() => {
        return () => {
            stopProgressLoop();
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full aspect-video bg-transparent overflow-hidden group select-none",
                isFullscreen ? "rounded-none" : "rounded-3xl",
                className
            )}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* 1. Underlying YouTube Player */}
            <div className="absolute inset-0 pointer-events-none">
                <YouTube
                    videoId={videoId}
                    key={`${videoId}-${captionsEnabled}-${captionLang}`}
                    className="w-full h-full"
                    iframeClassName="w-full h-full"
                    opts={{
                        height: '100%',
                        width: '100%',
                        playerVars: {
                            autoplay: 0,
                            controls: 0,
                            disablekb: 1,
                            modestbranding: 1,
                            rel: 0,
                            showinfo: 0,
                            iv_load_policy: 3,
                            fs: 0,
                            cc_load_policy: captionsEnabled ? 1 : 0,
                            cc_lang_pref: captionLang
                        },
                    }}
                    onReady={handleReady}
                    onStateChange={handleStateChange}
                />
            </div>

            {/* Dynamic Watermark Overlay */}
            {watermarkText && (
                <div className="absolute inset-0 z-[15] pointer-events-none overflow-hidden select-none flex items-start justify-start p-8">
                    <motion.div
                        className="opacity-[0.10] text-white text-lg font-bold font-mono whitespace-nowrap drop-shadow-md"
                        animate={{
                            x: [0, 200, 0, 300, 0],
                            y: [0, 150, 300, 0, 0],
                        }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: "linear",
                            repeatType: "mirror"
                        }}
                    >
                        {watermarkText} • {watermarkText} • NO DISTRIBUTION
                    </motion.div>
                </div>
            )}

            {/* 2. Transparent Interaction Shield */}
            <div
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={togglePlay}
                onContextMenu={(e) => e.preventDefault()}
            />

            {/* 3. Loading / Initial State Overlay */}
            {(!hasStarted || isLoading) && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-sm pointer-events-none">
                    {isLoading ? (
                        <Loader2 className="w-12 h-12 text-white animate-spin" />
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
                                <Play className="w-8 h-8 text-white fill-white ml-1" />
                            </div>
                            {title && <h3 className="text-white font-medium text-lg drop-shadow-md">{title}</h3>}
                        </motion.div>
                    )}
                </div>
            )}

            {/* 4. Controls Overlay */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-0 left-0 right-0 z-30 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
                    >
                        {/* Progress Bar */}
                        <div
                            className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-6 group/progress flex items-center"
                            onClick={(e) => { e.stopPropagation(); handleSeek(e); }}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <div
                                className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full pointer-events-none"
                                style={{ width: `${progress}%` }}
                            />
                            {/* Hover Thumb */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
                                style={{ left: `${progress}%` }}
                            />
                        </div>

                        {/* Buttons Row */}
                        <div className="flex items-center justify-between pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-6">
                                <button onClick={togglePlay} className="text-white hover:text-indigo-400 transition-colors focus:outline-none">
                                    {isPlaying ? <Pause size={28} className="fill-white" /> : <Play size={28} className="fill-white" />}
                                </button>

                                <div className="flex items-center gap-3 group/vol">
                                    <button onClick={toggleMute} className="text-white hover:text-indigo-400 transition-colors focus:outline-none">
                                        {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                    </button>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-transform"
                                    />
                                </div>

                                <span className="text-xs text-white/70 font-mono font-medium tracking-wide">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Settings Menu */}
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); setSettingsTab('quality'); }}
                                        className={cn("text-white hover:text-indigo-400 transition-colors focus:outline-none", showSettings && "text-indigo-400 rotate-45")}
                                    >
                                        <Settings size={24} />
                                    </button>

                                    <AnimatePresence>
                                        {showSettings && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute bottom-full right-0 mb-4 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-1.5 min-w-[160px] shadow-xl overflow-hidden"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {/* Tabs */}
                                                <div className="flex gap-1 mb-1.5 p-0.5 bg-white/5 rounded-lg">
                                                    <button
                                                        onClick={() => setSettingsTab('quality')}
                                                        className={cn(
                                                            "flex-1 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all",
                                                            settingsTab === 'quality' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                                                        )}
                                                    >
                                                        Quality
                                                    </button>
                                                    <button
                                                        onClick={() => setSettingsTab('language')}
                                                        className={cn(
                                                            "flex-1 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all",
                                                            settingsTab === 'language' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                                                        )}
                                                    >
                                                        Language
                                                    </button>
                                                </div>

                                                <div className="flex flex-col gap-0.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                                                    {settingsTab === 'quality' ? (
                                                        qualities.length > 0 ? qualities.map((q) => (
                                                            <button
                                                                key={q}
                                                                onClick={() => handleQualityChange(q)}
                                                                className={cn(
                                                                    "flex items-center justify-between w-full px-3 py-2 text-sm text-left rounded-lg transition-colors hover:bg-white/10",
                                                                    currentQuality === q ? "text-indigo-400 bg-white/5" : "text-zinc-300"
                                                                )}
                                                            >
                                                                <span>{qualityLabels[q] || q}</span>
                                                                {currentQuality === q && <Check size={14} />}
                                                            </button>
                                                        )) : (
                                                            <div className="px-3 py-2 text-xs text-zinc-500 text-center">Auto only</div>
                                                        )
                                                    ) : (
                                                        languageOptions.map((lang) => (
                                                            <button
                                                                key={lang.code}
                                                                onClick={() => handleLanguageChange(lang.code)}
                                                                className={cn(
                                                                    "flex items-center justify-between w-full px-3 py-2 text-sm text-left rounded-lg transition-colors hover:bg-white/10",
                                                                    captionLang === lang.code ? "text-indigo-400 bg-white/5" : "text-zinc-300"
                                                                )}
                                                            >
                                                                <span>{lang.label}</span>
                                                                {captionLang === lang.code && <Check size={14} />}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>


                                </div>

                                {/* Captions Toggle */}
                                <button
                                    onClick={toggleCaptions}
                                    className={cn(
                                        "text-white hover:text-indigo-400 transition-colors focus:outline-none relative",
                                        captionsEnabled && "text-indigo-400"
                                    )}
                                    title="Toggle Captions"
                                >
                                    {/* Inline CC Icon to ensure visibility */}
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
                                        <path d="M6 15h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H6"></path>
                                        <path d="M14 15h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2"></path>
                                    </svg>
                                    {captionsEnabled && (
                                        <motion.div
                                            layoutId="caption-dot"
                                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400"
                                        />
                                    )}
                                </button>

                                <button onClick={toggleFullscreen} className="text-white hover:text-indigo-400 transition-colors focus:outline-none">
                                    {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SecureVideoPlayer;
