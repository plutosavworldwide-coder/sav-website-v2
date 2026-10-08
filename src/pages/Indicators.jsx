import { useEffect, useState } from 'react';
import { ArrowUpRight, BarChart3, Check, CheckCircle2, Copy, Loader2, Search, User, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LibraryHeading } from '../components/DashboardLibrary';
import { useDashboard } from '../components/DashboardContext.jsx';
import { supabase } from '../lib/supabase';

const scripts = [
    { name: 'Sav FX Dynamic Premium & Discount', image: '/dynamic-premium-discount.png', type: 'V2.0 Core' },
    { name: 'Sav FX Gordian Paradox Cycles', image: '/gordian-paradox-cycles.png', type: 'V2.0 Core' },
    { name: 'Sav Fx PDA Finder', image: '/pda-finder.png', type: 'V2.0 Core' },
    { name: 'SAV FX Bias Check List', image: null, type: 'V2.0 Core' }
];
const scriptsUrl = 'https://www.tradingview.com/u/TheRealSavFx/#published-scripts';
const inputClass = 'w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3.5 py-3 text-sm text-[var(--dash-text)] placeholder:text-[var(--dash-subtle)] outline-none transition-colors focus:border-[var(--dash-accent)] disabled:opacity-50';
const formatPlan = plan => plan ? plan.replace(/_/g, ' ').replace(/\b\w/g, character => character.toUpperCase()) : 'Not available';

