import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

const plans = [
    {
        name: "Indicators Only",
        price: "10",
        period: "/month",
        category: "indicators",
        description: "Essential market data and proprietary algorithms.",
        features: ["Access to Quarterly & SSC Indicator Tool", "Access to SMT Range based Indicator", "Access to Time based PDA finder (Manual Edition)"],
        delay: 0.1,
        highlight: false
    },
    {
        name: "Standard Access",
        category: "mentorship",
        price: "80",
        period: "/month",
        description: "Core mentorship and daily guidance.",
        features: ["30 days / 4 Week lecture folders", "Daily Bias / Routine Lecture", "Live Session Lectures", "Access to Telegram & Discord", "Access to Quarterly & SSC Indicator Tool", "Access to SMT Range based Indicator", "Access to Time based PDA finder (Manual Edition)"],
        delay: 0.2,
        highlight: false
    },
    {
        name: "Extended Access",
        category: "mentorship",
        price: "140",
        period: "/2 months",
        description: "Deep dive with extended access to mentorship.",
        features: ["60 days / 4 Week lecture folders", "Daily Bias / Routine Lecture", "Live Session Lectures", "Access to Telegram & Discord", "All Indicator Tools Included"],
        popular: true,
        delay: 0.3,
        highlight: true
    },
    {
        name: "Lifetime Edition",
        category: "mentorship",
        price: "800",
        period: "/lifetime",
        description: "Permanent, unrestricted access.",
        features: ["Lifetime Lectures", "Daily Bias / Routine Lecture", "Live Session Lectures", "Access to Telegram & Discord", "All Indicator Tools Included", "Access to Time based PDA (Smart Edition)", "Access to a 1 on 1 session"],
        delay: 0.5,
        highlight: false
    }
];

