import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, DollarSign, CandlestickChart, ShieldCheck, Lock, ChevronLeft } from 'lucide-react';

import { supabase } from '../lib/supabase';

const Signing = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if user is already logged in
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                if (location.state?.plan) {
                    navigate('/payment', { state: { plan: location.state.plan } });
                } else {
                    navigate('/dashboard');
                }
            }
        };
        checkSession();
    }, [navigate, location.state]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white/20">
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10 w-full max-w-7xl mx-auto">
                <div className="w-full flex flex-col md:flex-row items-center gap-12 lg:gap-24">
                    
                    {/* Left Side */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-[#101010] border border-white/5 rounded-full px-4 py-2 inline-flex items-center gap-2 w-fit mb-8 shadow-xl mx-auto lg:mx-0"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[11px] font-bold tracking-widest uppercase text-white">Live Global Markets</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                            className="text-5xl md:text-7xl font-semibold mb-6 leading-tight tracking-tighter"
                        >
                            Precision where <br className="hidden md:block"/>
                            <span className="text-zinc-500">it matters most.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="text-lg text-zinc-500 font-medium max-w-lg mx-auto lg:mx-0"
                        >
                            Join an elite network of traders using institutional-grade infrastructure. Execute with confidence, analyze with depth, and scale without limits.
                        </motion.p>
                        
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-12 text-[10px] text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-2 justify-center lg:justify-start"
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Secure Connection • ID: 885-221-FX
                        </motion.div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="w-full lg:w-1/2 relative flex items-center justify-center">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="w-full max-w-md p-8 md:p-12 bg-[#101010] rounded-[2.5rem] border border-white/[0.05] shadow-2xl relative z-10"
                        >
                            <motion.div variants={itemVariants} className="mb-12 text-center lg:text-left flex flex-col items-center lg:items-start">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl text-black select-none">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-semibold mb-2 text-white tracking-tight">Welcome Back.</h2>
                                <p className="text-zinc-500 font-medium text-sm">
                                    Enter the platform securely.
                                </p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-4 mb-8">
                                <button
                                    onClick={async () => {
                                        console.log("Attempting Google Sign-In...");
                                        try {
                                            const { error } = await supabase.auth.signInWithOAuth({
                                                provider: 'google',
                                                options: {
                                                    redirectTo: `${window.location.origin}/dashboard`,
                                                    queryParams: {
                                                        access_type: 'offline',
                                                        prompt: 'consent',
                                                    },
                                                }
                                            });
                                            if (error) {
                                                console.error("Supabase Auth Error:", error);
                                                alert("Login failed: " + error.message);
                                                throw error;
                                            }
                                        } catch (error) {
                                            console.error('Unexpected error logging in:', error);
                                            alert("Unexpected error: " + error.message);
                                        }
                                    }}
                                    className="w-full h-14 flex items-center justify-center gap-3 px-6 bg-white rounded-full font-semibold text-sm text-black hover:scale-105 active:scale-95 transition-all shadow-xl group"
                                >
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                                    <span>Continue with Google</span>
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>

                            <motion.div variants={itemVariants} className="mt-10 text-center border-t border-white/[0.05] pt-6">
                                <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                                    By continuing, you agree to our <br />
                                    <a href="#" className="underline text-zinc-500 hover:text-white transition-colors">Terms of Service</a> and <a href="#" className="underline text-zinc-500 hover:text-white transition-colors">Privacy Protocol</a>.
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signing;
