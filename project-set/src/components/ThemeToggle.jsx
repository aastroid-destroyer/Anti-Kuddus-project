import { Moon, Sun } from '@phosphor-icons/react';
import useTheme from '../hooks/useTheme';

// Icon-only control, so it carries an aria-label and swaps that label with the
// state. The 44px hit area meets the touch-target minimum even though the glyph
// is smaller. Only the icon crossfades; nothing moves, so no reduced-motion
// branch is needed here.
const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-pressed={isDark}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="grid h-11 w-11 place-items-center rounded-control text-ink outline-none transition-[background-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.98] hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg md:h-9 md:w-9"
        >
            {isDark ? (
                <Sun aria-hidden="true" size={20} weight="bold" />
            ) : (
                <Moon aria-hidden="true" size={20} weight="bold" />
            )}
        </button>
    );
};

export default ThemeToggle;
