import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldOff, RefreshCw, LogOut, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SubscriptionExpired = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/signing');
    };

    return (
        <div className="flex flex-col min-h-screen bg-black text-white font-sans items-center justify-center relative overflow-hidden selection:bg-white/20 px-6">

            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex flex-col items-center text-center max-w-lg w-full"
            >
                {/* Icon Badge */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-8 w-20 h-20 rounded-[1.75rem] bg-[#111] border border-amber-500/20 flex items-center justify-center shadow-2xl shadow-amber-500/10"
                >
                    <ShieldOff className="w-9 h-9 text-amber-400" strokeWidth={1.5} />
                </motion.div>

                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="mb-3 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5"
                >
                    <span className="text-[11px] font-bold tracking-widest uppercase text-amber-400">Access Restricted</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.7, ease: 'easeOut' }}
                    className="text-5xl md:text-6xl font-semibold tracking-tighter leading-tight mb-5"
                >
                    Your access<br />
                    <span className="text-zinc-500">has expired.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.6 }}
                    className="text-base text-zinc-400 font-medium leading-relaxed max-w-sm mb-12"
                >
                    Your subscription has either expired or hasn't been processed yet. Renew below to instantly restore your access.
                </motion.p>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="w-full p-8 bg-[#0d0d0d] border border-white/[0.06] rounded-[2rem] mb-6 flex flex-col gap-5 shadow-2xl"
                >
                    <div className="flex items-center gap-4 p-5 bg-[#111] rounded-2xl border border-white/[0.04]">
                        <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0">
                            <RefreshCw className="w-5 h-5 text-black" strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                            <div className="text-white font-semibold text-base tracking-tight">Renew your subscription</div>
                            <div className="text-zinc-500 text-sm font-medium mt-0.5">Instant access restored on payment</div>
                        </div>
                    </div>

                    {/* Primary CTA */}
                    <button
                        onClick={() => navigate('/choose-plan')}
                        className="w-full flex items-center justify-center gap-2.5 bg-white text-black font-semibold text-sm px-6 py-4 rounded-xl hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 tracking-tight"
                    >
                        Renew Access
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                </motion.div>

                {/* Sign out link */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55, duration: 0.5 }}
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-zinc-600 hover:text-zinc-300 transition-colors text-sm font-medium"
                >
                    <LogOut className="w-4 h-4" />
                    Sign out
                </motion.button>

                {/* Footer note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.65, duration: 0.5 }}
                    className="mt-10 text-[11px] font-bold uppercase tracking-widest text-zinc-700"
                >
                    SAV FX · Secure Access Portal
                </motion.p>
            </motion.div>
        </div>
    );
};

export default SubscriptionExpired;
