import { useEffect, useState } from 'react';
import { Check, CreditCard, Loader2, LogOut, Mail, ShieldCheck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LibraryHeading } from '../components/DashboardLibrary';
import { useDashboard } from '../components/DashboardContext.jsx';
import { supabase } from '../lib/supabase';

const formatDate = value => {
    if (!value) return 'Not available';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Not available' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};
const formatStatus = value => value ? value.replace(/_/g, ' ').replace(/^\w/, character => character.toUpperCase()) : 'Not available';

export default function Profile() {
    const navigate = useNavigate();
    const { user, profile, membership, refresh } = useDashboard();
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [saving, setSaving] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const displayName = profile?.full_name?.trim() || user?.email?.split('@')[0] || 'Member';
    const initials = displayName.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
    const hasChanges = fullName.trim() !== (profile?.full_name || '').trim();

    useEffect(() => { setFullName(profile?.full_name || ''); }, [profile?.full_name]);

    const saveProfile = async event => {
        event.preventDefault();
        if (saving || !hasChanges) return;
        const nextName = fullName.trim();
        setError('');
        setMessage('');
        if (!nextName) { setError('Enter your name before saving.'); return; }
        setSaving(true);
        try {
            const { data: { user: authenticatedUser }, error: authError } = await supabase.auth.getUser();
            if (authError || !authenticatedUser || authenticatedUser.id !== user?.id) throw new Error('Please sign in again before saving your profile.');
            const { data, error: updateError } = await supabase.from('profiles').update({ full_name: nextName }).eq('id', authenticatedUser.id).select('full_name').single();
            if (updateError || !data) throw new Error('Your profile could not be saved. Please try again.');
            setFullName(data.full_name);
            setMessage('Your profile has been saved.');
            await refresh();
        } catch (saveError) {
            setError(saveError.message || 'Your profile could not be saved. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const signOut = async () => {
        setSigningOut(true);
        setError('');
        try {
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) throw signOutError;
            navigate('/signing', { replace: true });
        } catch {
            setError('Could not sign out. Please try again.');
            setSigningOut(false);
        }
    };

    if (!user || !profile) return <div className="dash-page"><div role="status" className="dash-panel flex items-center gap-3 rounded-2xl p-6 text-sm text-[var(--dash-muted)]"><Loader2 size={18} className="animate-spin" />Loading your account…</div></div>;

    return <div className="dash-page custom-scrollbar h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-[1200px]">
            <LibraryHeading eyebrow="Your account" title="Account settings" description="Manage your personal information and review your membership." />
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                <section className="dash-panel overflow-hidden rounded-2xl">
                    <div className="flex items-center gap-4 border-b border-[var(--dash-border)] p-6"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel-raised)] text-lg font-medium text-[var(--dash-accent)]">{initials}</span><div className="min-w-0"><h2 className="truncate text-lg font-semibold tracking-tight text-[var(--dash-text)]">{displayName}</h2><p className="mt-1 break-all text-xs text-[var(--dash-muted)]">{user.email}</p></div></div>
                    <form onSubmit={saveProfile} className="p-6">
                        <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-[var(--dash-text)]"><User size={16} className="text-[var(--dash-subtle)]" />Personal information</div>
                        <div className="space-y-5">
                            <div><label htmlFor="profile-name" className="mb-2 block text-xs font-medium text-[var(--dash-muted)]">Full name</label><input id="profile-name" autoComplete="name" value={fullName} onChange={event => { setFullName(event.target.value); setMessage(''); setError(''); }} required maxLength={100} disabled={saving} className="w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3.5 py-3 text-sm text-[var(--dash-text)] outline-none transition-colors focus:border-[var(--dash-accent)] disabled:opacity-60" /></div>
                            <div><label htmlFor="profile-email" className="mb-2 block text-xs font-medium text-[var(--dash-muted)]">Email address</label><div className="relative"><Mail size={15} className="absolute left-3.5 top-3.5 text-[var(--dash-subtle)]" /><input id="profile-email" value={user.email || ''} readOnly className="w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-panel-raised)] py-3 pl-10 pr-3.5 text-sm text-[var(--dash-muted)] outline-none" /></div><p className="mt-2 text-xs leading-relaxed text-[var(--dash-subtle)]">This email identifies your signed-in account.</p></div>
                        </div>
                        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-[var(--dash-border)] pt-5"><button type="submit" disabled={saving || !hasChanges || !fullName.trim()} className="dash-primary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50">{saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}{saving ? 'Saving…' : 'Save changes'}</button>{message && <p role="status" className="text-xs text-[var(--dash-success)]">{message}</p>}</div>
                        {error && <p role="alert" className="mt-4 text-xs leading-relaxed text-[var(--dash-error)]">{error}</p>}
                    </form>
                </section>
                <div className="space-y-5">
                    <section className="dash-panel overflow-hidden rounded-2xl"><div className="flex items-center gap-2 border-b border-[var(--dash-border)] px-5 py-4 text-sm font-semibold text-[var(--dash-text)]"><CreditCard size={16} className="text-[var(--dash-subtle)]" />Membership</div><div className="p-5"><p className="dash-eyebrow mb-2">Your plan</p><h2 className="text-xl font-semibold tracking-tight text-[var(--dash-text)]">{membership.label}</h2><dl className="mt-5 space-y-4 text-xs"><div className="flex justify-between gap-4"><dt className="text-[var(--dash-muted)]">Status</dt><dd className="font-medium text-[var(--dash-text)]">{membership.isAdmin ? 'Administrator' : formatStatus(profile.subscription_status)}</dd></div><div className="flex justify-between gap-4"><dt className="text-[var(--dash-muted)]">Started</dt><dd className="text-[var(--dash-text)]">{formatDate(profile.subscription_start_date)}</dd></div><div className="flex justify-between gap-4"><dt className="text-[var(--dash-muted)]">Access until</dt><dd className="text-[var(--dash-text)]">{profile.subscription_type === 'lifetime' ? 'Lifetime access' : formatDate(profile.subscription_end_date)}</dd></div><div className="flex justify-between gap-4 border-t border-[var(--dash-border)] pt-4"><dt className="text-[var(--dash-muted)]">Account created</dt><dd className="text-[var(--dash-text)]">{formatDate(user.created_at)}</dd></div></dl></div></section>
                    <section className="dash-panel rounded-2xl p-5"><div className="flex items-center gap-2 text-sm font-semibold text-[var(--dash-text)]"><ShieldCheck size={16} className="text-[var(--dash-subtle)]" />Account access</div><p className="mt-3 text-xs leading-relaxed text-[var(--dash-muted)]">Your learning history and membership are linked to this account.</p><button type="button" onClick={signOut} disabled={signingOut || saving} className="dash-secondary mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium disabled:opacity-50"><LogOut size={14} />{signingOut ? 'Signing out…' : 'Sign out'}</button></section>
                </div>
            </div>
        </div>
    </div>;
}
