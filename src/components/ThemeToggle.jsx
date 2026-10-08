import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    return <button type="button" className="dash-icon-button dash-theme-toggle" aria-label={label} title={label} onClick={() => setTheme(isDark ? 'light' : 'dark')}>
        {isDark ? <Sun size={17} strokeWidth={1.7} /> : <Moon size={17} strokeWidth={1.7} />}
    </button>;
}
