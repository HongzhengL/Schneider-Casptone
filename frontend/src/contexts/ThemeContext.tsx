import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    isDark: boolean;
    setTheme: (theme: Theme) => void;
    setDark: (value: boolean) => void;
    toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialTheme(): Theme {
    try {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') return stored;
    } catch {}

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches === true;
    return prefersDark ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        try {
            localStorage.setItem('theme', theme);
        } catch {}
    }, [theme]);

    const value = useMemo<ThemeContextValue>(
        () => ({
            theme,
            isDark: theme === 'dark',
            setTheme,
            setDark: (v: boolean) => setTheme(v ? 'dark' : 'light'),
            toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
        }),
        [theme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
    return ctx;
}

