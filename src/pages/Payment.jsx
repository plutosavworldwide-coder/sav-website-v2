import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, DollarSign, TrendingUp, Activity, Lock, ChevronLeft } from 'lucide-react';

import { supabase } from '../lib/supabase';
import { PAYPAL_CONFIG, PAYPAL_PLANS } from '../lib/config';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState(null);

    // Default to Standard Plan if accessed directly
    const selectedPlan = location.state?.plan || {
        name: "Standard Access",
        price: "80",
        period: "/month",
        features: ["Standard Access"]
    };

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

    const [user, setUser] = useState(null);

    // Check Auth & Fetch User
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Not logged in? Go to sign in, then come back here
                navigate('/signing', { state: { plan: selectedPlan } });
                return;
            }
            setUser(user);
        };
        checkUser();
    }, [navigate, selectedPlan]);

    const TAX_RATE = 0.08; // 8% Tax/Fee
    const basePrice = parseFloat(selectedPlan.price.replace(/,/g, ''));
    const taxAmount = basePrice * TAX_RATE;
    const totalAmount = basePrice + taxAmount;

    // Determine PayPal Options based on Plan Type
    const isLifetime = selectedPlan.name === "Lifetime Edition" || selectedPlan.name === "Lifetime Plan";
    const paypalOptions = {
        "client-id": PAYPAL_CONFIG.clientId,
        currency: PAYPAL_CONFIG.currency,
        intent: isLifetime ? "capture" : "subscription",
        vault: !isLifetime // Vault required for subscriptions
    };

    return (
        <PayPalScriptProvider options={paypalOptions} key={paypalOptions.intent}>
            <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white/20">
                {/* Header / Nav */}
                <div className="w-full max-w-7xl mx-auto px-6 py-6 md:px-12 md:py-8 flex justify-between items-center z-20 relative">
                    <button
                        onClick={() => navigate('/choose-plan')}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors w-fit font-medium text-sm"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back to Plans</span>
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 md:p-12 relative z-10 w-full max-w-7xl mx-auto gap-12 lg:gap-24">
                    
                    {/* Left Side - Details */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-[#101010] border border-white/5 rounded-full px-4 py-2 inline-flex items-center gap-2 w-fit mb-8 shadow-xl"
                        >
                            <Lock className="w-3.5 h-3.5 text-white" />
                            <span className="text-[11px] font-bold tracking-widest uppercase text-white">Secure Encrypted Checkout</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                            className="text-5xl md:text-7xl font-semibold mb-8 leading-tight tracking-tighter"
                        >
                            Complete your <br />
                            <span className="text-zinc-500">transaction.</span>
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="flex items-start gap-6 p-8 rounded-[2rem] bg-[#101010] border border-white/[0.05] hover:border-white/10 hover:bg-[#121212] transition-colors"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center shrink-0 shadow-lg select-none">
                                <CheckCircle2 className="w-7 h-7" strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="text-white font-semibold text-2xl tracking-tight">{selectedPlan.name}</div>
                                <div className="text-base text-zinc-400 font-medium leading-relaxed">
                                    Instant access to all features included in the {selectedPlan.name} tier. Setup is immediate.
                                </div>
                            </div>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-12 text-[10px] text-zinc-600 font-bold uppercase tracking-widest"
                        >
                            ENCRYPTION: AES-256 • BANK-GRADE PROTOCOLS
                        </motion.div>
                    </div>

                    {/* Right Side - Payment Form */}
                    <div className="w-full lg:w-1/2 relative flex items-center justify-center">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="w-full max-w-lg p-8 md:p-12 bg-[#101010] rounded-[2.5rem] border border-white/[0.05] shadow-2xl relative z-10"
                        >
                            <motion.div variants={itemVariants} className="flex justify-between items-end mb-10 border-b border-white/[0.05] pb-8">
                                <div>
                                    <h2 className="text-3xl font-semibold text-white tracking-tight">Checkout.</h2>
                                    <p className="text-zinc-500 mt-1 font-medium text-sm">{selectedPlan.name}</p>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className="text-5xl font-semibold text-white tracking-tighter leading-none mb-1">€{basePrice.toFixed(2)}</div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">{selectedPlan.period.replace('/', '')}</div>
                                    <div className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest flex flex-col items-end gap-1 w-full pt-3 border-t border-white/[0.05]">
                                        <span className="flex justify-between w-32"><span>Base:</span> <span>€{basePrice.toFixed(2)}</span></span>
                                        <span className="flex justify-between w-32"><span>Tax (8%):</span> <span>€{taxAmount.toFixed(2)}</span></span>
                                        <span className="flex justify-between w-32 text-white pt-2 border-t border-white/10 mt-1 pb-1"><span>Total:</span> <span>€{totalAmount.toFixed(2)}</span></span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* User Profile Display */}
                            {user && (
                                <motion.div variants={itemVariants} className="mb-10 p-5 bg-[#0a0a0a] rounded-2xl flex items-center gap-5 border border-white/[0.02]">
                                    <div className="w-12 h-12 rounded-[1rem] bg-white text-black flex items-center justify-center text-lg font-bold shadow-lg">
                                        {user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden flex flex-col gap-0.5">
                                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Billed To</div>
                                        <div className="text-base font-semibold text-white truncate tracking-tight">{user.email}</div>
                                    </div>
                                </motion.div>
                            )}

                            <motion.div variants={itemVariants} className="space-y-6">
                                {error && (
                                    <div className="p-4 bg-red-500/10 text-red-500 font-semibold text-sm rounded-2xl border border-red-500/20 text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="relative z-10 w-full rounded-2xl overflow-hidden shadow-2xl">
                                    {selectedPlan.name === "Lifetime Edition" || selectedPlan.name === "Lifetime Plan" ? (
                                        <PayPalButtons
                                            style={{ shape: "rect", height: 55, layout: "vertical", color: "white" }}
                                            forceReRender={[totalAmount, user?.id]}
                                            createOrder={(data, actions) => {
                                                return actions.order.create({
                                                    purchase_units: [{
                                                        description: "Lifetime Mentorship Access",
                                                        custom_id: user?.id,
                                                        amount: {
                                                            value: totalAmount.toFixed(2),
                                                            currency_code: "EUR"
                                                        }
                                                    }]
                                                });
                                            }}
                                            onApprove={async (data, actions) => {
                                                const order = await actions.order.capture();
                                                console.log("Lifetime Payment Success:", order);
                                                try {
                                                    if (user) {
                                                        await supabase.from('profiles').upsert({
                                                            id: user.id,
                                                            paypal_subscription_id: data.orderID,
                                                            subscription_status: 'active'
                                                        });
                                                    }
                                                    navigate('/dashboard');
                                                } catch (err) {
                                                    console.error("Supabase Error:", err);
                                                    navigate('/dashboard');
                                                }
                                            }}
                                            onError={(err) => {
                                                console.error("PayPal Error:", err);
                                                setError("Payment failed. Please try again.");
                                            }}
                                        />
                                    ) : (
                                        <PayPalButtons
                                            style={{ shape: "rect", height: 55, layout: "vertical", color: "white" }}
                                            forceReRender={[selectedPlan.name, user?.id]}
                                            createSubscription={(data, actions) => {
                                                const planId = PAYPAL_PLANS[selectedPlan.name];
                                                if (!planId) {
                                                    setError("Invalid plan configuration.");
                                                    return Promise.reject(new Error("Invalid plan"));
                                                }
                                                return actions.subscription.create({
                                                    'plan_id': planId,
                                                    'custom_id': user?.id
                                                });
                                            }}
                                            onApprove={async (data, actions) => {
                                                try {
                                                    if (user) {
                                                        await supabase.from('profiles').upsert({
                                                            id: user.id,
                                                            paypal_subscription_id: data.subscriptionID,
                                                            subscription_status: 'active'
                                                        });
                                                    }
                                                    navigate('/dashboard');
                                                } catch (err) {
                                                    console.error("Supabase Error:", err);
                                                    navigate('/dashboard');
                                                }
                                            }}
                                            onError={(err) => {
                                                console.error("PayPal Error:", err);
                                                setError("Payment failed. Please try again.");
                                            }}
                                        />
                                    )}
                                </div>

                                <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center justify-center gap-3">
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 uppercase tracking-widest bg-white/5 border border-white/5 px-4 py-2 rounded-full">
                                        <ShieldCheck className="w-3.5 h-3.5 text-white" /> Payment secured by PayPal
                                    </div>
                                    <p className="text-center text-xs text-zinc-600 font-medium">
                                        You will be redirected securely to complete the payment.
                                    </p>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </PayPalScriptProvider>
    );
};

export default Payment;
