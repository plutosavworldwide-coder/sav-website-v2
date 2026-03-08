import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, MoreHorizontal, Activity, ArrowUpRight, ArrowDownRight, Globe, Layers } from 'lucide-react';
import { cn } from "@/lib/utils";

const marketData = [
    { symbol: "EURUSD", price: "1.0924", change: "+0.15%", volume: "124K", trend: "up" },
    { symbol: "GBPUSD", price: "1.2750", change: "-0.08%", volume: "98K", trend: "down" },
    { symbol: "USDJPY", price: "145.32", change: "+0.45%", volume: "156K", trend: "up" },
    { symbol: "XAUUSD", price: "2045.10", change: "+1.20%", volume: "85K", trend: "up" },
    { symbol: "BTCUSD", price: "45,230", change: "-1.50%", volume: "2.1M", trend: "down" },
    { symbol: "SPX500", price: "4,780.5", change: "+0.32%", volume: "1.2B", trend: "up" },
    { symbol: "NAS100", price: "16,850", change: "+0.65%", volume: "950M", trend: "up" },
    { symbol: "US30", price: "37,650", change: "-0.12%", volume: "890M", trend: "down" },
];

const Markets = () => {
    return (
        <div className="flex flex-col h-full bg-black text-white font-sans overflow-y-auto custom-scrollbar selection:bg-white/20">
            <div className="p-6 md:p-10 w-full max-w-7xl mx-auto space-y-10">

                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                                Live Feed Active
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tighter leading-none">Global Markets.</h1>
                        <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-lg">
                            Institutional liquidity data and macro trends, distilled for precision tracking.
                        </p>
                    </div>
                    
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#101010] hover:bg-[#151515] border border-white/5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-xl shrink-0">
                        <Globe className="w-4 h-4" /> Filter Region
                    </button>
                </header>

                {/* Top Movers/Highlight Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { name: 'Forex Majors', change: '+2.4%', icon: Globe },
                        { name: 'Crypto Assets', change: '-1.2%', icon: Layers },
                        { name: 'Global Indices', change: '+0.8%', icon: Activity }
                    ].map((sector, i) => {
                        const isPositive = sector.change.startsWith('+');
                        return (
                            <motion.div
                                key={sector.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="relative group p-8 rounded-[2.5rem] bg-[#101010] border border-white/[0.05] hover:bg-[#121212] transition-colors overflow-hidden flex flex-col justify-between min-h-[220px]"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none mix-blend-luminosity">
                                    <sector.icon className="w-32 h-32 text-white opacity-10 -rotate-12 translate-x-4 -translate-y-4" />
                                </div>

                                <div className="relative z-10 flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/[0.03] border border-white/5 flex items-center justify-center shadow-inner group-hover:bg-white/5 transition-colors">
                                        <sector.icon className="w-8 h-8 text-white relative z-10" />
                                    </div>
                                    <span className={cn(
                                        "text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm",
                                        isPositive 
                                            ? "text-green-400 bg-green-400/10 border-green-400/20" 
                                            : "text-red-400 bg-red-400/10 border-red-400/20"
                                    )}>
                                        {sector.change}
                                    </span>
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-semibold tracking-tight text-white mb-1">{sector.name}</h3>
                                    <p className="text-sm text-zinc-500 font-medium">High volume trading session</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Market Data Record Table Area */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-[#101010] border border-white/[0.05] rounded-[2.5rem] overflow-hidden shadow-2xl"
                >
                    <div className="grid grid-cols-5 px-8 pt-8 pb-4 border-b border-white/[0.05]">
                        <div className="col-span-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ticker</div>
                        <div className="col-span-1 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Base Price</div>
                        <div className="col-span-1 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest">24h Change</div>
                        <div className="col-span-1 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Volume</div>
                        <div className="col-span-1 text-right text-[10px] items-end justify-end flex">
                             <MoreHorizontal size={14} className="text-zinc-600"/>
                        </div>
                    </div>

                    <div className="divide-y divide-white/[0.02]">
                        {marketData.map((item, i) => {
                            const isUp = item.trend === 'up';
                            return (
                                <div
                                    key={item.symbol}
                                    className="grid grid-cols-5 px-8 py-6 items-center hover:bg-[#121212] transition-colors cursor-pointer group"
                                >
                                    <div className="col-span-1 font-semibold text-white tracking-tight text-lg flex items-center gap-4">
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full mt-0.5",
                                            isUp ? "bg-green-500" : "bg-red-500"
                                        )} />
                                        {item.symbol}
                                    </div>

                                    <div className="col-span-1 text-right font-mono font-medium text-zinc-300 text-base">{item.price}</div>
                                    
                                    <div className={cn(
                                        "col-span-1 text-right font-semibold text-sm flex items-center justify-end gap-1.5",
                                        isUp ? "text-green-500" : "text-red-500"
                                    )}>
                                        {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                        {item.change}
                                    </div>
                                    
                                    <div className="col-span-1 text-right text-zinc-500 font-mono text-sm font-medium">{item.volume}</div>
                                    
                                    <div className="col-span-1 flex justify-end">
                                        <button className="h-10 w-10 flex items-center justify-center rounded-full bg-white/[0.02] border border-white/[0.02] group-hover:bg-white text-black transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                                            <ArrowUpRight size={16} strokeWidth={2.5} className="text-zinc-500 group-hover:text-black transition-colors"/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default Markets;
