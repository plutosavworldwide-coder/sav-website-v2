import { User, Settings, Smartphone, LogOut, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserMenu = ({ isOpen, onClose, onOpenSettings }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute bottom-full left-0 w-full mb-2 z-50 px-2"
            >
                <div className="bg-[#1E212B] border border-[#2A2D35] rounded-xl shadow-2xl overflow-hidden">
                    {/* Primary Actions */}
                    <div className="p-1.5 space-y-0.5">
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left group">
                            <User className="w-4 h-4 text-gray-500 group-hover:text-white" />
                            <span>My profile <span className="text-gray-500">@alex</span></span>
                        </button>
                        <button
                            onClick={() => {
                                onOpenSettings();
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left group"
                        >
                            <Settings className="w-4 h-4 text-gray-500 group-hover:text-white" />
                            <span>Account settings</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left group">
                            <Smartphone className="w-4 h-4 text-gray-500 group-hover:text-white" />
                            <span>Device management</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left group">
                            <LogOut className="w-4 h-4 text-gray-500 group-hover:text-white" />
                            <span>Sign out</span>
                        </button>
                    </div>

                    {/* Switch Account Section */}
                    <div className="border-t border-[#2A2D35] p-2 bg-[#171920]">
                        <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Switch Account</div>
                        <div className="space-y-0.5 mt-1">
                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-left">
                                <img src="https://ui-avatars.com/api/?name=Alex+M&background=0F1117&color=fff&size=64" className="w-8 h-8 rounded-full" alt="Alex" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-white truncate">Alex Morgan</div>
                                    <div className="text-xs text-blue-400 truncate">alex@savfx.com</div>
                                </div>
                                <div className="bg-[#2563EB] w-2 h-2 rounded-full" />
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-left opacity-50 hover:opacity-100 transition-all">
                                <img src="https://ui-avatars.com/api/?name=Caitlyn+K&background=2A2D35&color=fff&size=64" className="w-8 h-8 rounded-full grayscale" alt="Caitlyn" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-400 truncate">Caitlyn King</div>
                                    <div className="text-xs text-gray-600 truncate">caitlyn@stripe.com</div>
                                </div>
                                <div className="border border-gray-600 w-3 h-3 rounded-full" />
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 mt-2 px-3 py-2 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-dashed border-[#2A2D35] hover:border-gray-500">
                                <LogOut className="w-3 h-3" /> Sign out of all accounts
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default UserMenu;
