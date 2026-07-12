import { useCallback, useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContext';

const STORAGE_KEY = 'theme';

// Read the persisted choice, if any. Anything other than the two known values
// is treated as "no choice" so a stray key can't wedge the UI.
const storedTheme = () => {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return value === 'light' || value === 'dark' ? value : null;
    } catch {
        // Private-mode / disabled storage: fall through to the system preference.
        return null;
    }
};

const systemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

// Saved choice wins; first-time visitors follow their OS. The inline script in
// index.html already stamped this onto <html>, so this only needs to agree.
const initialTheme = () => storedTheme() ?? systemTheme();

const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(initialTheme);

    // Keep the attribute the CSS reads in sync with state.
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    // While the user hasn't made an explicit choice, keep tracking the OS.
    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (event) => {
            if (storedTheme() === null) {
                setThemeState(event.matches ? 'dark' : 'light');
            }
        };
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, []);

    const setTheme = useCallback((next) => {
        setThemeState(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // Persisting is best-effort; the choice still applies this session.
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }, [theme, setTheme]);

    return (
        <ThemeContext value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext>
    );
};

export default ThemeProvider;
