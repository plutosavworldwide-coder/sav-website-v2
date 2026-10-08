import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Loader2, ShieldCheck } from 'lucide-react';

import { supabase } from '../lib/supabase';
import { PAYPAL_CONFIG, PAYPAL_PLANS } from '../lib/config';
import { resolvePurchasePlan } from '../lib/purchasePlans';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeProvider';

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { resolvedTheme } = useTheme();
    const [error, setError] = useState(null);

    // Reject retired/unknown choices and ignore prices carried in browser state.
    const selectedPlan = resolvePurchasePlan(location.state?.plan);

    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authAttempt, setAuthAttempt] = useState(0);

    // Check Auth & Fetch User
    useEffect(() => {
        if (!selectedPlan) return;
        let current = true;
        setAuthLoading(true);
        setUser(null);
        setError(null);
        const checkUser = async () => {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (!current) return;
                if (authError) throw authError;
                if (!user) {
                    navigate('/signing', { state: { plan: selectedPlan }, replace: true });
                    return;
                }
                setUser(user);
            } catch {
                if (current) setError('We could not verify your account. Please try again before continuing to payment.');
            } finally {
                if (current) setAuthLoading(false);
            }
        };
        checkUser();
        return () => { current = false; };
    }, [navigate, selectedPlan, authAttempt]);

    if (!selectedPlan) return <Navigate to="/choose-plan" replace state={{ planUnavailable: true }} />;
    if (authLoading || !user) return <div className={`dashboard-theme ${resolvedTheme} min-h-[calc(100dvh-80px)] flex items-center justify-center px-6`}><div className="dash-panel max-w-md p-6 text-center">{authLoading ? <><Loader2 size={22} className="mx-auto mb-4 animate-spin text-[var(--dash-subtle)]" /><p role="status" className="text-sm text-[var(--dash-muted)]">Verifying your account before checkout…</p></> : <><p role="alert" className="text-sm text-[var(--dash-error)]">{error || 'Sign in to continue to checkout.'}</p><button type="button" onClick={() => setAuthAttempt(value => value + 1)} className="dash-primary mt-5">Try again</button><Link to="/choose-plan" className="mt-4 block text-xs text-[var(--dash-muted)] hover:text-[var(--dash-text)]">Back to plans</Link></>}</div></div>;

    const TAX_RATE = 0.08; // 8% Tax/Fee
    const basePrice = parseFloat(selectedPlan.price.replace(/,/g, ''));
    const taxAmount = basePrice * TAX_RATE;
    const totalAmount = basePrice + taxAmount;

    // Determine PayPal Options based on Plan Type
    const isLifetime = selectedPlan.name === "Lifetime Edition";
    const paypalOptions = {
        "client-id": PAYPAL_CONFIG.clientId,
        currency: PAYPAL_CONFIG.currency,
        intent: isLifetime ? "capture" : "subscription",
        vault: !isLifetime // Vault required for subscriptions
    };

    return <PayPalScriptProvider options={paypalOptions} key={paypalOptions.intent}>
        <div className={`dashboard-theme ${resolvedTheme} min-h-[calc(100dvh-80px)] px-6 py-8 md:px-10 md:py-10`}>
            <div className="mx-auto w-full max-w-[1050px]">
                <button type="button" onClick={() => navigate('/choose-plan')} className="mb-7 inline-flex items-center gap-2 text-xs font-medium text-[var(--dash-muted)] transition-colors hover:text-[var(--dash-text)]"><ArrowLeft size={14} />Back to plans</button>
                <header className="mb-8"><p className="dash-eyebrow mb-2">Your membership</p><h1 className="text-[28px] font-semibold leading-tight tracking-[-0.035em] text-[var(--dash-text)] md:text-[32px]">Complete your checkout</h1><p className="mt-3 text-sm leading-relaxed text-[var(--dash-muted)]">Review your membership and continue with PayPal.</p></header>
                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
                    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="dash-panel overflow-hidden">
                        <div className="border-b border-[var(--dash-border)] p-6"><p className="dash-eyebrow mb-3">Selected plan</p><h2 className="text-xl font-semibold tracking-tight text-[var(--dash-text)]">{selectedPlan.name}</h2><div className="mt-4 flex items-baseline gap-1.5"><span className="text-[36px] font-semibold leading-none tracking-[-0.04em] text-[var(--dash-text)]">€{basePrice.toFixed(2)}</span><span className="text-xs text-[var(--dash-muted)]">{selectedPlan.period}</span></div><p className="mt-4 text-xs leading-relaxed text-[var(--dash-muted)]">{selectedPlan.description}</p></div>
                        <div className="p-6"><h3 className="mb-4 text-xs font-semibold text-[var(--dash-text)]">Included with your membership</h3><ul className="space-y-3.5">{selectedPlan.features.map(feature => <li key={feature} className="flex items-start gap-2.5 text-xs leading-relaxed text-[var(--dash-muted)]"><Check size={14} className="mt-0.5 shrink-0 text-[var(--dash-subtle)]" /><span>{feature}</span></li>)}</ul></div>
                        <div className="flex items-center gap-3 border-t border-[var(--dash-border)] bg-[var(--dash-panel-raised)] px-6 py-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-panel)] text-sm font-medium text-[var(--dash-text)]">{user.email.charAt(0).toUpperCase()}</span><div className="min-w-0"><p className="dash-eyebrow mb-1">Billed to</p><p className="break-all text-xs text-[var(--dash-text)]">{user.email}</p></div></div>
                    </motion.section>
                    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.06 }} className="dash-panel p-6">
                        <h2 className="text-lg font-semibold tracking-tight text-[var(--dash-text)]">Payment summary</h2>
                        <p className="mt-1.5 text-xs text-[var(--dash-muted)]">{selectedPlan.name} · {selectedPlan.period.replace('/', '')}</p>
                        <dl className="mb-6 mt-6 space-y-3 text-xs"><div className="flex justify-between gap-4"><dt className="text-[var(--dash-muted)]">Base price</dt><dd className="tabular-nums text-[var(--dash-text)]">€{basePrice.toFixed(2)}</dd></div><div className="flex justify-between gap-4"><dt className="text-[var(--dash-muted)]">Tax (8%)</dt><dd className="tabular-nums text-[var(--dash-text)]">€{taxAmount.toFixed(2)}</dd></div><div className="flex justify-between gap-4 border-t border-[var(--dash-border)] pt-4 text-sm font-semibold"><dt className="text-[var(--dash-text)]">Total</dt><dd className="tabular-nums text-[var(--dash-text)]">€{totalAmount.toFixed(2)}</dd></div></dl>
                        {error && <p role="alert" className="mb-5 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-panel-raised)] p-3 text-xs leading-relaxed text-[var(--dash-error)]">{error}</p>}
                        <div className="relative w-full overflow-hidden rounded-lg">
                                    {isLifetime ? (
                                        <PayPalButtons
                                            style={{ shape: "rect", height: 55, layout: "vertical", color: resolvedTheme === "dark" ? "white" : "black" }}
                                            forceReRender={[totalAmount, user?.id, resolvedTheme]}
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
                                            style={{ shape: "rect", height: 55, layout: "vertical", color: resolvedTheme === "dark" ? "white" : "black" }}
                                            forceReRender={[selectedPlan.name, user?.id, resolvedTheme]}
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
                        <div className="mt-4 border-t border-[var(--dash-border)] pt-4"><p className="flex items-center justify-center gap-2 text-xs text-[var(--dash-muted)]"><ShieldCheck size={14} />Payment handled by PayPal</p><p className="mt-2 text-center text-[11px] leading-relaxed text-[var(--dash-subtle)]">You will be redirected to PayPal to complete your payment.</p></div>
                    </motion.section>
                </div>
            </div>
        </div>
    </PayPalScriptProvider>;
};

export default Payment;
