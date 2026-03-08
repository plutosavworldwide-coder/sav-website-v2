import { motion } from 'framer-motion';
import { Check, ArrowRight, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

const indicatorsPlans = [
    {
        name: "Indicators Only",
        price: "10",
        period: "/month",
        category: "indicators",
        description: "Essential market data and proprietary algorithms.",
        features: ["Access to Quarterly & SSC Indicator Tool", "Access to SMT Range based Indicator", "Access to Time based PDA finder (Manual Edition)"],
        delay: 0.1,
        highlight: false
    }
];

const mentorshipPlans = [
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

const PlanCard = ({ plan, index, navigate }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => navigate('/signing')}
        className={cn(
            "relative flex flex-col p-8 md:p-10 rounded-[2.5rem] cursor-pointer transition-all duration-500 group h-full",
            plan.popular
                ? "bg-white text-black shadow-2xl hover:-translate-y-2 border border-transparent"
                : "bg-[#101010] text-white border border-white/[0.05] hover:bg-[#151515] hover:border-white/20 hover:-translate-y-2"
        )}
    >
        {plan.popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl border border-white/10 whitespace-nowrap z-10">
                Most Popular
            </div>
        )}

        <div className="mb-8 relative z-0">
            <h3 className={cn(
                "text-2xl font-semibold tracking-tight mb-3",
                plan.popular ? "text-black" : "text-white"
            )}>
                {plan.name}
            </h3>
            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-semibold tracking-tighter">€{plan.price}</span>
                <span className={cn(
                    "text-sm font-semibold tracking-tight",
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

        <div className="flex-1 space-y-4 mb-10">
            {plan.features.slice(0, 5).map((feature, i) => (
                <div key={i} className={cn(
                    "flex items-start gap-4 text-sm font-medium",
                    plan.popular ? "text-zinc-800" : "text-zinc-300"
                )}>
                    <div className="mt-0.5 shrink-0">
                        <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center",
                            plan.popular ? "bg-black" : "bg-white/10"
                        )}>
                            <Check className={cn(
                                "w-3 h-3",
                                plan.popular ? "text-white" : "text-white"
                            )} strokeWidth={3} />
                        </div>
                    </div>
                    <span className="leading-snug">{feature}</span>
                </div>
            ))}
            {plan.features.length > 5 && (
                <div className={cn(
                    "text-xs font-bold uppercase tracking-widest pt-2",
                    plan.popular ? "text-zinc-500" : "text-zinc-600"
                )}>
                    + {plan.features.length - 5} MORE FEATURES
                </div>
            )}
        </div>

        <div className={cn(
            "w-full py-4 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 mt-auto",
            plan.popular
                ? "bg-black text-white group-hover:scale-105 active:scale-95"
                : "bg-white text-black group-hover:scale-105 active:scale-95 shadow-xl"
        )}>
            Get Started <ArrowRight className="w-4 h-4" />
        </div>
    </motion.div>
);

const Pricing = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-black text-white min-h-screen font-sans selection:bg-white/20 relative overflow-hidden flex flex-col">
            
            {/* Header / Nav */}
            <div className="w-full max-w-7xl mx-auto px-6 py-6 md:px-12 md:py-8 flex justify-between items-center z-20 relative">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors w-fit font-medium text-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                </button>
            </div>

            <section className="flex-1 flex flex-col py-10 px-6 md:px-12 relative z-10 w-full max-w-7xl mx-auto">
                
                <div className="w-full flex flex-col items-center text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl md:text-7xl font-semibold tracking-tighter text-white mb-6 leading-tight"
                    >
                        Transparent pricing. <br className="hidden md:block" /> Unmatched edge.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-lg text-zinc-500 font-medium max-w-xl"
                    >
                        From data feeds to direct mentorship. Choose the tools you need to conquer the markets.
                    </motion.p>
                    
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 text-[11px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2 bg-[#101010] border border-white/5 px-4 py-2 rounded-full"
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Secure Connection • ID: 885-221-FX
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start relative pb-24">

                    {/* Left Column - Indicators */}
                    <div className="lg:col-span-4 flex flex-col h-full">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="mb-8"
                        >
                            <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">Technical Tools.</h2>
                            <p className="text-zinc-500 text-sm font-medium">Pure data. Proprietary algorithms. Precision.</p>
                        </motion.div>

                        <div className="grid gap-6 h-full border-t border-white/[0.05] pt-8">
                            {indicatorsPlans.map((plan, i) => (
                                <PlanCard key={plan.name} plan={plan} index={i} navigate={navigate} />
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Mentorship */}
                    <div className="lg:col-span-8 flex flex-col h-full lg:border-l lg:border-white/[0.05] lg:pl-16">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="mb-8"
                        >
                            <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">Mentorship Program.</h2>
                            <p className="text-zinc-500 text-sm font-medium">Full guidance. Community access. Daily live sessions.</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full border-t border-white/[0.05] pt-8">
                            {mentorshipPlans.map((plan, i) => (
                                <PlanCard key={plan.name} plan={plan} index={i} navigate={navigate} />
                            ))}
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default Pricing;
