import { motion } from 'framer-motion';
import { Plus, List, GripVertical, Star, ChevronLeft, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

const Watchlists = () => {
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
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex flex-col gap-1">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 text-zinc-500 hover:text-white mb-4 transition-colors w-fit font-semibold text-sm tracking-tight"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Back to Dashboard</span>
                            </button>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-white">
                                Watchlists.
                            </h1>
                            <p className="text-zinc-500 text-lg font-medium tracking-tight">
                                Manage your curated assets.
                            </p>
                        </div>
                        <button className="px-6 py-3 bg-white hover:bg-zinc-200 text-black rounded-full text-sm font-semibold transition-all active:scale-95 flex items-center gap-2 shadow-xl hidden md:flex">
                            <Plus className="w-4 h-4 text-black" /> New List
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar List Select */}
                        <div className="w-full lg:w-72 shrink-0 space-y-4">
                            <div className="bg-[#101010] p-6 rounded-[2.5rem] border border-white/[0.05] shadow-2xl">
                                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 px-2">My Lists</h3>
                                <nav className="space-y-2">
                                    {['Favorites', 'Forex Majors', 'Crypto High Cap', 'Indices'].map((list, i) => (
                                        <div key={list} className={cn(
                                            "flex items-center justify-between px-4 py-3 rounded-[1.5rem] cursor-pointer transition-all duration-300",
                                            i === 0 ? 'bg-white text-black font-semibold shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5 font-medium'
                                        )}>
                                            <div className="flex items-center gap-3">
                                                <List className={cn("w-4 h-4", i === 0 ? "text-black" : "text-zinc-500")} />
                                                <span className="text-sm tracking-tight">{list}</span>
                                            </div>
                                            <span className={cn(
                                                "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest",
                                                i === 0 ? "bg-black/10 text-black/60" : "bg-white/5 text-zinc-500"
                                            )}>
                                                {8 - i}
                                            </span>
                                        </div>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            <div className="bg-[#101010] rounded-[2.5rem] border border-white/[0.05] p-2 overflow-hidden shadow-2xl">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center p-4 md:p-6 hover:bg-[#151515] rounded-[2rem] group transition-all duration-300 cursor-grab active:cursor-grabbing border-b border-white/[0.02] last:border-0 relative">
                                        
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 rounded-r-none rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                        
                                        <GripVertical className="w-5 h-5 text-zinc-600 mr-2 md:mr-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                        
                                        <div className="w-12 h-12 rounded-[1.25rem] bg-black border border-white/5 flex items-center justify-center font-bold text-xs mr-4 md:mr-6 text-zinc-300 shrink-0 group-hover:text-white group-hover:border-white/20 transition-all duration-300">
                                            {i === 1 ? 'EU' : i === 2 ? 'GU' : i === 3 ? 'GJ' : i === 4 ? 'AU' : 'UC'}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-lg font-semibold text-white tracking-tight leading-tight">
                                                {i === 1 ? 'EURUSD' : i === 2 ? 'GBPUSD' : i === 3 ? 'GBPJPY' : i === 4 ? 'AUDUSD' : 'USDCAD'}
                                            </h4>
                                            <span className="text-sm text-zinc-500 font-medium">
                                                {i === 1 ? 'Euro / US Dollar' : i === 2 ? 'British Pound / US Dollar' : i === 3 ? 'British Pound / Japanese Yen' : i === 4 ? 'Australian Dollar / US Dollar' : 'US Dollar / Canadian Dollar'}
                                            </span>
                                        </div>
                                        
                                        <div className="text-right mr-4 md:mr-10 flex flex-col items-end">
                                            <div className="font-semibold text-white tracking-tight text-lg mb-0.5">
                                                {i === 1 ? '1.0924' : i === 2 ? '1.2650' : i === 3 ? '190.45' : i === 4 ? '0.6580' : '1.3450'}
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md tracking-widest uppercase flex items-center gap-1">
                                                <TrendingUp size={10} /> +{0.15 * i}%
                                            </span>
                                        </div>
                                        
                                        <button className="w-10 h-10 rounded-full flex items-center justify-center border border-white/5 bg-black text-zinc-600 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-300 shrink-0">
                                            <Star className="w-4 h-4 fill-current" />
                                        </button>
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

export default Watchlists;