const ChoosePlan = () => {
    const navigate = useNavigate();
    const [isMentorship, setIsMentorship] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession());
            if (session?.user) {
                setUser(session.user);
            }
        };
        checkUser();
    }, []);

    const filteredPlans = plans.filter(plan => isMentorship ? plan.category === 'mentorship' : plan.category === 'indicators');

    return (
        <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white/20">
            {/* Header / Nav */}
            <div className="w-full max-w-7xl mx-auto px-6 py-6 md:px-12 md:py-8 flex justify-between items-center z-20 relative">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors w-fit font-semibold text-sm tracking-tight"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>
                
                {user && (
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#101010] border border-white/10 rounded-[1.25rem] shadow-sm">
                        <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">
                            {user.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-zinc-300">{user.email}</span>
                        <div className="h-3 w-[1px] bg-white/10"></div>
                        <button
                            onClick={async () => {
                                const { supabase } = await import('../lib/supabase');
                                await supabase.auth.signOut();
                                setUser(null);
                                navigate('/');
                            }}
                            className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-400 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:items-center py-10 px-6 md:px-12 relative z-10 w-full max-w-[1400px] mx-auto">
                <div className="w-full max-w-3xl flex flex-col items-center text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-white mb-6 leading-[1.1]"
                    >
                        Select your <br className="hidden md:block" /> level of access.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-lg md:text-xl text-zinc-500 font-medium max-w-2xl tracking-tight"
                    >
                        From data feeds to direct mentorship. Choose the tools you need to conquer the markets.
                    </motion.p>
                    
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2 bg-[#101010] border border-white/5 px-4 py-2 rounded-full"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        Secure Connection • ID: 885-221-FX
                    </motion.div>
                </div>

                <div className="w-full flex flex-col items-center gap-16 pb-24">
                    
                    {/* Toggle */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-[#101010] p-1.5 rounded-full border border-white/5 flex relative shadow-xl focus-within:ring-2 focus-within:ring-white/20"
                    >
                        <div
                            className={cn(
                                "absolute inset-y-1.5 rounded-full bg-white transition-all duration-500 ease-[0.16,1,0.3,1] shadow-md",
                                isMentorship ? "left-[50%] w-[calc(50%-6px)]" : "left-1.5 w-[calc(50%-6px)]"
                            )}
                        />
                        <button
                            onClick={() => setIsMentorship(false)}
                            className={cn(
                                "relative z-10 px-8 py-3.5 rounded-full text-sm font-semibold transition-colors duration-300 w-44",
                                !isMentorship ? "text-black" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            Indicators Only
                        </button>
                        <button
                            onClick={() => setIsMentorship(true)}
                            className={cn(
                                "relative z-10 px-8 py-3.5 rounded-full text-sm font-semibold transition-colors duration-300 w-44",
                                isMentorship ? "text-black" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            Mentorship
                        </button>
                    </motion.div>

                    {/* Plans Grid */}
                    <div className="flex flex-wrap justify-center gap-6 w-full max-w-6xl mx-auto">
                        <AnimatePresence mode="popLayout">
                            {filteredPlans.map((plan, i) => (
                                <motion.div
                                    key={plan.name}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                    onClick={async () => {
                                        const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession());
                                        if (session) {
                                            navigate('/payment', { state: { plan } });
                                        } else {
                                            navigate('/signing', { state: { plan } });
                                        }
                                    }}
                                    className={cn(
                                        "relative flex flex-col p-8 md:p-10 lg:p-12 rounded-[3.5rem] cursor-pointer transition-all duration-500 group flex-1 min-w-[320px] max-w-[400px]",
                                        plan.popular
                                            ? "bg-white text-black shadow-2xl hover:-translate-y-2 border border-transparent"
                                            : "bg-[#101010] text-white border border-white/[0.05] hover:bg-[#121212] hover:border-white/20 hover:-translate-y-2 shadow-lg"
                                    )}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-5 py-2 rounded-full uppercase tracking-widest shadow-xl border border-white/10 whitespace-nowrap">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="mb-10 lg:mb-12">
                                        <h3 className={cn(
                                            "text-2xl lg:text-3xl font-semibold tracking-tight mb-4",
                                            plan.popular ? "text-black" : "text-white"
                                        )}>
                                            {plan.name}
                                        </h3>
                                        <div className="flex items-baseline gap-1.5 mb-6">
                                            <span className="text-6xl lg:text-7xl font-semibold tracking-tighter">€{plan.price}</span>
                                            <span className={cn(
                                                "text-sm font-bold tracking-tight uppercase",
                                                plan.popular ? "text-zinc-500" : "text-zinc-500"
                                            )}>{plan.period}</span>
                                        </div>
                                        <p className={cn(
                                            "text-sm font-medium leading-relaxed",
                                            plan.popular ? "text-zinc-600" : "text-zinc-400"
                                        )}>
                                            {plan.description}
                                        </p>
                                    </div>

                                    <div className="flex-1 space-y-5 mb-12">
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className={cn(
                                                "flex items-start gap-4 text-sm font-semibold",
                                                plan.popular ? "text-zinc-800" : "text-zinc-300"
                                            )}>
                                                <div className="mt-0.5 shrink-0">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full flex items-center justify-center",
                                                        plan.popular ? "bg-black" : "bg-white/10"
                                                    )}>
                                                        <Check className={cn(
                                                            "w-3.5 h-3.5",
                                                            plan.popular ? "text-white" : "text-white"
                                                        )} strokeWidth={3} />
                                                    </div>
                                                </div>
                                                <span className="leading-snug">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={cn(
                                        "w-full py-5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 mt-auto",
                                        plan.popular
                                            ? "bg-black text-white group-hover:scale-105 active:scale-95"
                                            : "bg-white text-black group-hover:scale-105 active:scale-95 shadow-xl"
                                    )}>
                                        Get Started <ArrowRight className="w-5 h-5" />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center text-sm font-medium text-zinc-500"
                    >
                        Need help choosing? <a href="#" className="text-white font-semibold hover:underline transition-all">Compare plans</a> or contact support.
                    </motion.p>
                </div>
            </div>
        </div>
    );
};

export default ChoosePlan;
