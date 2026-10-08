import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { LayoutGrid, BookOpen, Video, Radio, Layers, BarChart3, CalendarDays, Shield, ArrowUpRight, LogOut, Menu, X, Settings, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useDashboard } from './DashboardContext';
import { useTheme } from './ThemeProvider';
import ThemeToggle from './ThemeToggle';

const learningLinks = [
    { label: 'Overview', href: '/dashboard', icon: LayoutGrid },
    { label: 'Time Price Energy', href: '/dashboard/time-price-energy-intro', icon: BookOpen },
    { label: 'Session archives', href: '/dashboard/weekly-livestreams', icon: Radio },
    { label: 'Gordian Paradox', href: '/dashboard/gordian-paradox', icon: Layers },
    { label: 'Daily reviews', href: '/daily-reviews', icon: Video },
];
const workspaceLinks = [
    { label: 'Trading tools', href: '/indicators', icon: BarChart3 },
    { label: 'Live sessions', href: '/scheduled-sessions', icon: CalendarDays },
];

export function AppSidebar({ children }) {
    const { user, profile, membership } = useDashboard();
    const { resolvedTheme } = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const [error, setError] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const name = profile?.full_name?.trim() || user?.email?.split('@')[0] || 'Member';
    const initials = name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
    const groups = [
        ...(membership.canWatchCourses ? [{ label: 'Your learning', links: learningLinks }] : []),
        { label: 'Workspace', links: workspaceLinks.filter(link => membership.canWatchCourses || link.href === '/indicators') },
        ...(membership.isAdmin ? [{ label: 'Management', links: [{ label: 'Member access', href: '/admin', icon: Shield }] }] : []),
    ];
    const currentLink = [...learningLinks, ...workspaceLinks, { label: 'Account', href: '/dashboard/profile' }, { label: 'Member access', href: '/admin' }]
        .find(link => location.pathname === link.href);
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
    const sidebar = (
        <div className="dash-sidebar-inner">
            <Link to="/dashboard" className="dash-brand" onClick={() => setMobileOpen(false)} aria-label="Sav FX dashboard">
                <span className="dash-brand-mark" aria-hidden="true"><span /><span /><span /></span>
                <span><strong>SAV <span>FX</span></strong><small>Member workspace</small></span>
            </Link>
            <nav className="dash-navigation" aria-label="Dashboard navigation">
                {groups.map(group => (
                    <div className="dash-nav-group" key={group.label}>
                        <p className="dash-eyebrow">{group.label}</p>
                        {group.links.map(({ label, href, icon: Icon }) => {
                            const active = location.pathname === href;
                            return <Link key={href} to={href} aria-current={active ? 'page' : undefined} className={`dash-nav-link ${active ? 'is-active' : ''}`} onClick={() => setMobileOpen(false)}>
                                <Icon size={18} strokeWidth={1.7} /><span>{label}</span>{active && <ChevronRight size={13} className="dash-nav-arrow" />}
                            </Link>;
                        })}
                    </div>
                ))}
            </nav>
            {membership.canWatchCourses && <a className="dash-community-card" href="https://discord.com/invite/BHkUtCUxzE" target="_blank" rel="noreferrer noopener">
                <div><span className="dash-eyebrow">Beyond the classroom</span><ArrowUpRight size={15} /></div>
                <strong>Your trading community</strong><p>Study together. Share perspective.</p>
            </a>}
            <div className="dash-sidebar-account">
                <Link to="/dashboard/profile" className="dash-account-link" onClick={() => setMobileOpen(false)}>
                    <span className="dash-avatar">{initials}</span><span className="dash-account-name"><strong>{name}</strong><small>{membership.label}</small></span><Settings size={15} />
                </Link>
                <button className="dash-signout" onClick={signOut} disabled={signingOut}><LogOut size={15} />{signingOut ? 'Signing out…' : 'Sign out'}</button>
                {error && <p role="alert" className="dash-error text-xs">{error}</p>}
            </div>
        </div>
    );
    return (
        <div className={`dashboard-shell ${resolvedTheme}`}>
            <aside className="dash-sidebar">{sidebar}</aside>
            <div className="dash-main">
                <header className="dash-topbar">
                    <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
                        <Dialog.Trigger asChild><button className="dash-mobile-trigger dash-icon-button" aria-label="Open dashboard navigation"><Menu size={20} /></button></Dialog.Trigger>
                        <Dialog.Portal><Dialog.Overlay className="dash-drawer-overlay" />
                            <Dialog.Content className={`dashboard-theme ${resolvedTheme} dash-drawer`}>
                                <Dialog.Title className="sr-only">Dashboard navigation</Dialog.Title><Dialog.Description className="sr-only">Explore courses, tools and your account.</Dialog.Description>
                                <Dialog.Close asChild><button className="dash-drawer-close dash-icon-button" aria-label="Close dashboard navigation"><X size={19} /></button></Dialog.Close>{sidebar}
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>
                    <div className="dash-breadcrumb"><span>Workspace</span><ChevronRight size={13} /><strong>{currentLink?.label || 'Dashboard'}</strong></div>
                    <div className="dash-topbar-right"><span className="dash-membership-status"><i />{membership.isAdmin ? 'Administrator' : 'Membership active'}</span><ThemeToggle /><span className="dash-topbar-divider" /><Link to="/dashboard/profile" className="dash-avatar dash-avatar-small" aria-label="Open account">{initials}</Link></div>
                </header>
                <main className="dash-content" id="dashboard-content">{children}</main>
            </div>
        </div>
    );
}
export const Logo = () => <Link to="/dashboard" className="dash-brand"><strong>SAV FX</strong></Link>;
export const LogoIcon = () => <Link to="/dashboard" className="dash-avatar" aria-label="Sav FX dashboard">SF</Link>;
