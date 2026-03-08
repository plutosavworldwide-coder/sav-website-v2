import { motion } from 'framer-motion';
import { User, Shield, CreditCard, LogOut, Award, Settings, Bell, ChevronRight, Zap, Activity, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

const Profile = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full bg-black text-white font-sans overflow-hidden selection:bg-white/20">
            <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
                
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-7xl mx-auto flex flex-col gap-6 p-6 md:p-10 pb-20"
                >
                    {/* Header */}
                    <div className="flex flex-col gap-1 mb-6">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-zinc-500 hover:text-white mb-4 transition-colors w-fit font-semibold text-sm tracking-tight"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back to Dashboard</span>
                        </button>
                        
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                Account Management
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tighter text-white">
                            Profile.
                        </h1>
                        <p className="text-zinc-500 text-lg font-medium tracking-tight mt-2">
                            Manage your subscription and trading preferences.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Profile Card & Stats (Left Column - 2 span) */}
                        <div className="lg:col-span-2 space-y-8 flex flex-col">
                            
                            {/* Hero Profile Bento */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="relative overflow-hidden p-8 md:p-12 lg:p-14 rounded-[3rem] bg-[#101010] border border-white/[0.05] shadow-2xl"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

                                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
                                    <div className="relative group shrink-0">
                                        <div className="absolute -inset-1 bg-white/[0.05] rounded-full opacity-0 blur-lg transition duration-500 group-hover:opacity-100"></div>
                                        <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] bg-black border border-white/10 p-2 overflow-hidden shadow-2xl">
                                            <img src="https://ui-avatars.com/api/?name=Alex+M&background=0F1117&color=fff&size=256" className="w-full h-full rounded-[2rem] object-cover grayscale opacity-90 group-hover:grayscale-0 transition-all duration-500" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-[6px] border-[#101010] w-10 h-10 rounded-full z-20 shadow-lg"></div>
                                    </div>

                                    <div className="text-center md:text-left flex-1 flex flex-col justify-center h-full pt-2">
                                        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                                            <h2 className="text-4xl lg:text-5xl font-semibold text-white tracking-tight">Alex Morgan</h2>
                                            <span className="inline-flex items-center gap-1.5 bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                                                <Award className="w-4 h-4" /> Pro Trader
                                            </span>
                                        </div>
                                        <p className="text-zinc-500 font-medium mb-10 flex flex-col md:flex-row items-center gap-3">
                                            <span>alex.morgan@savfx.com</span>
                                            <span className="hidden md:inline text-zinc-700 font-bold">•</span>
                                            <span>Member since 2024</span>
                                        </p>

                                        <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-auto">
                                            <button className="px-8 py-4 bg-white text-black rounded-full font-semibold text-sm hover:bg-zinc-200 active:scale-95 transition-all shadow-xl">
                                                Edit Profile
                                            </button>
                                            <button className="px-8 py-4 bg-black text-white rounded-full font-semibold text-sm hover:bg-white/5 active:scale-95 transition-all border border-white/10 shadow-sm">
                                                Public Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 0.5 }}
                                    className="p-8 lg:p-10 rounded-[2.5rem] bg-[#101010] border border-white/[0.05] hover:border-white/20 hover:bg-[#121212] transition-all shadow-lg group"
                                >
                                    <div className="flex items-center justify-between mb-8 lg:mb-12">
                                        <div className="w-14 h-14 rounded-[1.5rem] bg-black border border-white/5 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors shadow-inner">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-md tracking-wider">+2.5%</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Win Rate</p>
                                        <div className="text-5xl lg:text-6xl font-semibold text-white tracking-tighter">68.5%</div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="p-8 lg:p-10 rounded-[2.5rem] bg-[#101010] border border-white/[0.05] hover:border-white/20 hover:bg-[#121212] transition-all shadow-lg group"
                                >
                                    <div className="flex items-center justify-between mb-8 lg:mb-12">
                                        <div className="w-14 h-14 rounded-[1.5rem] bg-black border border-white/5 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors shadow-inner">
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold text-white bg-white/10 px-3 py-1.5 rounded-md tracking-wider">Top 5%</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Profit Factor</p>
                                        <div className="text-5xl lg:text-6xl font-semibold text-white tracking-tighter">2.41</div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Sidebar Settings - Apple Style */}
                        <div className="col-span-1 h-full">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="bg-[#101010] border border-white/[0.05] rounded-[3rem] flex flex-col overflow-hidden h-full shadow-2xl"
                            >
                                <div className="p-8 lg:p-10 pb-6">
                                    <h3 className="text-3xl font-semibold tracking-tight text-white mb-2">Settings.</h3>
                                    <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">Preferences</p>
                                </div>
                                <div className="px-6 flex-1 flex flex-col gap-2 pb-6">
                                    {[
                                        { icon: User, label: "Information", desc: "Name, Email, Phone" },
                                        { icon: Shield, label: "Security", desc: "2FA, Password" },
                                        { icon: CreditCard, label: "Billing & Plans", desc: "Manage subscription" },
                                        { icon: Bell, label: "Notifications", desc: "Email, Push, SMS" },
                                    ].map((item, i) => (
                                        <button key={i} className="w-full flex items-center gap-5 p-4 rounded-3xl hover:bg-white/5 border border-transparent hover:border-white/[0.02] transition-all text-left group">
                                            <div className="w-12 h-12 rounded-[1.25rem] bg-black border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:border-white/20 transition-all shadow-inner shrink-0">
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                                                <div className="font-semibold text-white tracking-tight">{item.label}</div>
                                                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest truncate group-hover:text-zinc-500 transition-colors">{item.desc}</div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-white transition-colors" />
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="p-6 border-t border-white/[0.02] bg-[#0a0a0a]">
                                    <button className="w-full flex items-center justify-center gap-3 p-5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all font-semibold text-sm shadow-lg active:scale-95">
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
