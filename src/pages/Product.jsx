import { motion } from 'framer-motion';
import { HeroGeometric } from '../components/ui/shape-landing-hero';
import { Check, Cpu, Zap, Activity, Shield, TrendingUp, BarChart2 } from 'lucide-react';
import { cn } from "@/lib/utils";

const Product = () => {
    const features = [
        { title: "Real-time Market Data", desc: "Tick-level precision feeds.", icon: Activity },
        { title: "Proprietary Algorithms", desc: "Math-backed execution logic.", icon: Cpu },
        { title: "Order Flow Analysis", desc: "See where institutions position.", icon: BarChart2 },
        { title: "Risk Management", desc: "Hard-coded capital protection.", icon: Shield },
        { title: "Daily Market Bias", desc: "Clear directional intent daily.", icon: TrendingUp },
        { title: "Live Sessions", desc: "Watch execution in real-time.", icon: Zap }
    ];

    return (
        <div className="bg-black text-white min-h-screen font-sans selection:bg-white/20">
            <HeroGeometric
                badge="The Platform."
                title1="Engineered"
                title2="For Edge."
            />

            <section className="py-24 px-6 relative z-10 max-w-7xl mx-auto">
                <div className="flex flex-col gap-24">
                    
                    {/* Header Section */}
                    <div className="text-center max-w-3xl mx-auto">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="text-4xl md:text-5xl font-semibold tracking-tighter mb-6 text-white"
                        >
                            Built for Performance.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="text-lg text-zinc-400 font-medium leading-relaxed"
                        >
                            Our platform isn't just a dashboard; it's a command center. We've integrated everything you need to analyze, execute, and review your trades in one seamless, distraction-free environment.
                        </motion.p>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="bg-[#101010] border border-white/[0.05] p-8 rounded-[2.5rem] group hover:bg-[#121212] transition-colors flex flex-col items-center text-center"
                            >
                                <div className="w-16 h-16 rounded-[1.5rem] bg-white text-black flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500 ease-[0.16,1,0.3,1]">
                                    <feature.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-semibold text-white tracking-tight mb-2">{feature.title}</h3>
                                <p className="text-zinc-500 text-sm font-medium">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Big Visual Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full aspect-[21/9] bg-[#101010] border border-white/[0.05] rounded-[2.5rem] overflow-hidden group flex flex-col items-center justify-center"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                        
                        {/* Abstract Interface Representation */}
                        <div className="w-full h-full relative p-12 flex items-center justify-center opacity-40 mix-blend-luminosity grayscale group-hover:scale-[1.02] transition-transform duration-1000">
                             <div className="w-full h-full max-w-4xl border border-white/10 rounded-2xl bg-black/50 backdrop-blur-sm p-6 flex flex-col gap-6">
                                {/* Top Bar */}
                                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <div className="w-32 h-4 bg-white/10 rounded-full" />
                                    <div className="flex gap-4">
                                        <div className="w-16 h-4 bg-white/10 rounded-full" />
                                        <div className="w-16 h-4 bg-white/10 rounded-full" />
                                    </div>
                                </div>
                                {/* Main Layout */}
                                <div className="flex gap-6 h-full">
                                    {/* Sidebar */}
                                    <div className="w-1/4 flex flex-col gap-4 border-r border-white/5 pr-6">
                                        {[1,2,3,4,5].map(i => <div key={i} className="w-full h-6 bg-white/5 rounded-md" />)}
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 flex flex-col gap-6">
                                        {/* Chart Area */}
                                        <div className="h-2/3 w-full bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
                                           <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-white/10 to-transparent" />
                                        </div>
                                        {/* Bottom Data */}
                                        <div className="flex gap-4 h-1/3">
                                            <div className="flex-1 bg-white/5 rounded-xl border border-white/5" />
                                            <div className="flex-1 bg-white/5 rounded-xl border border-white/5" />
                                            <div className="flex-1 bg-white/5 rounded-xl border border-white/5" />
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>

                        <div className="absolute z-20 flex flex-col items-center text-center">
                            <span className="px-4 py-2 border border-white/10 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 inline-block">System Architecture</span>
                            <h3 className="text-3xl md:text-5xl font-semibold tracking-tighter text-white drop-shadow-2xl">The Dashboard</h3>
                        </div>
                    </motion.div>

                </div>
            </section>
        </div>
    );
};

export default Product;
