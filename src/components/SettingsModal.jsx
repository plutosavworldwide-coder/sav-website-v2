import { X, User, Bell, Shield, CreditCard, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const SettingsModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Mock user state
    const [formData, setFormData] = useState({
        firstName: 'Alex',
        lastName: 'Morgan',
        email: 'alex@savfx.com',
        notifications: {
            email: true,
            push: false,
            marketing: false
        }
    });

    if (!isOpen) return null;

    const handleSave = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1000);
    };

    const tabs = [
        { id: 'profile', icon: User, label: 'Profile' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'security', icon: Shield, label: 'Security' },
        { id: 'billing', icon: CreditCard, label: 'Billing' },
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-2xl bg-[#1E212B] border border-[#2A2D35] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]"
                >
                    {/* Sidebar */}
                    <div className="w-full md:w-1/3 border-r border-[#2A2D35] p-4 space-y-2 bg-[#171920]">
                        <div className="flex items-center justify-between md:hidden mb-4">
                            <h2 className="text-lg font-semibold text-white">Settings</h2>
                            <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <h2 className="hidden md:block text-xl font-semibold text-white mb-6 px-3">Settings</h2>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-[#2563EB] text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col relative bg-[#1E212B]">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors hidden md:block"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8 flex-1 overflow-y-auto">
                            {activeTab === 'profile' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h3 className="text-lg font-medium text-white mb-4">Profile Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src="https://ui-avatars.com/api/?name=Alex+M&background=0F1117&color=fff&size=128"
                                                alt="Profile"
                                                className="w-16 h-16 rounded-full border-2 border-[#2A2D35]"
                                            />
                                            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors">
                                                Change Avatar
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1.5">First Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    className="w-full bg-[#12151d] border border-[#2A2D35] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    className="w-full bg-[#12151d] border border-[#2A2D35] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-[#12151d] border border-[#2A2D35] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h3 className="text-lg font-medium text-white mb-4">Notification Preferences</h3>
                                    <div className="space-y-4">
                                        {[
                                            { id: 'email', label: 'Email Notifications', desc: 'Receive daily summaries and alerts.' },
                                            { id: 'push', label: 'Push Notifications', desc: 'Real-time alerts on your device.' },
                                            { id: 'marketing', label: 'Marketing Emails', desc: 'Updates on new features and offers.' }
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-[#171920] border border-[#2A2D35]">
                                                <div>
                                                    <div className="text-sm font-medium text-white">{item.label}</div>
                                                    <div className="text-xs text-gray-500">{item.desc}</div>
                                                </div>
                                                <button
                                                    onClick={() => setFormData(prev => ({ ...prev, notifications: { ...prev.notifications, [item.id]: !prev.notifications[item.id] } }))}
                                                    className={`w-11 h-6 rounded-full transition-colors relative ${formData.notifications[item.id] ? 'bg-blue-600' : 'bg-gray-600'}`}
                                                >
                                                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.notifications[item.id] ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h3 className="text-lg font-medium text-white mb-4">Security Settings</h3>
                                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-6">
                                        <div className="flex gap-3">
                                            <Shield className="w-5 h-5 text-orange-500 shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-medium text-orange-400">Two-Factor Authentication</h4>
                                                <p className="text-xs text-orange-400/70 mt-1">We recommend enabling 2FA for account safety.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="w-full py-2.5 border border-[#2A2D35] rounded-lg text-sm font-medium hover:bg-white/5 transition-colors text-white">
                                        Change Password
                                    </button>
                                </div>
                            )}

                            {activeTab === 'billing' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h3 className="text-lg font-medium text-white mb-4">Billing & Plan</h3>
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Current Plan</div>
                                                <div className="text-2xl font-bold text-white">Pro Trader</div>
                                            </div>
                                            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">ACTIVE</span>
                                        </div>
                                        <div className="text-sm text-gray-400 mb-6">Renews on Feb 12, 2026</div>
                                        <button className="w-full bg-white text-black py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">Manage Subscription</button>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-[#2A2D35] bg-[#1E212B] flex justify-between items-center">
                            {showSuccess && (
                                <span className="text-green-500 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                    <Check className="w-4 h-4" /> Changes saved successfully
                                </span>
                            )}
                            <div className="ml-auto flex gap-3">
                                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SettingsModal;
