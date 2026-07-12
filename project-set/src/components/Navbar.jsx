import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import useAuth from '../hooks/useAuth';

// Public links render for everyone. "Make a complaint" is behind PrivateRoute,
// so an unauthenticated tap lands on /login and returns here after sign in.
const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/make-complaint', label: 'Make a complaint', end: false },
];

const linkClass = ({ isActive }) =>
    [
        'rounded-control px-3 py-2 text-sm font-medium outline-none',
        'transition-colors duration-150 ease-[var(--ease-out)]',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        isActive ? 'text-ink' : 'text-muted hover:text-ink',
    ].join(' ');

const Navbar = () => {
    const { user, loading, logOut } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    const handleSignOut = async () => {
        setSigningOut(true);
        try {
            await logOut();
            navigate('/');
        } catch {
            // Sign out rarely fails; if it does, keep the user where they are
            // rather than pretending they were logged out.
            setSigningOut(false);
        }
    };

    // Shared button shapes so desktop and mobile stay identical.
    const signOutButton = (
        <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="h-9 rounded-control border border-border px-3 text-sm font-medium text-ink outline-none transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.98] hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50"
        >
            {signingOut ? 'Logging out...' : 'Log out'}
        </button>
    );

    const signedOutButtons = (
        <>
            <Link
                to="/login"
                onClick={closeMenu}
                className="flex h-9 items-center rounded-control px-3 text-sm font-medium text-ink outline-none transition-colors duration-150 ease-[var(--ease-out)] hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
                Log in
            </Link>
            <Link
                to="/register"
                onClick={closeMenu}
                className="flex h-9 items-center rounded-control bg-accent px-4 text-sm font-medium text-accent-ink outline-none transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
                Sign up
            </Link>
        </>
    );

    // While auth resolves, reserve the space so the bar does not jump (CLS).
    const authActions = loading ? (
        <span aria-hidden="true" className="h-9 w-24 rounded-control bg-surface" />
    ) : user ? (
        signOutButton
    ) : (
        signedOutButtons
    );

    return (
        <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-sm">
            <nav
                aria-label="Primary"
                className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"
            >
                <Link
                    to="/"
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 rounded-control outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                    <span
                        aria-hidden="true"
                        className="grid h-9 w-9 place-items-center rounded-control bg-accent text-sm font-bold tracking-tight text-accent-ink"
                    >
                        AB
                    </span>
                    <span className="text-base font-semibold tracking-tight text-ink">
                        Anti Bully Protocol
                    </span>
                </Link>

                {/* Desktop: links + auth on one line. */}
                <div className="hidden items-center gap-1 md:flex">
                    {navLinks.map((link) => (
                        <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                            {link.label}
                        </NavLink>
                    ))}
                    <span className="mx-2 h-5 w-px bg-border" aria-hidden="true" />
                    {authActions}
                </div>

                {/* Mobile: single toggle. */}
                <button
                    type="button"
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-expanded={menuOpen}
                    aria-controls="mobile-menu"
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    className="grid h-11 w-11 place-items-center rounded-control text-ink outline-none transition-colors duration-150 hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg md:hidden"
                >
                    <span aria-hidden="true" className="relative block h-4 w-5">
                        <span
                            className={`absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ease-[var(--ease-out)] motion-reduce:transition-none ${
                                menuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0'
                            }`}
                        />
                        <span
                            className={`absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-1/2 rounded-full bg-current transition-opacity duration-200 motion-reduce:transition-none ${
                                menuOpen ? 'opacity-0' : 'opacity-100'
                            }`}
                        />
                        <span
                            className={`absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ease-[var(--ease-out)] motion-reduce:transition-none ${
                                menuOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0'
                            }`}
                        />
                    </span>
                </button>
            </nav>

            {/* Mobile panel. Rendered only when open; links close it on tap. */}
            {menuOpen && (
                <div id="mobile-menu" className="border-t border-border bg-bg md:hidden">
                    <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                onClick={closeMenu}
                                className={linkClass}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                        <div className="mt-2 flex items-center gap-2 border-t border-border pt-3">
                            {authActions}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
