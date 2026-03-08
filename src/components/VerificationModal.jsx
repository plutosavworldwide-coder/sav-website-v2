import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

const VerificationModal = ({ userId, onSubmitted }) => {
    const [paypalName, setPaypalName] = useState('');
    const [paypalEmail, setPaypalEmail] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!paypalName || !transactionId) {
            setError("Please fill in all required fields.");
            setIsSubmitting(false);
            return;
        }

        try {
            const verificationInfo = {
                paypal_name: paypalName,
                paypal_email: paypalEmail,
                transaction_id: transactionId,
                submitted_at: new Date().toISOString()
            };

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    verification_status: 'pending',
                    paypal_verification_info: verificationInfo,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (updateError) throw updateError;

            // Notify parent to change state to 'pending' view
            onSubmitted();

        } catch (err) {
            console.error("Error submitting verification:", err);
            setError("Failed to submit verification. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Lock size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Verification Required</h2>
                        <p className="text-zinc-400 text-sm">Please provide your PayPal payment details to access the dashboard.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                            PayPal Name *
                        </label>
                        <input
                            type="text"
                            value={paypalName}
                            onChange={(e) => setPaypalName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                            PayPal Email (Optional)
                        </label>
                        <input
                            type="email"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            placeholder="e.g. john@example.com"
                            className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                            Transaction ID / Receipt No. *
                        </label>
                        <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="e.g. 9HA123456789"
                            className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <span>Submit for Review</span>
                                <CheckCircle size={18} />
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-zinc-600 mt-2">
                        Your access will be pending approval (usually 24 hours).
                    </p>
                </form>
            </div>
        </div>
    );
};

export default VerificationModal;
