import { motion } from 'framer-motion';
import { Bell, BellOff, Plus, ChevronRight, ChevronLeft, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

const Alerts = () => {
    const navigate = useNavigate();

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
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-white">
                                    Price Alerts.
                                </h1>
                                <p className="text-zinc-500 text-lg font-medium tracking-tight mt-1">
                                    Never miss a critical precise level.
                                </p>
                            </div>
                            <button className="px-6 py-3 bg-white hover:bg-zinc-200 text-black rounded-full text-sm font-semibold active:scale-95 transition-all flex items-center gap-2 shadow-xl hidden md:flex">
                                <Plus className="w-4 h-4 text-black" /> Create Alert
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Active Alerts */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-3 px-2">
                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                    Active Alerts
                                </h3>
                            </div>
                            
                            <div className="flex flex-col gap-5">
                                {[1, 2, 3].map((i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        className="bg-[#101010] p-6 lg:p-8 rounded-[2.5rem] border border-white/[0.05] hover:border-white/20 hover:bg-[#121212] transition-all duration-300 group cursor-pointer shadow-lg"
                                    >
                                        <div className="flex justify-between items-start mb-6 lg:mb-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-[1.25rem] bg-black border border-white/5 flex items-center justify-center text-zinc-300 font-bold text-sm shrink-0 transition-transform group-hover:scale-105 group-hover:text-white group-hover:border-white/20">
                                                    BTC
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <h4 className="font-semibold text-xl text-white tracking-tight leading-none">Bitcoin</h4>
                                                    <p className="text-sm text-zinc-500 font-medium flex items-center flex-wrap gap-2">
                                                        <span>Crosses Above</span>
                                                        <span className="text-white font-mono bg-white/10 border border-white/5 px-2.5 py-1 rounded-md tracking-wider text-xs">$48,000</span>
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Pulse Indicator */}
                                            <div className="relative flex h-3 w-3 mt-2">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-30"></span>
                                              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center pt-5 border-t border-white/[0.02]">
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Created 2h ago</span>
                                            <div className="w-10 h-10 rounded-full border border-white/5 bg-black flex items-center justify-center group-hover:bg-white transition-colors duration-300">
                                                <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-black transition-colors" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Triggered History */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-3 px-2">
                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                    <BellOff className="w-5 h-5 text-zinc-500" />
                                </div>
                                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                    History
                                </h3>
                            </div>

                            <div className="flex flex-col gap-4 opacity-70 hover:opacity-100 transition-opacity duration-500">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-[#101010] p-6 rounded-[2.5rem] border border-white/[0.05] flex justify-between items-center group hover:bg-[#121212] transition-colors duration-300">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-[1rem] bg-black border border-white/5 flex items-center justify-center text-zinc-500 font-bold text-xs shrink-0 group-hover:text-zinc-300 group-hover:border-white/10 transition-colors">
                                                XAU
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <h4 className="font-semibold text-white tracking-tight text-lg">Gold</h4>
                                                <p className="text-sm text-zinc-500 font-medium flex items-center gap-2">
                                                    Touched <span className="text-zinc-400 font-mono tracking-wide">2030.50</span>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <span className="text-[10px] font-bold tracking-widest uppercase bg-white/5 border border-white/5 px-3.5 py-1.5 rounded-full text-zinc-500 group-hover:text-zinc-400 transition-colors">
                                            Triggered
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Alerts;
