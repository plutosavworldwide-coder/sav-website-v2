import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeroGeometric } from '../components/ui/shape-landing-hero';
import { TrendingUp, Shield, Activity, BarChart, Target, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Landing = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check active session on mount
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate('/dashboard');
            }
        };

        checkSession();

        // Listen for auth changes (e.g. redirect fallback)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                navigate('/dashboard');
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    return (
        <div className="bg-black text-white min-h-screen font-sans selection:bg-white/20">
            {/* Hero Section */}
            <HeroGeometric
                badge="Sav Fx Platform"
                title1="Time. Price."
                title2="Energy."
            />

            {/* Apple-style Bento Feature Grid */}
            <section className="py-24 px-6 relative z-10 bg-black">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-4xl md:text-6xl font-semibold tracking-tighter text-white/90 mb-4"
                        >
                            Engineered for precision.
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                            className="text-xl text-zinc-400 font-medium md:max-w-2xl mx-auto"
                        >
                            Professional-grade tools built on proprietary analysis logic.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                        {/* Large Wide Card - Market Edge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="col-span-1 md:col-span-4 p-8 md:p-12 rounded-[2.5rem] bg-[#101010] border border-white/[0.05] relative overflow-hidden group hover:border-white/10 transition-colors"
                        >
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-indigo-500/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <TrendingUp className="w-12 h-12 text-indigo-400 mb-8" />
                            <h3 className="text-3xl font-semibold tracking-tight text-white mb-4">Market Edge.</h3>
                            <p className="text-lg text-zinc-400 leading-relaxed max-w-md">
                                Institutional-grade technical analysis and execution strategies that dissect price action with flawless accuracy.
                            </p>
                            <div className="mt-12 w-full h-48 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden relative">
                                <BarChart className="w-40 h-40 text-white/[0.02] absolute -right-4 -bottom-4" />
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#101010] to-transparent z-10" />
                                <div className="flex gap-2 items-end h-24 px-8 opacity-40">
                                    {[20, 40, 30, 60, 50, 80, 70, 90, 85].map((h, i) => (
                                        <div key={i} className="w-8 bg-indigo-500 rounded-t-sm" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Square Card - Psychology */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="col-span-1 md:col-span-2 p-8 md:p-10 rounded-[2.5rem] bg-[#101010] border border-white/[0.05] relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col justify-between"
                        >
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-rose-500/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div>
                                <Activity className="w-10 h-10 text-rose-400 mb-8" />
                                <h3 className="text-2xl font-semibold tracking-tight text-white mb-3">Psychology.</h3>
                                <p className="text-base text-zinc-400 leading-relaxed">
                                    Master the mental game with our proprietary mindset framework. Emotionless execution, by design.
                                </p>
                            </div>
                            <div className="mt-12 flex justify-end">
                                <Target className="w-24 h-24 text-white/[0.03] group-hover:text-white/[0.05] transition-colors" />
                            </div>
                        </motion.div>

                        {/* Square Card - Performance */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="col-span-1 md:col-span-2 p-8 md:p-10 rounded-[2.5rem] bg-[#101010] border border-white/[0.05] relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col justify-between"
                        >
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-emerald-500/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div>
                                <Zap className="w-10 h-10 text-emerald-400 mb-8" />
                                <h3 className="text-2xl font-semibold tracking-tight text-white mb-3">Real-time.</h3>
                                <p className="text-base text-zinc-400 leading-relaxed">
                                    Instant market updates, alerts, and live trading sessions delivered directly to your dashboard.
                                </p>
                            </div>
                            <div className="mt-12 flex justify-start">
                                <Zap className="w-24 h-24 text-white/[0.03] group-hover:text-white/[0.05] transition-colors" />
                            </div>
                        </motion.div>

                        {/* Large Wide Card - Risk Control */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="col-span-1 md:col-span-4 p-8 md:p-12 rounded-[2.5rem] bg-[#101010] border border-white/[0.05] relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col md:flex-row gap-8 items-center"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="flex-1">
                                <Shield className="w-12 h-12 text-blue-400 mb-8" />
                                <h3 className="text-3xl font-semibold tracking-tight text-white mb-4">Risk Control.</h3>
                                <p className="text-lg text-zinc-400 leading-relaxed max-w-sm">
                                    Advanced risk management protocols mathematically designed to protect capital while maximizing upside exposure.
                                </p>
                            </div>
                            <div className="flex-1 w-full h-full min-h-[200px] bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
                                <Shield className="w-32 h-32 text-blue-500/20" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Huge Text CTA Section */}
            <section className="py-40 px-6 text-center relative z-10 bg-black">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-5xl mx-auto flex flex-col items-center"
                >
                    <h2 className="text-5xl sm:text-7xl md:text-[8rem] font-semibold tracking-tighter leading-tight text-white mb-12">
                        Stop guessing. <br />
                        <span className="text-zinc-500">Start performing.</span>
                    </h2>
                    
                    <Link
                        to="/signing"
                        className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold text-xl rounded-full hover:scale-105 active:scale-95 transition-all w-fit"
                    >
                        Access Dashboard
                    </Link>
                </motion.div>
            </section>
            
            {/* Minimal Footer */}
            <footer className="py-12 border-t border-white/10 text-center">
                <p className="text-zinc-500 text-sm font-medium tracking-tight">© 2026 Sav Fx. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Landing;
