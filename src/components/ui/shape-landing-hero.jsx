import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

function HeroGeometric({
    badge = "Sav Fx",
    title1 = "Time. Price.",
    title2 = "Energy.",
}) {
    const fadeUpVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 1.2,
                delay: 0.2 + i * 0.15,
                ease: [0.16, 1, 0.3, 1], // Apple-like custom easing
            },
        }),
    };

    return (
        <div className="relative min-h-[100svh] w-full flex items-center justify-center overflow-hidden bg-black selection:bg-white/20">
            {/* Ambient Apple-style background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] opacity-40 mix-blend-screen pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 via-purple-500/30 to-blue-500/30 blur-[100px] rounded-full animate-slow-spin" style={{ animationDuration: '20s' }} />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6">
                <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
                    
                    <motion.div
                        custom={0}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-10 overflow-hidden relative group cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <span className="text-sm font-medium text-white/90 tracking-wide uppercase relative z-10">
                            {badge}
                        </span>
                    </motion.div>

                    <motion.div
                        custom={1}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h1 className="text-6xl sm:text-8xl md:text-[10rem] leading-[0.9] font-semibold tracking-tighter mb-8 max-w-5xl mx-auto">
                            <span className="text-white block">{title1}</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white/60 to-white/20 block">{title2}</span>
                        </h1>
                    </motion.div>

                    <motion.div
                        custom={2}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <p className="text-xl md:text-3xl text-zinc-400 mb-12 max-w-2xl mx-auto font-medium tracking-tight leading-snug">
                            Elevate your trading journey with precision tools and institutional insights.
                        </p>
                    </motion.div>

                    <motion.div
                        custom={3}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Link
                            to="/signing"
                            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95"
                        >
                            <span className="relative z-10">Get Started</span>
                            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-r from-white via-zinc-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Bottom fade out to black */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </div>
    );
}

export { HeroGeometric };
