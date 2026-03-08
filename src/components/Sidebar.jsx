import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, Settings, HelpCircle, Search, LogOut } from 'lucide-react';
import { useState } from 'react';
import SettingsModal from './SettingsModal';
import UserMenu from './UserMenu';

const Sidebar = () => {
    const location = useLocation();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const navItems = [
        { icon: Home, label: 'Home', path: '/dashboard' },
        { icon: BarChart2, label: 'Indicators', path: '/indicators' },
    ];

    return (
        <div className="hidden md:flex flex-col w-72 h-screen fixed top-0 left-0 bg-[#12151d] border-r border-[#2A2D35] z-40 font-sans text-base text-[#9b9b9b] select-none">

            {/* Workspace Switcher (Notion Style) */}
            <div
                className="h-14 flex items-center gap-3 px-4 hover:bg-white/[0.04] cursor-pointer transition-colors m-1.5 rounded-lg"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
                <div className="w-6 h-6 rounded-[6px] bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xs text-white font-bold shadow-sm">
                    S
                </div>
                <div className="flex-1 font-medium text-[#d3d3d3] truncate text-lg">Sav Fx</div>
                <div className="text-xs bg-white/[0.06] border border-white/[0.05] rounded px-1.5 py-0.5 min-w-[20px] text-center text-[#9b9b9b]">
                    v1
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col px-3 py-2 space-y-1">
                <div className="flex items-center gap-3.5 px-3 py-2 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors group">
                    <Search className="w-5 h-5 text-[#9b9b9b] group-hover:text-[#d3d3d3]" />
                    <span className="font-medium group-hover:text-[#d3d3d3]">Search</span>
                    <span className="ml-auto text-xs text-[#5a5a5a] group-hover:text-[#7f7f7f] bg-white/[0.05] px-1.5 rounded">⌘K</span>
                </div>
                <div
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-3.5 px-3 py-2 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors group"
                >
                    <Settings className="w-5 h-5 text-[#9b9b9b] group-hover:text-[#d3d3d3]" />
                    <span className="font-medium group-hover:text-[#d3d3d3]">Settings</span>
                </div>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
                <div className="px-3 py-1.5 mb-1.5 text-xs font-bold text-[#6b6b6b] hover:text-[#8f8f8f] cursor-default transition-colors uppercase tracking-wider">
                    General
                </div>
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={`flex items-center gap-3.5 px-3 py-2 rounded-lg transition-colors group ${isActive ? 'bg-white/[0.06] text-[#e0e0e0]' : 'hover:bg-white/[0.04] text-[#9b9b9b]'}`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#e0e0e0]' : 'text-[#9b9b9b] group-hover:text-[#d3d3d3]'}`} />
                                <span className={`font-medium text-[15px] ${isActive ? 'text-[#e0e0e0]' : 'group-hover:text-[#d3d3d3]'}`}>{item.label}</span>
                            </Link>
                        )
                    })}
                </div>

                <div className="px-3 py-1.5 mb-1.5 mt-8 text-xs font-bold text-[#6b6b6b] hover:text-[#8f8f8f] cursor-default transition-colors uppercase tracking-wider">
                    Favorites
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-3.5 px-3 py-2 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors text-[#9b9b9b] hover:text-[#d3d3d3]">
                        <span className="w-5 h-5 flex items-center justify-center text-sm">📄</span>
                        <span className="font-medium text-[15px]">Trading Journal</span>
                    </div>
                    <div className="flex items-center gap-3.5 px-3 py-2 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors text-[#9b9b9b] hover:text-[#d3d3d3]">
                        <span className="w-5 h-5 flex items-center justify-center text-sm">🚀</span>
                        <span className="font-medium text-[15px]">Q1 Goals</span>
                    </div>
                </div>
            </div>

            {/* Footer / User */}
            <div className="px-3 py-3 border-t border-[#2A2D35]">
                <div className="flex items-center gap-3.5 px-3 py-2 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors group">
                    <HelpCircle className="w-5 h-5 text-[#9b9b9b] group-hover:text-[#d3d3d3]" />
                    <span className="font-medium text-[15px] group-hover:text-[#d3d3d3]">Support</span>
                </div>
            </div>
            <UserMenu
                isOpen={isUserMenuOpen}
                onClose={() => setIsUserMenuOpen(false)}
                onOpenSettings={() => setIsSettingsOpen(true)}
            />
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
};

export default Sidebar;
