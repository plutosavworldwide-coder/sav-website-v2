import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const validTheme = value => ['light', 'dark', 'system'].includes(value);
const systemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export function ThemeProvider({ children, defaultTheme = 'dark', storageKey = 'vite-ui-theme' }) {
    const [theme, updateTheme] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return validTheme(saved) ? saved : defaultTheme;
        } catch { return defaultTheme; }
    });
    const [system, setSystem] = useState(systemTheme);
    const resolvedTheme = theme === 'system' ? system : theme;

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const update = () => setSystem(media.matches ? 'dark' : 'light');
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolvedTheme);
    }, [resolvedTheme]);

    const setTheme = nextTheme => {
        if (!validTheme(nextTheme)) return;
        try { localStorage.setItem(storageKey, nextTheme); } catch { /* Preference still works for this session. */ }
        updateTheme(nextTheme);
    };

    return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
}