export default function Indicators() {
    const { user, profile, membership, refresh } = useDashboard();
    const [tradingviewUsername, setTradingviewUsername] = useState(profile?.tradingview_username || '');
    const [inputUsername, setInputUsername] = useState(profile?.tradingview_username || '');
    const [editing, setEditing] = useState(!profile?.tradingview_username);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [saving, setSaving] = useState(false);
    const [usernameError, setUsernameError] = useState('');
    const [message, setMessage] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [copyError, setCopyError] = useState('');
    const [retryCount, setRetryCount] = useState(0);
    const isAdmin = membership.isAdmin && user?.email === 'savfxtrading@gmail.com';

    useEffect(() => {
        const username = profile?.tradingview_username || '';
        setTradingviewUsername(username);
        setInputUsername(username);
        setEditing(!username);
    }, [profile?.tradingview_username]);

    useEffect(() => {
        if (!isAdmin) return;
        let cancelled = false;
        const fetchUsers = async () => {
            setUsersLoading(true);
            setFetchError('');
            try {
                const { data, error } = await supabase.rpc('get_admin_tv_users');
                if (error) throw error;
                if (!cancelled) setAllUsers(data || []);
            } catch {
                if (!cancelled) setFetchError('TradingView access records could not be loaded. Please try again.');
            } finally {
                if (!cancelled) setUsersLoading(false);
            }
        };
        fetchUsers();
        return () => { cancelled = true; };
    }, [isAdmin, retryCount]);

    useEffect(() => {
        if (!copiedId) return;
        const timeout = setTimeout(() => setCopiedId(null), 2000);
        return () => clearTimeout(timeout);
    }, [copiedId]);

    const handleCopy = async (text, id) => {
        setCopyError('');
        try { await navigator.clipboard.writeText(text); setCopiedId(id); }
        catch { setCopyError('The username could not be copied. Select and copy it manually.'); }
    };

    const handleSubmitUsername = event => {
        event.preventDefault();
        setUsernameError('');
        if (!inputUsername.trim()) { setUsernameError('Enter your TradingView username.'); return; }
        setShowConfirmation(true);
    };

    const handleConfirmUsername = async () => {
        if (saving) return;
        setSaving(true);
        setUsernameError('');
        try {
            const { data: { user: authenticatedUser }, error: authError } = await supabase.auth.getUser();
            if (authError || !authenticatedUser || authenticatedUser.id !== user?.id) throw new Error('Please sign in again before saving your username.');
            const { data, error } = await supabase.from('profiles').update({ tradingview_username: inputUsername.trim() }).eq('id', authenticatedUser.id).select('tradingview_username').single();
            if (error || !data) throw new Error('Your username could not be saved. Please try again.');
            setTradingviewUsername(data.tradingview_username);
            setShowConfirmation(false);
            setEditing(false);
            setMessage('Your TradingView username has been saved.');
            if (isAdmin) setRetryCount(value => value + 1);
            await refresh();
        } catch (error) {
            setUsernameError(error.message || 'Your username could not be saved. Please try again.');
        } finally { setSaving(false); }
    };

    const filteredUsers = allUsers.filter(member => `${member.full_name || ''} ${member.tradingview_username || ''}`.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!membership.canEnterDashboard) return <div className="dash-page"><section className="dash-panel mx-auto max-w-lg rounded-2xl p-6"><h1 className="text-2xl font-semibold text-[var(--dash-text)]">Trading tools</h1><p className="mt-3 text-sm text-[var(--dash-muted)]">An active membership is required to access the indicator suite.</p><Link to="/choose-plan" className="dash-primary mt-6">View plans</Link></section></div>;

    return <div className="dash-page custom-scrollbar h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-[1440px]">
            <LibraryHeading eyebrow="Trading tools" title="Indicator suite" description="Your Sav FX scripts and TradingView account connection."><a href={scriptsUrl} target="_blank" rel="noopener noreferrer" className="dash-secondary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium">Open TradingView<ArrowUpRight size={14} /></a></LibraryHeading>
            <section className="dash-panel mb-7 overflow-hidden rounded-2xl">
                <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div className="flex items-start gap-3"><span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-panel-raised)] text-[var(--dash-accent)]"><User size={17} /></span><div><h2 className="text-sm font-semibold text-[var(--dash-text)]">TradingView connection</h2><p className="mt-1 text-xs leading-relaxed text-[var(--dash-muted)]">{tradingviewUsername ? <>Username on file: <span className="font-mono text-[var(--dash-text)]">{tradingviewUsername}</span></> : 'Add your username so your indicator access can be assigned.'}</p></div></div>
                    {tradingviewUsername && !editing && <button type="button" className="dash-secondary" onClick={() => { setInputUsername(tradingviewUsername); setEditing(true); setShowConfirmation(false); setMessage(''); }}>Edit username</button>}
                </div>
                {editing && <div className="border-t border-[var(--dash-border)] p-5">
                    {showConfirmation ? <div className="max-w-xl"><h3 className="text-sm font-semibold text-[var(--dash-text)]">Confirm your username</h3><p className="mt-2 text-xs leading-relaxed text-[var(--dash-muted)]">Check that this matches your TradingView account exactly.</p><p className="my-4 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-4 py-3 font-mono text-sm text-[var(--dash-text)]">{inputUsername.trim()}</p><div className="flex flex-wrap gap-3"><button type="button" onClick={handleConfirmUsername} disabled={saving} className="dash-primary">{saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}{saving ? 'Saving…' : 'Confirm & save'}</button><button type="button" onClick={() => setShowConfirmation(false)} disabled={saving} className="dash-secondary">Go back</button></div></div>
                        : <form onSubmit={handleSubmitUsername} className="max-w-xl"><label htmlFor="tradingview-username" className="mb-2 block text-xs font-medium text-[var(--dash-muted)]">TradingView username</label><div className="flex flex-col gap-3 sm:flex-row"><input id="tradingview-username" type="text" value={inputUsername} onChange={event => setInputUsername(event.target.value)} autoComplete="off" maxLength={100} placeholder="Your TradingView username" className={inputClass} required /><button type="submit" className="dash-primary shrink-0">Continue<ArrowUpRight size={14} /></button>{tradingviewUsername && <button type="button" onClick={() => { setEditing(false); setUsernameError(''); }} className="dash-secondary" aria-label="Cancel username change"><X size={15} /></button>}</div><p className="mt-3 text-xs leading-relaxed text-[var(--dash-subtle)]">Saving a username lets the team identify your account. Script permissions are managed on TradingView.</p></form>}
                    {usernameError && <p role="alert" className="mt-4 text-xs text-[var(--dash-error)]">{usernameError}</p>}
                </div>}
                {message && <p role="status" className="border-t border-[var(--dash-border)] px-5 py-3 text-xs text-[var(--dash-success)]">{message}</p>}
            </section>
            <div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-sm font-semibold text-[var(--dash-text)]">Available scripts</h2><span className="text-xs text-[var(--dash-subtle)]">{scripts.length} tools</span></div>
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                {scripts.map(script => <a key={script.name} href={scriptsUrl} target="_blank" rel="noopener noreferrer" className="dash-panel group flex flex-col overflow-hidden rounded-2xl transition-colors hover:border-[var(--dash-muted)]"><div className="aspect-video overflow-hidden border-b border-[var(--dash-border)] bg-[var(--dash-panel-raised)]">{script.image ? <img src={script.image} alt={`${script.name} chart preview`} className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100" loading="lazy" /> : <div className="flex h-full items-center justify-center"><BarChart3 size={34} strokeWidth={1.2} className="text-[var(--dash-subtle)]" /></div>}</div><div className="flex flex-1 flex-col p-4"><p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--dash-subtle)]">{script.type}</p><h3 className="text-sm font-medium leading-relaxed text-[var(--dash-text)]">{script.name}</h3><span className="mt-4 inline-flex items-center gap-1 text-xs text-[var(--dash-accent)]">View scripts<ArrowUpRight size={13} /></span></div></a>)}
            </div>
            {isAdmin && <section className="mt-9"><div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-lg font-semibold tracking-tight text-[var(--dash-text)]">TradingView access records</h2><p className="mt-1 text-xs text-[var(--dash-muted)]">Member usernames and membership information.</p></div><div className="relative sm:w-72"><label htmlFor="tv-member-search" className="sr-only">Search member usernames</label><Search size={14} className="absolute left-3.5 top-3.5 text-[var(--dash-subtle)]" /><input id="tv-member-search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search members…" className={`${inputClass} pl-10`} /></div></div>
                {copyError && <p role="alert" className="mb-3 text-xs text-[var(--dash-error)]">{copyError}</p>}
                <div className="dash-panel overflow-hidden rounded-2xl">
                    {usersLoading ? <p role="status" className="flex items-center gap-2 p-6 text-sm text-[var(--dash-muted)]"><Loader2 size={16} className="animate-spin" />Loading member records…</p> : fetchError ? <div className="p-6"><p role="alert" className="text-xs text-[var(--dash-error)]">{fetchError}</p><button type="button" onClick={() => setRetryCount(value => value + 1)} className="dash-secondary mt-4">Try again</button></div> : filteredUsers.length === 0 ? <p className="p-6 text-sm text-[var(--dash-muted)]">{searchQuery ? 'No members match your search.' : 'No TradingView usernames have been submitted.'}</p> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="border-b border-[var(--dash-border)] bg-[var(--dash-panel-raised)] text-[10px] uppercase tracking-wider text-[var(--dash-subtle)]"><tr><th className="px-5 py-3 font-medium">Member</th><th className="px-5 py-3 font-medium">TradingView username</th><th className="px-5 py-3 font-medium">Plan</th><th className="px-5 py-3 font-medium">Membership</th><th className="px-5 py-3 font-medium">Access until</th></tr></thead><tbody>{filteredUsers.map(member => {
                        const expired = member.subscription_type !== 'lifetime' && member.subscription_end_date && new Date(member.subscription_end_date).getTime() <= Date.now();
                        const status = expired ? 'Expired' : member.subscription_status ? formatPlan(member.subscription_status) : 'Not available';
                        return <tr key={member.id} className="border-b border-[var(--dash-border)] transition-colors last:border-0 hover:bg-[var(--dash-panel-raised)]"><td className="px-5 py-4 font-medium text-[var(--dash-text)]">{member.full_name || 'Unnamed member'}</td><td className="px-5 py-4 text-[var(--dash-muted)]"><div className="flex items-center gap-2"><span className="select-all font-mono">{member.tradingview_username || '—'}</span>{member.tradingview_username && <button type="button" onClick={() => handleCopy(member.tradingview_username, member.id)} aria-label={`Copy ${member.tradingview_username}`} className="rounded p-1.5 text-[var(--dash-subtle)] transition-colors hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)]">{copiedId === member.id ? <Check size={13} className="text-[var(--dash-success)]" /> : <Copy size={13} />}</button>}</div></td><td className="px-5 py-4 text-[var(--dash-muted)]">{formatPlan(member.subscription_type)}</td><td className={`px-5 py-4 ${status === 'Active' ? 'text-[var(--dash-success)]' : status === 'Expired' ? 'text-[var(--dash-error)]' : 'text-[var(--dash-muted)]'}`}>{status}</td><td className="px-5 py-4 text-[var(--dash-muted)]">{member.subscription_type === 'lifetime' ? 'Lifetime' : member.subscription_end_date ? new Date(member.subscription_end_date).toLocaleDateString() : 'Not available'}</td></tr>;
                    })}</tbody></table></div>}
                </div>
            </section>}
        </div>
    </div>;
}
