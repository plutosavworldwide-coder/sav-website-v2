import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, UserCheck, UserX, Crown, Shield, Settings,
    ChevronDown, ChevronRight, Lock, Unlock, Calendar,
    CreditCard, Clock, Search, X, Check, AlertTriangle,
    RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { WEEKS, setAccessOverride } from '../lib/accessEngine';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        standard: 0,
        extended: 0,
        lifetime: 0
    });

    // Fetch all users
    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
            return;
        }

        setUsers(data || []);

        // Calculate stats
        const activeCount = data?.filter(u => u.subscription_status === 'active').length || 0;
        const standardCount = data?.filter(u => u.subscription_type === 'standard').length || 0;
        const extendedCount = data?.filter(u => u.subscription_type === 'extended').length || 0;
        const lifetimeCount = data?.filter(u => u.subscription_type === 'lifetime').length || 0;

        setStats({
            total: data?.length || 0,
            active: activeCount,
            inactive: (data?.length || 0) - activeCount,
            standard: standardCount,
            extended: extendedCount,
            lifetime: lifetimeCount
        });

        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users by search
    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate days since subscription start
    const daysSinceStart = (startDate) => {
        if (!startDate) return 0;
        const start = new Date(startDate);
        const now = new Date();
        return Math.floor((now - start) / (1000 * 60 * 60 * 24));
    };

    // Update user subscription
    const updateUserSubscription = async (userId, updates) => {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (error) {
            console.error('Error updating user:', error);
            return;
        }

        fetchUsers();
        if (selectedUser?.id === userId) {
            setSelectedUser(prev => ({ ...prev, ...updates }));
        }
    };

    // Stat Card Component
    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-white dark:bg-[#1A1D25] border border-neutral-200 dark:border-white/[0.06] rounded-xl p-4 flex items-center gap-4 shadow-sm dark:shadow-none">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-zinc-900 dark:text-white" />
            </div>
            <div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">{label}</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen text-zinc-900 dark:text-white p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-zinc-500 text-sm">Manage users, subscriptions, and content access</p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-50 dark:bg-white/5 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/10 rounded-lg text-sm transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard icon={Users} label="Total Users" value={stats.total} color="bg-indigo-500/20" />
                <StatCard icon={UserCheck} label="Active" value={stats.active} color="bg-emerald-500/20" />
                <StatCard icon={UserX} label="Inactive" value={stats.inactive} color="bg-rose-500/20" />
                <StatCard icon={CreditCard} label="Standard" value={stats.standard} color="bg-blue-500/20" />
                <StatCard icon={Crown} label="Extended" value={stats.extended} color="bg-amber-500/20" />
                <StatCard icon={Shield} label="Lifetime" value={stats.lifetime} color="bg-purple-500/20" />
            </div>

            {/* Main Content */}
            <div className="flex gap-6">
                {/* User List */}
                <div className="flex-1 bg-white dark:bg-[#09090b] border border-neutral-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                    {/* Search */}
                    <div className="p-4 border-b border-neutral-200 dark:border-white/[0.06]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-lg text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50"
                            />
                        </div>
                    </div>

                    {/* User Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-50 dark:bg-white/[0.02] border-b border-neutral-200 dark:border-white/[0.06]">
                                <tr>
                                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">User</th>
                                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Status</th>
                                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Plan</th>
                                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">TradingView</th>
                                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Next Renewal</th>
                                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-white/[0.03]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                                            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className={`hover:bg-zinc-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-zinc-50 dark:bg-white/[0.04]' : ''}`}
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                                                        {user.email?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-zinc-900 dark:text-white">{user.full_name || 'No name'}</div>
                                                        <div className="text-xs text-zinc-500">{user.email}</div>
                                                    </div>
                                                    {user.role === 'admin' && (
                                                        <Shield className="w-4 h-4 text-amber-400" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.subscription_status === 'active'
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${user.subscription_status === 'active' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-zinc-500 dark:bg-zinc-400'}`} />
                                                    {user.subscription_status || 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-zinc-600 dark:text-zinc-300 capitalize">
                                                    {user.subscription_type || '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.tradingview_username ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-mono text-indigo-600 dark:text-indigo-400">
                                                            {user.tradingview_username}
                                                        </span>
                                                        {user.updated_at && (
                                                            <span className="text-[10px] text-zinc-500 mt-0.5" title={new Date(user.updated_at).toLocaleString()}>
                                                                {new Date(user.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-zinc-500 dark:text-zinc-600 italic">Not set</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {(() => {
                                                    if (user.subscription_type === 'lifetime') {
                                                        return (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                                                Lifetime
                                                            </span>
                                                        );
                                                    }

                                                    if (!user.subscription_end_date) {
                                                        return <span className="text-sm text-zinc-500 dark:text-zinc-400">—</span>;
                                                    }

                                                    const endDate = new Date(user.subscription_end_date);
                                                    const now = new Date();
                                                    // Check if overdue (end date is in the past AND not lifetime)
                                                    const isOverdue = endDate < now;

                                                    // Format: "Feb 18, 2026"
                                                    const dateStr = endDate.toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    });

                                                    if (isOverdue) {
                                                        return (
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                                    {dateStr}
                                                                </span>
                                                                <span className="text-[10px] uppercase tracking-wider font-bold text-rose-500/80">
                                                                    Overdue
                                                                </span>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <span className="text-sm text-zinc-600 dark:text-zinc-300">
                                                            {dateStr}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedUser(user);
                                                    }}
                                                >
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* User Detail Panel */}
                <AnimatePresence>
                    {selectedUser && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="w-[400px] bg-white dark:bg-[#09090b] border border-neutral-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shrink-0 shadow-lg dark:shadow-none"
                        >
                            {/* Header */}
                            <div className="p-5 border-b border-neutral-200 dark:border-white/[0.06] flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-zinc-900 dark:text-white">{selectedUser.full_name || 'User Details'}</h3>
                                    <p className="text-xs text-zinc-500">{selectedUser.email}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4 text-zinc-400" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-5 space-y-6">
                                {/* Status Control */}
                                <div>
                                    <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Account Status</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateUserSubscription(selectedUser.id, { subscription_status: 'active' })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${selectedUser.subscription_status === 'active'
                                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                                : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/10'
                                                }`}
                                        >
                                            Active
                                        </button>
                                        <button
                                            onClick={() => updateUserSubscription(selectedUser.id, { subscription_status: 'suspended' })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${selectedUser.subscription_status === 'suspended'
                                                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                                : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/10'
                                                }`}
                                        >
                                            Suspended
                                        </button>
                                    </div>
                                </div>

                                {/* Subscription Type */}
                                <div>
                                    <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Subscription Type</label>
                                    <select
                                        value={selectedUser.subscription_type || ''}
                                        onChange={(e) => updateUserSubscription(selectedUser.id, { subscription_type: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500/50"
                                    >
                                        <option value="">No subscription</option>
                                        <option value="standard">Standard (€80/month)</option>
                                        <option value="extended">Extended (€140/2 months)</option>
                                        <option value="lifetime">Lifetime (€800)</option>
                                    </select>
                                </div>

                                {/* Start Date */}
                                <div>
                                    <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Subscription Start Date</label>
                                    <input
                                        type="date"
                                        value={selectedUser.subscription_start_date?.split('T')[0] || ''}
                                        onChange={(e) => updateUserSubscription(selectedUser.id, { subscription_start_date: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500/50"
                                    />
                                </div>

                                {/* Week Access Controls */}
                                <div>
                                    <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-3">Content Access Overrides</label>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                        {WEEKS.map((weekId) => (
                                            <WeekAccessControl
                                                key={weekId}
                                                weekId={weekId}
                                                userId={selectedUser.id}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// Week Access Control Component
const WeekAccessControl = ({ weekId, userId }) => {
    const [override, setOverride] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOverride();
    }, [weekId, userId]);

    const fetchOverride = async () => {
        const { data } = await supabase
            .from('access_overrides')
            .select('state')
            .eq('user_id', userId)
            .eq('week_id', weekId)
            .single();

        setOverride(data?.state || null);
        setLoading(false);
    };

    const handleOverrideChange = async (state) => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        await setAccessOverride(userId, weekId, state, user?.id);
        setOverride(state);
        setLoading(false);
    };

    const weekNumber = weekId.replace('week-', '');

    return (
        <div className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-white/[0.02] rounded-lg border border-zinc-200 dark:border-white/[0.04]">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Week {weekNumber}</span>
            <div className="flex gap-1">
                <button
                    onClick={() => handleOverrideChange(null)}
                    disabled={loading}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${override === null
                        ? 'bg-zinc-200 dark:bg-zinc-500/20 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-500/30'
                        : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-white/10'
                        }`}
                >
                    Auto
                </button>
                <button
                    onClick={() => handleOverrideChange('open')}
                    disabled={loading}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${override === 'open'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-white/10'
                        }`}
                >
                    <Unlock className="w-3 h-3" />
                </button>
                <button
                    onClick={() => handleOverrideChange('locked')}
                    disabled={loading}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${override === 'locked'
                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-white/10'
                        }`}
                >
                    <Lock className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

export default AdminPage;
